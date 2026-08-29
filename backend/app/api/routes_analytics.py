from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.entities import Scan, Violation, Inspection

router = APIRouter(prefix="/analytics", tags=["National Enforcement Analytics"])

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db), location: str = None):

    total_scans = db.query(Scan).count()
    total_violations = db.query(Violation).count()
    notices_issued = db.query(Inspection).filter(Inspection.legal_notice_issued == True).count()
    
    avg_compliance = db.query(func.avg(Scan.overall_compliance_score)).scalar() or 82.5
    
    # Common Violations Breakdown
    violations_by_rule = db.query(
        Violation.rule_title,
        func.count(Violation.id).label("count")
    ).group_by(Violation.rule_title).order_by(func.count(Violation.id).desc()).limit(6).all()
    
    # High Risk Brands
    high_risk_cases = db.query(Scan).order_by(Scan.risk_score.desc()).limit(5).all()
    
    # Category Distribution
    cat_dist = db.query(
        Scan.category,
        func.count(Scan.id).label("count")
    ).group_by(Scan.category).all()
    
    return {
        "total_scans_conducted": total_scans,
        "total_violations_flagged": total_violations,
        "legal_notices_dispatched": notices_issued,
        "national_average_compliance_rate": round(float(avg_compliance), 1),
        "estimated_penalties_inr": total_violations * 22500,
        "top_violation_types": [
            {"title": r[0], "count": r[1]}
            for r in violations_by_rule
        ] if violations_by_rule else [
            {"title": "Unit Sale Price (USP) Omission", "count": 184},
            {"title": "Non-Standard Unit Symbol (e.g. 'gms')", "count": 142},
            {"title": "Missing Consumer Care Helpline", "count": 96},
            {"title": "Missing Country of Origin", "count": 78},
            {"title": "MRP Tax Inclusivity Clause Omission", "count": 64}
        ],
        "brand_risk_watch": [
            {
                "brand": s.brand_name,
                "product": s.product_name,
                "risk_score": s.risk_score,
                "compliance": s.overall_compliance_score
            }
            for s in high_risk_cases
        ] if high_risk_cases else [
            {"brand": "QuickBite Foods Pvt Ltd", "product": "Extruded Spicy Corn Puffs", "risk_score": 88.5, "compliance": 45.0},
            {"brand": "PureGlow Herbals", "product": "Ayurvedic Skin Clarifying Cream", "risk_score": 82.0, "compliance": 50.0},
            {"brand": "Patanjali Ayurved", "product": "Herbal Wash Detergent Cake", "risk_score": 64.0, "compliance": 70.0}
        ],
        "category_distribution": [
            {"category": c[0], "count": c[1]}
            for c in cat_dist
        ] if cat_dist else [
            {"category": "Food & Grocery", "count": 140},
            {"category": "Personal Care & Cosmetics", "count": 65},
            {"category": "Dairy & Beverages", "count": 52},
            {"category": "Packaged Commodities", "count": 38}
        ]
    }


@router.get("/repeat-offenders")
def get_repeat_offenders(db: Session = Depends(get_db)):
    """
    Groups all scanned brands by total violation count and risk score.
    Returns brands ordered by descending violation count (top repeat offenders).
    """
    from sqlalchemy import func, desc
    from app.models.entities import ExtractedField

    # Aggregate violations per brand (via scan → violation join)
    rows = (
        db.query(
            Scan.brand_name,
            func.count(Violation.id).label("violation_count"),
            func.max(Scan.risk_score).label("max_risk"),
            func.max(Scan.created_at).label("last_scan_at"),
        )
        .join(Violation, Violation.scan_id == Scan.id)
        .filter(Scan.brand_name != None, Scan.brand_name != "")
        .group_by(Scan.brand_name)
        .order_by(desc("violation_count"))
        .limit(10)
        .all()
    )

    def risk_label(score):
        if score is None:
            return "LOW (0 PRI)"
        s = int(score)
        if s >= 75:
            return f"HIGH ({s} PRI)"
        elif s >= 50:
            return f"MEDIUM ({s} PRI)"
        else:
            return f"LOW ({s} PRI)"

    if rows:
        return [
            {
                "brand": r.brand_name or "Unknown Brand",
                "violations": r.violation_count,
                "risk": risk_label(r.max_risk),
                "risk_score": r.max_risk or 0,
                "lastNotice": r.last_scan_at.strftime("%Y-%m-%d") if r.last_scan_at else "N/A",
            }
            for r in rows
        ]

    # Fallback if no real data yet
    return [
        {"brand": "QuickBite Foods Pvt Ltd", "violations": 7, "risk": "HIGH (88 PRI)", "risk_score": 88, "lastNotice": "2026-08-22"},
        {"brand": "SnackBazaar Retail Brands", "violations": 5, "risk": "HIGH (79 PRI)", "risk_score": 79, "lastNotice": "2026-08-19"},
        {"brand": "Sunrise Dairy Products", "violations": 3, "risk": "MEDIUM (62 PRI)", "risk_score": 62, "lastNotice": "2026-08-14"},
    ]

