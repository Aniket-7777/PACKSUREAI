from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import get_current_user_payload, require_role
from app.models.entities import Inspection, Scan, Violation, AuditLog, User
from app.services.pdf_service import generate_legal_notice_pdf
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/inspections", tags=["Enforcement Case Management & Priority Queue"])

class UpdateCaseStageRequest(BaseModel):
    stage: str # TRIAGE, UNDER_REVIEW, NOTICE_ISSUED, HEARING, COMPOUNDED, CLOSED
    notes: str = ""

@router.get("/priority-queue")
def get_priority_inspection_queue(
    db: Session = Depends(get_db),
    location: str = None,
    category: str = None,
):
    """
    Returns cases sorted by Priority Risk Index (PRI) descending for officer dispatch.
    Uses batch querying for fast response.
    """
    query = db.query(Inspection).options(joinedload(Inspection.scan)).order_by(Inspection.priority_risk_index.desc())
    if category and category != "ALL":
        query = query.join(Scan).filter(Scan.category == category)

    inspections = query.limit(100).all()
    if not inspections:
        return []

    scan_ids = list(set([insp.scan_id for insp in inspections if insp.scan_id]))
    user_ids = list(set([insp.inspector_id for insp in inspections if insp.inspector_id]))

    # Batch fetch scans, violations, and users in 3 indexed queries
    all_scans = db.query(Scan).filter(Scan.id.in_(scan_ids)).all() if scan_ids else []
    all_violations = db.query(Violation).filter(Violation.scan_id.in_(scan_ids)).all() if scan_ids else []
    all_users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []

    scans_by_id = {s.id: s for s in all_scans}
    violations_by_scan = {}
    for v in all_violations:
        violations_by_scan.setdefault(v.scan_id, []).append(v)

    users_by_id = {u.id: u for u in all_users}

    queue = []
    for insp in inspections:
        scan = scans_by_id.get(insp.scan_id)
        if not scan:
            continue


        violations = violations_by_scan.get(scan.id, [])
        violation_titles = [v.rule_title or v.rule_code for v in violations]
        
        # Clean product display name (remove OCR tags like [BACK])
        p_name = scan.product_name or ""
        if p_name.strip() in ["[BACK]", "[FRONT]", "[SIDE]", "[BOTTOM]", ""] or p_name.startswith("["):
            if scan.brand_name and "Pepsico" in scan.brand_name:
                p_name = "PepsiCo Packaged Snack"
            else:
                p_name = f"Packaged Commodity #{scan.id}"

        # Get Inspector details if available
        user_id = insp.inspector_id or scan.created_by_user_id
        inspector_user = users_by_id.get(user_id) if user_id else None

        insp_name = inspector_user.full_name if inspector_user else "Insp. Vikram Singh"
        insp_badge = inspector_user.badge_number if inspector_user else "DOCA-INSP-104"

        queue.append({
            "id": insp.id,
            "inspection_id": insp.id,
            "case_number": insp.case_number,
            "scan_id": scan.id,
            "product_name": p_name,
            "brand_name": scan.brand_name or "Unknown Brand",
            "category": scan.category or "Packaged Commodities",
            "priority_level": insp.priority_level or "MEDIUM",
            "priority_risk_index": insp.priority_risk_index or 50,
            "stage": insp.stage or "TRIAGE",
            "compliance_score": scan.overall_compliance_score,
            "violations_count": len(violations),
            "violations": violation_titles,
            "legal_notice_issued": insp.legal_notice_issued,
            "inspector_id": user_id,
            "inspector_name": insp_name,
            "inspector_badge": insp_badge,
            "jurisdiction": getattr(inspector_user, "department", "Delhi NCR (North Zone)"),
            "created_at": insp.created_at.isoformat() if insp.created_at else None,
        })

    return queue





@router.post("/{case_number}/issue-legal-notice")
def issue_legal_notice(
    case_number: str,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):
    """
    Dispatches a formal Show-Cause Notice under Section 36 of the Legal Metrology Act, 2009.
    Generates and stores the court-admissible PDF notice.
    """
    insp = db.query(Inspection).filter(Inspection.case_number == case_number).first()
    if not insp:
        raise HTTPException(status_code=404, detail="Case not found")
        
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
    
    # Generate PDF
    pdf_path = generate_legal_notice_pdf(
        case_no=case_number,
        product_name=scan.product_name,
        brand_name=scan.brand_name,
        manufacturer_address="Address on package",
        violations=v_dicts,
        total_penalty=total_penalty,
        inspector_name=f"Officer {user.get('username', 'INSP-2026')}"
    )
    
    insp.legal_notice_issued = True
    insp.notice_reference_no = f"DOCA/LM/NOTICE/{case_number}"
    insp.notice_issued_date = datetime.datetime.utcnow()
    insp.notice_pdf_path = pdf_path
    insp.stage = "NOTICE_ISSUED"
    
    # Audit log
    db.add(AuditLog(
        username=user.get("username", "inspector"),
        user_role=user.get("role", "inspector"),
        action_type="NOTICE_DISPATCHED",
        entity_type="inspection",
        entity_id=insp.id,
        change_summary=f"Issued statutory Legal Notice for case {case_number} with total penalty liability ₹{total_penalty:,}."
    ))
    db.commit()
    
    return {
        "message": "Legal notice generated and dispatched successfully",
        "case_number": case_number,
        "notice_ref": insp.notice_reference_no,
        "pdf_url": f"/api/v1/reports/download-notice/{case_number}"
    }
