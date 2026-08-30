from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.entities import AuditLog
from app.core.date_utils import parse_date_range

router = APIRouter(prefix="/audit", tags=["Departmental Audit Trail"])

@router.get("/")
def get_audit_logs(
    limit: int = 50,
    date_range: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns immutable log of all officer actions, scans, field corrections, and notice dispatches."""
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    start_d, end_d = parse_date_range(date_range)
    if start_d:
        query = query.filter(AuditLog.created_at >= start_d)
    if end_d:
        query = query.filter(AuditLog.created_at <= end_d)
    logs = query.limit(limit).all()
    return logs
