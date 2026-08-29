from typing import List, Dict, Any

CATEGORY_RISK_WEIGHTS = {
    "Food & Grocery": 1.2,
    "Baby Food / Nutrition": 1.8,
    "Pharmaceuticals / Medical Devices": 1.6,
    "Personal Care / Cosmetics": 1.1,
    "Packaged Commodities": 1.0,
    "Electronics / Appliances": 0.9
}

BRAND_RECIDIVISM_HISTORY = {
    "Tata Consumer Products": {"prior_violations": 0, "complaints": 2},
    "Amul": {"prior_violations": 0, "complaints": 1},
    "Nestle India": {"prior_violations": 1, "complaints": 6},
    "Britannia Industries": {"prior_violations": 0, "complaints": 3},
    "Patanjali Ayurved": {"prior_violations": 3, "complaints": 14},
    "QuickBite Foods Pvt Ltd": {"prior_violations": 4, "complaints": 22},
    "PureGlow Herbals": {"prior_violations": 5, "complaints": 31}
}

def calculate_priority_risk_index(
    brand_name: str,
    category: str,
    violations: List[Dict[str, Any]],
    overall_compliance_score: float
) -> Dict[str, Any]:
    """
    Computes dynamic Priority Risk Index (PRI) to prioritize field enforcement inspections.
    """
    cat_weight = CATEGORY_RISK_WEIGHTS.get(category, 1.0)
    brand_stat = BRAND_RECIDIVISM_HISTORY.get(brand_name, {"prior_violations": 0, "complaints": 0})
    
    # 1. Violation Severity Points (Max 50)
    violation_points = 0
    for v in violations:
        sev = v.get("severity", "MEDIUM")
        if sev == "CRITICAL":
            violation_points += 20
        elif sev == "HIGH":
            violation_points += 12
        elif sev == "MEDIUM":
            violation_points += 6
        else:
            violation_points += 3
    violation_points = min(violation_points, 50)
    
    # 2. Brand Recidivism Points (Max 25)
    recidivism_points = min(brand_stat["prior_violations"] * 6, 25)
    
    # 3. Citizen Complaints Factor (Max 15)
    complaint_points = min(brand_stat["complaints"] * 0.8, 15)
    
    # 4. Compliance Deficit (Max 10)
    compliance_deficit = (100.0 - overall_compliance_score) * 0.10
    
    raw_pri = (violation_points + recidivism_points + complaint_points + compliance_deficit) * cat_weight
    pri = min(max(round(raw_pri, 1), 5.0), 100.0)
    
    if pri >= 70.0:
        priority_level = "HIGH"
        recommended_action = "🚨 Immediate On-Site Inspection & Seizure Raid Recommended"
    elif pri >= 40.0:
        priority_level = "MEDIUM"
        recommended_action = "⚠️ Schedule Formal Show-Cause Notice & Sample Verification"
    else:
        priority_level = "LOW"
        recommended_action = "✅ Routine Surveillance / Compliant Record"
        
    return {
        "priority_risk_index": pri,
        "priority_level": priority_level,
        "category_risk_multiplier": cat_weight,
        "historical_violations_count": brand_stat["prior_violations"],
        "citizen_complaints_count": brand_stat["complaints"],
        "recommended_action": recommended_action
    }
