import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import UPLOAD_DIR
from app.core.security import get_current_user_payload
from app.models.entities import Scan, ExtractedField, Violation, Inspection, AuditLog, User
from app.services.image_conversion import normalize_image_to_rgb_jpeg
from app.services.image_quality import check_image_quality
from app.services.barcode_service import lookup_barcode, decode_barcode_from_image_bytes
from app.services.ocr_service import extract_declarations_from_images
from app.services.rule_engine import evaluate_compliance
from app.services.risk_engine import calculate_priority_risk_index
from pydantic import BaseModel

router = APIRouter(prefix="/scans", tags=["Scanning & Compliance Engine"])

class FieldCorrectionRequest(BaseModel):
    field_key: str
    corrected_value: str
    notes: Optional[str] = "Inspector manual verification"

@router.post("/process-packaging")
async def process_packaging_scan(
    front_image: Optional[UploadFile] = File(None),
    back_image: Optional[UploadFile] = File(None),
    side_image: Optional[UploadFile] = File(None),
    bottom_image: Optional[UploadFile] = File(None),
    barcode: Optional[str] = Form(None),
    category: Optional[str] = Form("Food & Grocery"),
    api_key: Optional[str] = Form(None),
    inspector_id: Optional[int] = Form(None),
    inspector_name: Optional[str] = Form(None),
    inspector_badge: Optional[str] = Form(None),
    inspector_username: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):

    """
    Enterprise Ingestion & Compliance Pipeline:
    1. Normalizes images (AVIF/HEIC/WebP/PNG/JPEG -> Standard RGB JPEG).
    2. Runs Image Quality Pre-Checks (Laplacian blur, glare ratio, illumination).
    3. Queries Barcode Registry for reference corroboration (does not overwrite visual evidence).
    4. Dual-Track Extraction (Gemini Multimodal Vision + Local OCR Field Parsers).
    5. Calibrated Confidence Calculation (math check, syntax validity, quality factor).
    6. LMPC Statutory Rule & Exemption Engine (Rule 5, 6, 7, 26 exemptions).
    7. Priority Risk Index (PRI) computation.
    8. Enforces 5-Stage Lifecycle State Machine.
    """
    face_bytes = {}
    saved_urls = {}
    quality_warnings = []
    qa_metrics_combined = {"blur_score": 100.0, "glare_ratio": 0.0}

    # 1. Process each uploaded face with format normalization and QA
    for face_name, file_obj in [("front", front_image), ("back", back_image), ("side", side_image), ("bottom", bottom_image)]:
        if file_obj and file_obj.filename:
            raw_content = await file_obj.read()
            if len(raw_content) > 0:
                # Normalize AVIF/HEIC/WebP/PNG to RGB JPEG
                norm_content, detected_mime = normalize_image_to_rgb_jpeg(raw_content)
                face_bytes[face_name] = norm_content

                # Image Quality Check
                qa_res = check_image_quality(norm_content)
                qa_metrics_combined["blur_score"] = min(qa_metrics_combined["blur_score"], qa_res.get("blur_score", 100.0))
                qa_metrics_combined["glare_ratio"] = max(qa_metrics_combined["glare_ratio"], qa_res.get("glare_ratio", 0.0))

                for w in qa_res.get("warnings", []):
                    quality_warnings.append(f"[{face_name.upper()} FACE] {w}")

                # Save normalized image to disk
                filename = f"{uuid.uuid4()}_{face_name}.jpg"
                filepath = UPLOAD_DIR / filename
                with open(filepath, "wb") as f:
                    f.write(norm_content)
                saved_urls[face_name] = f"/uploads/{filename}"

    # 2. Barcode Metadata Lookup (Reference Corroboration)
    barcode_meta = lookup_barcode(barcode) if barcode and len(barcode.strip()) > 4 else {}

    # 3. Multi-Face Dual-Track Extraction with Calibrated Confidence
    ocr_result = extract_declarations_from_images(
        face_images=face_bytes,
        barcode_meta=barcode_meta,
        api_key=api_key,
        qa_metrics=qa_metrics_combined
    )

    extracted_fields_dict = ocr_result.get("fields", {})
    product_name = ocr_result.get("product_name") or barcode_meta.get("product", "Packaged Consumer Commodity")
    brand_name = ocr_result.get("brand_name") or barcode_meta.get("brand", "Packaged Goods Manufacturer")

    # 4. Legal Metrology Compliance & Exemption Evaluation
    compliance_res = evaluate_compliance(extracted_fields_dict, category=category)

    # 5. Dynamic Priority Risk Index (PRI)
    risk_res = calculate_priority_risk_index(
        brand_name=brand_name,
        category=category,
        violations=compliance_res["violations"],
        overall_compliance_score=compliance_res["overall_compliance_score"]
    )

    # 6. Lifecycle State Decision
    critical_field_keys = ["mrp", "net_quantity", "manufacturer_name_and_address"]
    has_critical_low_conf = any(
        extracted_fields_dict.get(k, {}).get("confidence", 0.0) < 0.85 or extracted_fields_dict.get(k, {}).get("value") is None
        for k in critical_field_keys
    )
    
    needs_hitl = (
        len(quality_warnings) > 0
        or has_critical_low_conf
        or any(f.get("requires_human_verification", False) for f in extracted_fields_dict.values())
    )

    scan_status = "MANDATORY_HUMAN_REVIEW" if needs_hitl else "COMPLETED"
    if qa_metrics_combined.get("blur_score", 100.0) < 20.0:
        scan_status = "QUALITY_REJECTED"

    # Multi-Tier Authenticated Officer Resolution Hierarchy
    actor_user_id = None
    
    # Priority 1: User ID or username from JWT token
    user_sub = user.get("sub")
    if user_sub is not None and str(user_sub) != "demo_user":
        try:
            actor_user_id = int(user_sub)
        except (ValueError, TypeError):
            u_match = db.query(User).filter(User.username == str(user_sub)).first()
            if u_match:
                actor_user_id = u_match.id

    # Priority 2: Direct inspector_id from client form payload
    if not actor_user_id and inspector_id:
        u_by_id = db.query(User).filter(User.id == inspector_id).first()
        if u_by_id:
            actor_user_id = u_by_id.id

    # Priority 3: Match by inspector_username, inspector_badge, or inspector_name
    if not actor_user_id:
        if inspector_username:
            u_by_un = db.query(User).filter((User.username == inspector_username.strip().lower()) | (User.email == f"{inspector_username.strip().lower()}@doca.gov.in")).first()
            if u_by_un:
                actor_user_id = u_by_un.id
        if not actor_user_id and inspector_badge:
            u_by_badge = db.query(User).filter(User.badge_number == inspector_badge.strip()).first()
            if u_by_badge:
                actor_user_id = u_by_badge.id
        if not actor_user_id and inspector_name:
            u_by_name = db.query(User).filter(User.full_name.ilike(f"%{inspector_name.strip()}%")).first()
            if u_by_name:
                actor_user_id = u_by_name.id

    # Priority 4: Look for Aniket Kumar / active logged-in inspector in DB
    if not actor_user_id:
        aniket_user = db.query(User).filter((User.username == "aniket") | (User.full_name.ilike("%Aniket%"))).first()
        if aniket_user:
            actor_user_id = aniket_user.id
        else:
            primary_insp = db.query(User).filter(User.role == "inspector").order_by(User.id.desc()).first()
            if primary_insp:
                actor_user_id = primary_insp.id


    # 7. Persist Scan in DB
    scan_obj = Scan(
        product_name=product_name,
        brand_name=brand_name,
        category=category,
        barcode=barcode or barcode_meta.get("barcode"),
        front_image_url=saved_urls.get("front", saved_urls.get("back", "/uploads/placeholder.jpg")),
        back_image_url=saved_urls.get("back", saved_urls.get("front", "/uploads/placeholder.jpg")),
        side_image_url=saved_urls.get("side"),
        bottom_image_url=saved_urls.get("bottom"),
        status=scan_status,
        overall_compliance_score=compliance_res["overall_compliance_score"],
        compliance_grade=compliance_res["compliance_grade"],
        risk_score=risk_res["priority_risk_index"],
        is_hitl_verified=not needs_hitl,
        raw_ocr_text=ocr_result.get("raw_text_summary", ""),
        quality_warnings=quality_warnings,
        created_by_user_id=actor_user_id
    )
    db.add(scan_obj)
    db.commit()
    db.refresh(scan_obj)

    # Persist Extracted Fields
    for f_key, f_data in extracted_fields_dict.items():
        field_row = ExtractedField(
            scan_id=scan_obj.id,
            field_key=f_key,
            field_label=f_data.get("label", f_key),
            extracted_value=str(f_data.get("value") or ""),
            confidence=f_data.get("confidence", 0.90),
            bbox=f_data.get("bbox"),
            requires_human_verification=f_data.get("requires_human_verification", False),
            is_verified_by_human=False
        )
        db.add(field_row)

    # Persist Violations
    for v in compliance_res["violations"]:
        v_row = Violation(
            scan_id=scan_obj.id,
            rule_code=v["rule_code"],
            rule_title=v["rule_title"],
            severity=v.get("severity", "HIGH"),
            detected_evidence=v["detected_evidence"],
            expected_requirement=v["expected_requirement"],
            ai_confidence=v.get("ai_confidence", 0.92),
            recommended_action=v["recommended_action"],
            penalty_estimate_inr=v.get("penalty_estimate_inr", 25000)
        )
        db.add(v_row)

    # Create Inspection Case
    case_num = f"DOCA-CASE-2026-{scan_obj.id:04d}"
    inspection_obj = Inspection(
        case_number=case_num,
        scan_id=scan_obj.id,
        inspector_id=actor_user_id,
        stage="TRIAGE_HOLD" if needs_hitl else ("UNDER_REVIEW" if compliance_res["violations"] else "CLOSED"),
        priority_level=risk_res["priority_level"],
        priority_risk_index=risk_res["priority_risk_index"]
    )
    db.add(inspection_obj)


    # Audit Log
    audit_row = AuditLog(
        username=user.get("username", "inspector"),
        user_role=user.get("role", "inspector"),
        action_type="SCAN_CREATED",
        entity_type="scan",
        entity_id=scan_obj.id,
        change_summary=f"Processed packaging scan for '{product_name}' (Status: {scan_status}, Score: {compliance_res['overall_compliance_score']}%, Risk: {risk_res['priority_risk_index']})"
    )
    db.add(audit_row)
    db.commit()
    db.refresh(scan_obj)

    return get_scan_details(scan_obj.id, db)


@router.get("/")
def list_all_scanned_products(
    db: Session = Depends(get_db),
    location: Optional[str] = None,
    date_range: Optional[str] = None
):
    """
    Returns all audited products from the database ordered by latest scan with inspector details.
    Supports location and date_range filtering.
    """
    query = db.query(Scan).order_by(Scan.created_at.desc())

    from app.core.date_utils import parse_date_range
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

    scans = query.limit(100).all()
    if not scans:
        return []

    scan_ids = [s.id for s in scans]
    user_ids = list(set([s.created_by_user_id for s in scans if s.created_by_user_id]))

    # Batch fetch related entities in 4 single roundtrips
    all_fields = db.query(ExtractedField).filter(ExtractedField.scan_id.in_(scan_ids)).all()
    all_violations = db.query(Violation).filter(Violation.scan_id.in_(scan_ids)).all()
    all_inspections = db.query(Inspection).filter(Inspection.scan_id.in_(scan_ids)).all()
    all_users = db.query(User).all()


    # Build memory lookup maps
    fields_by_scan = {}
    for f in all_fields:
        fields_by_scan.setdefault(f.scan_id, []).append(f)

    violations_by_scan = {}
    for v in all_violations:
        violations_by_scan.setdefault(v.scan_id, []).append(v)

    inspections_by_scan = {insp.scan_id: insp for insp in all_inspections}
    users_by_id = {u.id: u for u in all_users}

    results = []
    for s in scans:
        fields = fields_by_scan.get(s.id, [])
        violations = violations_by_scan.get(s.id, [])
        inspection = inspections_by_scan.get(s.id)
        
        # Get Inspector details if available
        inspector_user = users_by_id.get(s.created_by_user_id) if s.created_by_user_id else None
        if not inspector_user:
            aniket = next((u for u in all_users if "aniket" in u.username.lower() or "aniket" in u.full_name.lower()), None)
            inspector_user = aniket

        insp_name = inspector_user.full_name if inspector_user else "Aniket Kumar"
        insp_badge = inspector_user.badge_number if inspector_user else "DOCA-INSP-2026"
        insp_jurisdiction = getattr(inspector_user, "department", "Delhi NCR (North Zone)") if inspector_user else "Delhi NCR (North Zone)"
        
        mrp_val = "Not Declared"
        net_qty_val = "Not Declared"
        mfg_addr = "Address on package"
        gen_name = None
        for f in fields:
            val = f.human_corrected_value or f.extracted_value
            if val:
                if f.field_key == "mrp":
                    mrp_val = val
                elif f.field_key == "net_quantity":
                    net_qty_val = val
                elif f.field_key in ["manufacturer_name_and_address", "manufacturer_name_address"]:
                    mfg_addr = val
                elif f.field_key == "generic_name":
                    gen_name = val

        # Clean product display name (remove OCR tags like [BACK])
        p_name = s.product_name or ""
        if p_name.strip() in ["[BACK]", "[FRONT]", "[SIDE]", "[BOTTOM]", ""] or p_name.startswith("["):
            if gen_name and gen_name != "Packaged Commodity":
                p_name = f"{gen_name} ({net_qty_val})" if net_qty_val != "Not Declared" else gen_name
            elif s.brand_name and "Pepsico" in s.brand_name:
                p_name = f"PepsiCo Packaged Snack ({net_qty_val})"
            else:
                p_name = f"Packaged Commodity #{s.id} ({net_qty_val})"

        results.append({
            "id": s.id,
            "name": p_name,
            "product_name": p_name,
            "brand": s.brand_name or "Manufacturer on Record",
            "brand_name": s.brand_name or "Manufacturer on Record",
            "category": s.category or "Packaged Commodities",
            "barcode": s.barcode or f"890{s.id:010d}",
            "mrp": mrp_val,
            "net_qty": net_qty_val,
            "manufacturer": mfg_addr,
            "last_inspected": s.created_at.strftime("%Y-%m-%d") if s.created_at else "2026-08-28",
            "compliance_score": s.overall_compliance_score if s.overall_compliance_score is not None else 80,
            "grade": s.compliance_grade or "B",
            "violations_count": len(violations),
            "case_number": inspection.case_number if inspection else f"DOCA-CASE-2026-{s.id:04d}",
            "inspector_name": insp_name,
            "inspector_badge": insp_badge,
            "jurisdiction": insp_jurisdiction,
            "front_image_url": s.front_image_url,
            "back_image_url": s.back_image_url
        })

    return results





@router.get("/lookup-barcode/{barcode}")
def api_lookup_barcode(barcode: str):
    """
    Direct barcode lookup endpoint returning OpenFoodFacts, UPC ItemDB & GS1 database registry data.
    """
    res = lookup_barcode(barcode)
    return {
        "success": bool(res and res.get("product")),
        "barcode": barcode,
        "data": res
    }


@router.post("/decode-barcode-image")
async def api_decode_barcode_image(image: UploadFile = File(...)):
    """
    Decodes 1D/2D barcodes directly from an uploaded packaging photo or webcam frame capture
    using server-side computer vision filters (CLAHE, multi-angle rotations, center-crop).
    """
    raw_bytes = await image.read()
    res = decode_barcode_from_image_bytes(raw_bytes)
    return res


@router.get("/{scan_id}")
def get_scan_details(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")


    fields = db.query(ExtractedField).filter(ExtractedField.scan_id == scan_id).all()
    violations = db.query(Violation).filter(Violation.scan_id == scan_id).all()
    inspection = db.query(Inspection).filter(Inspection.scan_id == scan_id).first()

    return {
        "id": scan.id,
        "product_name": scan.product_name,
        "brand_name": scan.brand_name,
        "category": scan.category,
        "barcode": scan.barcode,
        "front_image_url": scan.front_image_url,
        "back_image_url": scan.back_image_url,
        "side_image_url": scan.side_image_url,
        "bottom_image_url": scan.bottom_image_url,
        "status": scan.status,
        "overall_compliance_score": scan.overall_compliance_score,
        "compliance_grade": scan.compliance_grade,
        "risk_score": scan.risk_score,
        "is_hitl_verified": scan.is_hitl_verified,
        "quality_warnings": scan.quality_warnings or [],
        "created_at": scan.created_at,
        "case_number": inspection.case_number if inspection else None,
        "inspection_stage": inspection.stage if inspection else "CLOSED",
        "priority_level": inspection.priority_level if inspection else "LOW",
        "fields": [
            {
                "id": f.id,
                "field_key": f.field_key,
                "field_label": f.field_label,
                "extracted_value": f.extracted_value,
                "confidence": f.confidence,
                "bbox": f.bbox,
                "requires_human_verification": f.requires_human_verification,
                "is_verified_by_human": f.is_verified_by_human,
                "human_corrected_value": f.human_corrected_value
            }
            for f in fields
        ],
        "violations": [
            {
                "id": v.id,
                "rule_code": v.rule_code,
                "rule_title": v.rule_title,
                "severity": v.severity,
                "detected_evidence": v.detected_evidence,
                "expected_requirement": v.expected_requirement,
                "ai_confidence": v.ai_confidence,
                "recommended_action": v.recommended_action,
                "penalty_estimate_inr": v.penalty_estimate_inr,
                "is_dismissed": v.is_dismissed
            }
            for v in violations
        ]
    }


@router.post("/{scan_id}/correct-field")
def correct_field_hitl(
    scan_id: int,
    req: FieldCorrectionRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):
    """
    Human-in-the-Loop (HITL) Verification Endpoint:
    Allows an inspector to review and calibrate OCR detections and immediately re-evaluates compliance.
    """
    field = db.query(ExtractedField).filter(
        ExtractedField.scan_id == scan_id,
        ExtractedField.field_key == req.field_key
    ).first()

    if not field:
        raise HTTPException(status_code=404, detail="Field not found")

    old_value = field.extracted_value
    field.human_corrected_value = req.corrected_value
    field.extracted_value = req.corrected_value
    field.is_verified_by_human = True
    field.requires_human_verification = False
    field.confidence = 1.0
    field.verification_notes = req.notes

    # Re-evaluate compliance across all fields
    all_fields = db.query(ExtractedField).filter(ExtractedField.scan_id == scan_id).all()
    fields_dict = {
        f.field_key: {
            "value": f.human_corrected_value or f.extracted_value,
            "confidence": 1.0 if f.is_verified_by_human else f.confidence
        }
        for f in all_fields
    }

    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    new_compliance = evaluate_compliance(fields_dict, category=scan.category)

    # Clear old violations and insert updated set
    db.query(Violation).filter(Violation.scan_id == scan_id).delete()
    for v in new_compliance["violations"]:
        db.add(Violation(
            scan_id=scan_id,
            rule_code=v["rule_code"],
            rule_title=v["rule_title"],
            severity=v.get("severity", "HIGH"),
            detected_evidence=v["detected_evidence"],
            expected_requirement=v["expected_requirement"],
            ai_confidence=1.0,
            recommended_action=v["recommended_action"],
            penalty_estimate_inr=v.get("penalty_estimate_inr", 25000)
        ))

    # Check if any remaining field requires verification
    remaining_unverified = any(f.requires_human_verification for f in all_fields if f.id != field.id)
    scan.overall_compliance_score = new_compliance["overall_compliance_score"]
    scan.compliance_grade = new_compliance["compliance_grade"]
    scan.is_hitl_verified = not remaining_unverified
    scan.status = "MANDATORY_HUMAN_REVIEW" if remaining_unverified else "COMPLETED"

    # Audit log
    db.add(AuditLog(
        username=user.get("username", "inspector"),
        user_role=user.get("role", "inspector"),
        action_type="HITL_FIELD_CORRECTED",
        entity_type="field",
        entity_id=field.id,
        change_summary=f"Inspector verified field '{req.field_key}' as '{req.corrected_value}'. Compliance score updated to {scan.overall_compliance_score}%"
    ))
    db.commit()

    return get_scan_details(scan_id, db)
