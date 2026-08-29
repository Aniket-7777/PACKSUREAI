from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AuditLog

router = APIRouter(prefix="/audit", tags=["Departmental Audit Trail"])

@router.get("/")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Returns immutable log of all officer actions, scans, field corrections, and notice dispatches."""
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs
