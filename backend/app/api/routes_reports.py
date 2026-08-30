import os
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import REPORT_DIR
from app.core.security import get_current_user_payload
from app.models.entities import Inspection, Scan, Violation, ExtractedField, AuditLog, User
from app.services.pdf_service import generate_legal_notice_pdf, generate_statutory_inspection_report_pdf

router = APIRouter(prefix="/reports", tags=["Reports & Notice PDFs"])

from app.core.date_utils import parse_date_range

@router.get("/products")
def get_products_report_inventory(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    date_range: Optional[str] = None
):
    """
    Returns every scanned product with statutory report generation status,
    compliance scores, violation counts, and dossier readiness.
    """
    query = db.query(Scan).order_by(Scan.created_at.desc())

    start_d, end_d = parse_date_range(date_range)
    if start_d:
        query = query.filter(Scan.created_at >= start_d)
    if end_d:
        query = query.filter(Scan.created_at <= end_d)

    if location and location not in ["all", "All Jurisdictions (Pan-India)"]:
        loc_clean = location.split("(")[0].strip().lower()
        users = db.query(User).all()
        matched = [u.id for u in users if loc_clean in (u.department or "").lower() or loc_clean in (u.full_name or "").lower()]
        if matched:
            query = query.filter((Scan.created_by_user_id.in_(matched)) | (Scan.created_by_user_id == None))

    scans = query.all()
    all_inspections = {i.scan_id: i for i in db.query(Inspection).all()}
    all_violations = db.query(Violation).all()
    all_users = {u.id: u for u in db.query(User).all()}
    
    violations_by_scan = {}
    for v in all_violations:
        violations_by_scan.setdefault(v.scan_id, []).append(v)
        
    results = []
    for s in scans:
        insp = all_inspections.get(s.id)
        viols = violations_by_scan.get(s.id, [])
        scanner = all_users.get(s.created_by_user_id)
        auditor = all_users.get(insp.inspector_id) if insp and insp.inspector_id else None
        
        case_no = insp.case_number if insp else f"DOCA-CASE-2026-{s.id:04d}"
        clean_case = case_no.replace('/', '_')
        report_pdf_filename = f"Statutory_Report_SKU_{s.id:04d}_{clean_case}.pdf"
        report_pdf_path = REPORT_DIR / report_pdf_filename
        has_generated_report = report_pdf_path.exists()
        
        # Check notice PDF
        notice_pdf_filename = f"Legal_Notice_{clean_case}.pdf"
        has_notice_pdf = (REPORT_DIR / notice_pdf_filename).exists() or (insp.legal_notice_issued if insp else False)
        
        results.append({
            "scan_id": s.id,
            "id": s.id,
            "case_number": case_no,
            "product_name": s.product_name or f"Packaged Commodity SKU #{s.id:03d}",
            "brand_name": s.brand_name or "Unknown Brand",
            "category": s.category or "Packaged Commodities",
            "barcode": s.barcode or "8901030992147",
            "compliance_score": s.overall_compliance_score if s.overall_compliance_score is not None else 100.0,
            "risk_score": s.risk_score if s.risk_score is not None else (100 - int(s.overall_compliance_score or 100)),
            "stage": insp.stage if insp else ("CERTIFIED_COMPLIANT" if (s.overall_compliance_score or 100) >= 90 else "UNDER_REVIEW"),
            "violations_count": len(viols),
            "violations": [v.rule_title or v.rule_code for v in viols],
            "report_generated": has_generated_report or bool(insp and insp.stage == "CERTIFIED_COMPLIANT"),
            "notice_generated": has_notice_pdf,
            "report_pdf_url": f"/api/v1/reports/download-product-report/{s.id}",
            "notice_pdf_url": f"/api/v1/reports/download-notice/{case_no}" if has_notice_pdf else None,
            "scanned_at": s.created_at.isoformat() if s.created_at else None,
            "inspector_name": auditor.full_name if auditor else (scanner.full_name if scanner else "Aniket Kumar"),
            "inspector_badge": auditor.badge_number if auditor else (scanner.badge_number if scanner else "DOCA-INSP-2026"),
            "scanned_by_name": scanner.full_name if scanner else "Insp. Priya Sharma",
            "front_image_url": s.front_image_url,
            "back_image_url": s.back_image_url
        })
        
    return results

@router.post("/generate-for-product/{scan_id}")
def generate_product_report(
    scan_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):
    """
    Generates and stores the official Statutory Packaging Inspection Report PDF for a product,
    logging it into the tamper-proof AuditLog.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Product scan not found")
        
    insp = db.query(Inspection).filter(Inspection.scan_id == scan_id).first()
    case_no = insp.case_number if insp else f"DOCA-CASE-2026-{scan.id:04d}"
    
    violations = db.query(Violation).filter(Violation.scan_id == scan_id).all()
    v_dicts = [
        {
            "rule_code": v.rule_code,
            "rule_title": v.rule_title,
            "detected_evidence": v.detected_evidence,
            "expected_requirement": v.expected_requirement,
            "penalty_estimate_inr": v.penalty_estimate_inr
        }
        for v in violations
    ]
    
    fields = db.query(ExtractedField).filter(ExtractedField.scan_id == scan_id).all()
    fields_dict = {f.field_key: {"value": f.extracted_value or f.human_corrected_value} for f in fields}
    
    officer_name = user.get("username", "aniket.kumar")
    officer_role = user.get("role", "inspector")
    
    pdf_path = generate_statutory_inspection_report_pdf(
        scan_id=scan.id,
        case_no=case_no,
        product_name=scan.product_name or "Packaged Commodity",
        brand_name=scan.brand_name or "Registered Brand",
        category=scan.category or "Packaged Commodities",
        barcode=scan.barcode or "N/A",
        compliance_score=scan.overall_compliance_score or 100.0,
        risk_score=scan.risk_score or 0,
        stage=insp.stage if insp else "UNDER_REVIEW",
        extracted_fields=fields_dict,
        violations=v_dicts,
        inspector_name=f"Officer {officer_name}",
        inspector_badge=f"DOCA-{officer_role.upper()}-2026"
    )
    
    # Store in AuditLog
    db.add(AuditLog(
        username=officer_name,
        user_role=officer_role,
        action_type="REPORT_GENERATED",
        entity_type="scan_report",
        entity_id=scan.id,
        change_summary=f"Generated and archived Official Statutory Inspection Dossier for '{scan.product_name}' (Case: {case_no})."
    ))
    db.commit()
    
    return {
        "message": f"Official Statutory Inspection Dossier generated for {scan.product_name}",
        "scan_id": scan.id,
        "case_number": case_no,
        "report_pdf_url": f"/api/v1/reports/download-product-report/{scan.id}",
        "generated_at": datetime.datetime.utcnow().isoformat()
    }

@router.get("/download-product-report/{scan_id}")
def download_product_report_pdf(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Product scan not found")
        
    insp = db.query(Inspection).filter(Inspection.scan_id == scan_id).first()
    case_no = insp.case_number if insp else f"DOCA-CASE-2026-{scan.id:04d}"
    clean_case = case_no.replace('/', '_')
    filename = f"Statutory_Report_SKU_{scan_id:04d}_{clean_case}.pdf"
    pdf_path = REPORT_DIR / filename
    
    if not pdf_path.exists():
        # Generate on the fly
        violations = db.query(Violation).filter(Violation.scan_id == scan_id).all()
        v_dicts = [
            {
                "rule_code": v.rule_code,
                "rule_title": v.rule_title,
                "detected_evidence": v.detected_evidence,
                "expected_requirement": v.expected_requirement,
                "penalty_estimate_inr": v.penalty_estimate_inr
            }
            for v in violations
        ]
        fields = db.query(ExtractedField).filter(ExtractedField.scan_id == scan_id).all()
        fields_dict = {f.field_key: {"value": f.extracted_value or f.human_corrected_value} for f in fields}
        generate_statutory_inspection_report_pdf(
            scan_id=scan.id,
            case_no=case_no,
            product_name=scan.product_name or "Packaged Commodity",
            brand_name=scan.brand_name or "Registered Brand",
            category=scan.category or "Packaged Commodities",
            barcode=scan.barcode or "N/A",
            compliance_score=scan.overall_compliance_score or 100.0,
            risk_score=scan.risk_score or 0,
            stage=insp.stage if insp else "UNDER_REVIEW",
            extracted_fields=fields_dict,
            violations=v_dicts
        )
        
    return FileResponse(
        path=str(pdf_path),
        filename=filename,
        media_type="application/pdf"
    )

@router.get("/download-notice/{case_number}")
def download_notice_pdf(case_number: str, db: Session = Depends(get_db)):
    insp = db.query(Inspection).filter(Inspection.case_number == case_number).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Case not found")
        
    filename = f"Legal_Notice_{case_number.replace('/', '_')}.pdf"
    pdf_path = REPORT_DIR / filename
    
    if not pdf_path.exists():
        # Generate on the fly if not already generated
        scan = insp.scan
        violations = db.query(Violation).filter(Violation.scan_id == scan.id).all()
        v_dicts = [
            {
                "rule_code": v.rule_code,
                "rule_title": v.rule_title,
                "detected_evidence": v.detected_evidence,
                "expected_requirement": v.expected_requirement,
                "penalty_estimate_inr": v.penalty_estimate_inr
            }
            for v in violations
        ]
        total_penalty = sum(v.get("penalty_estimate_inr", 25000) for v in v_dicts)
        generate_legal_notice_pdf(
            case_no=case_number,
            product_name=scan.product_name,
            brand_name=scan.brand_name,
            manufacturer_address="Address on record",
            violations=v_dicts,
            total_penalty=total_penalty
        )
        
    return FileResponse(
        path=str(pdf_path),
        filename=filename,
        media_type="application/pdf"
    )
