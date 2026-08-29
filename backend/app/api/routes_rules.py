from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, require_role
from app.models.entities import LegalRule, AuditLog
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/rules", tags=["Versioned Legal Rules Management"])

class RuleCreateRequest(BaseModel):
    rule_code: str
    rule_title: str
    version: str = "2026.1"
    effective_from: str = "2026-01-01"
    effective_to: Optional[str] = None
    applicable_categories: str = "ALL"
    requirement_summary: str
    legal_act_reference: str = "Legal Metrology (Packaged Commodities) Rules, 2011"
    penalty_clause: str = "Section 36 of Legal Metrology Act, 2009"
    severity_level: str = "HIGH"
    is_active: bool = True

@router.get("/")
def list_legal_rules(db: Session = Depends(get_db)):
    """Returns all versioned Legal Metrology rules with effective dates and penalty clauses."""
    rules = db.query(LegalRule).all()
    return rules

@router.post("/", dependencies=[Depends(require_role(["admin"]))])
def create_or_update_rule(
    req: RuleCreateRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_payload)
):
    """Admin endpoint to amend or create versioned Legal Metrology rules."""
    rule = db.query(LegalRule).filter(LegalRule.rule_code == req.rule_code).first()
    if rule:
        rule.rule_title = req.rule_title
        rule.version = req.version
        rule.effective_from = req.effective_from
        rule.effective_to = req.effective_to
        rule.applicable_categories = req.applicable_categories
        rule.requirement_summary = req.requirement_summary
        rule.penalty_clause = req.penalty_clause
        rule.severity_level = req.severity_level
        rule.is_active = req.is_active
        action = "RULE_AMENDED"
    else:
        rule = LegalRule(
            rule_code=req.rule_code,
            rule_title=req.rule_title,
            version=req.version,
            effective_from=req.effective_from,
            effective_to=req.effective_to,
            applicable_categories=req.applicable_categories,
            requirement_summary=req.requirement_summary,
            legal_act_reference=req.legal_act_reference,
            penalty_clause=req.penalty_clause,
            severity_level=req.severity_level,
            is_active=req.is_active
        )
        db.add(rule)
        action = "RULE_CREATED"
        
    db.add(AuditLog(
        username=user.get("username", "admin"),
        user_role="admin",
        action_type=action,
        entity_type="rule",
        entity_id=rule.id if hasattr(rule, 'id') else None,
        change_summary=f"Admin updated versioned rule '{req.rule_code}' (Version: {req.version})"
    ))
    db.commit()
    return {"message": f"Rule {req.rule_code} updated successfully", "rule": rule}
