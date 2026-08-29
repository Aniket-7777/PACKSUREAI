import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import REPORT_DIR
from app.models.entities import Inspection, Scan, Violation
from app.services.pdf_service import generate_legal_notice_pdf

router = APIRouter(prefix="/reports", tags=["Reports & Notice PDFs"])

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
