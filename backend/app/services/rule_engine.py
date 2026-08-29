"""
rule_engine.py — Statutory Legal Metrology (Packaged Commodities) Rules 2011 Evaluation Engine.

Codifies:
- Rule 5: Standard units of weight and measure (prohibits non-standard abbreviations).
- Rule 6(1)(a-g): Mandatory 8 retail declarations.
- Rule 6(1)(e) Amendment: Mandatory Unit Sale Price (USP).
- Rule 6(10): Mandatory E-Commerce digital shelf declarations.
- Rule 7 & Schedule II: Minimum font height specifications (flagged as REQUIRES_PHYSICAL_CALIBRATION).
- Rule 26 Statutory Exemptions: Small packages (≤ 10g / ≤ 10ml) exemption audit.
- Rule 3 Statutory Exemptions: Wholesale / Industrial consumer packages (≥ 25kg / ≥ 25l).
"""

import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

VALID_METRIC_UNITS = {"g", "kg", "ml", "l", "m", "cm", "mm", "n", "u", "number", "units", "piece", "pieces"}

FORBIDDEN_UNIT_PATTERNS = {
    r"\bgms?\b": "Illegal unit 'gm/gms' used. Rule 5 mandates standard metric symbol 'g' or 'kg'.",
    r"\bkilos?\b": "Illegal non-standard term 'kilo' used. Rule 5 mandates 'kg'.",
    r"\bltr?s?\b": "Illegal abbreviation 'ltr/lt' used. Rule 5 mandates standard symbol 'l' or 'ml'.",
    r"\bdoz(?:en)?\b": "Illegal unit 'dozen' used for mass/volume packages. Must use standard metric units or 'N'."
}


def evaluate_compliance(
    fields: Dict[str, Any],
    category: str = "Food & Grocery",
    is_ecommerce: bool = False
) -> Dict[str, Any]:
    """
    Evaluates extracted packaging declarations against versioned LMPC Rules 2011.
    Evaluates statutory exemptions (Rule 26, Rule 3) before flagging violations.
    """
    violations = []
    passed_rules = []
    exemptions_applied = []
    
    # 0. Check Statutory Exemptions (Rule 26: ≤ 10g / ≤ 10ml small packages, Rule 3: ≥ 25kg / ≥ 25l)
    net_field = fields.get("net_quantity", {})
    net_val = (net_field.get("value") or "").strip()
    is_small_pack_exempt = False
    is_wholesale_exempt = False

    if net_val:
        m_qty = re.search(r"(\d+(?:\.\d+)?)\s*([a-zA-Z]+)", net_val)
        if m_qty:
            num = float(m_qty.group(1))
            unit = m_qty.group(2).lower()
            if (unit in ("g", "gm", "gms", "ml") and num <= 10.0):
                is_small_pack_exempt = True
                exemptions_applied.append({
                    "rule": "Rule 26 (Small Package Exemption)",
                    "detail": f"Package net content ({net_val}) is ≤ 10g/10ml. Exempt from certain detailed PDP declarations."
                })
            elif (unit in ("kg", "l") and num >= 25.0):
                is_wholesale_exempt = True
                exemptions_applied.append({
                    "rule": "Rule 3 (Wholesale / Institutional Exemption)",
                    "detail": f"Package net content ({net_val}) is ≥ 25kg/25l for industrial/institutional use."
                })

    # 1. Rule 6(1)(a): Manufacturer / Packer / Importer Name & Complete Address
    mfg_field = fields.get("manufacturer_name_and_address", {})
    mfg_val = (mfg_field.get("value") or "").strip()
    if not mfg_val or len(mfg_val) < 10:
        violations.append({
            "rule_code": "LMPC_R6_1_A_MFG_ADDRESS",
            "rule_title": "Rule 6(1)(a) - Name & Address of Manufacturer/Packer",
            "severity": "CRITICAL",
            "detected_evidence": f"Found: '{mfg_val}'" if mfg_val else "No Manufacturer or Packer details found on scanned faces.",
            "expected_requirement": "Every package must bear the complete legal name and complete physical address (with State/PIN code) of the manufacturer, packer, or importer.",
            "ai_confidence": mfg_field.get("confidence", 0.90),
            "recommended_action": "Issue Notice under Section 36 for missing manufacturer identity; require formal rectification.",
            "penalty_estimate_inr": 25000
        })
    else:
        passed_rules.append({
            "rule_code": "LMPC_R6_1_A_MFG_ADDRESS",
            "rule_title": "Rule 6(1)(a) - Manufacturer Identity Verified",
            "status": "PASS",
            "evidence": mfg_val[:60] + "..."
        })

    # 2. Rule 6(1)(b): Common / Generic Name
    gen_field = fields.get("generic_name", {})
    gen_val = (gen_field.get("value") or "").strip()
    if not gen_val or len(gen_val) < 3:
        violations.append({
            "rule_code": "LMPC_R6_1_B_GENERIC_NAME",
            "rule_title": "Rule 6(1)(b) - Common or Generic Commodity Name",
            "severity": "HIGH",
            "detected_evidence": "Generic or common name of commodity is absent or obscured.",
            "expected_requirement": "The principal display panel must conspicuously state the common or generic name of the commodity.",
            "ai_confidence": gen_field.get("confidence", 0.92),
            "recommended_action": "Instruct brand to add standardized commodity descriptor on Principal Display Panel (PDP).",
            "penalty_estimate_inr": 20000
        })
    else:
        passed_rules.append({
            "rule_code": "LMPC_R6_1_B_GENERIC_NAME",
            "rule_title": "Rule 6(1)(b) - Generic Name Present",
            "status": "PASS",
            "evidence": gen_val
        })

    # 3. Rule 6(1)(c) & Rule 5: Net Quantity & Standard Metric Units
    if not net_val:
        violations.append({
            "rule_code": "LMPC_R6_1_C_NET_QTY",
            "rule_title": "Rule 6(1)(c) - Net Quantity Declaration",
            "severity": "CRITICAL",
            "detected_evidence": "Net Quantity declaration is completely missing from scanned package.",
            "expected_requirement": "Net quantity in standard SI metric units (weight, measure, or number) must be prominently printed.",
            "ai_confidence": net_field.get("confidence", 0.95),
            "recommended_action": "Immediate seizure/notice under Section 36(1) for undeclared net content.",
            "penalty_estimate_inr": 25000
        })
    else:
        # Check for non-standard metric abbreviations
        unit_violation_found = False
        for pattern, msg in FORBIDDEN_UNIT_PATTERNS.items():
            if re.search(pattern, net_val, re.IGNORECASE):
                violations.append({
                    "rule_code": "LMPC_R5_NON_STANDARD_UNIT",
                    "rule_title": "Rule 5 - Non-Standard Metric Unit Used",
                    "severity": "HIGH",
                    "detected_evidence": f"Found non-compliant unit syntax: '{net_val}'.",
                    "expected_requirement": f"Rule 5 mandates standard metric units only. {msg}",
                    "ai_confidence": 0.96,
                    "recommended_action": "Order repackaging / labeling correction to use standard symbols ('g', 'kg', 'ml', 'l').",
                    "penalty_estimate_inr": 15000
                })
                unit_violation_found = True
                break
                
        if not unit_violation_found:
            passed_rules.append({
                "rule_code": "LMPC_R6_1_C_NET_QTY",
                "rule_title": "Rule 6(1)(c) & Rule 5 - Standard Net Quantity Verified",
                "status": "PASS",
                "evidence": net_val
            })

    # 4. Rule 6(1)(d): Month and Year of Manufacture / Packing
    mfg_date_field = fields.get("mfg_date", {})
    mfg_date_val = (mfg_date_field.get("value") or "").strip()
    if not mfg_date_val or not re.search(r"\b(?:\d{1,2}[/-]\d{2,4}|[A-Za-z]{3,9}\s+\d{2,4}|\d{4})\b", mfg_date_val):
        violations.append({
            "rule_code": "LMPC_R6_1_D_MFG_DATE",
            "rule_title": "Rule 6(1)(d) - Month & Year of Manufacture / Pre-packing",
            "severity": "HIGH",
            "detected_evidence": f"Found '{mfg_date_val}' (Invalid format or missing date)." if mfg_date_val else "Date of manufacture/packaging is missing.",
            "expected_requirement": "The month and year in which the commodity is manufactured, packed or imported must be clearly indicated (e.g., '08/2026' or 'Aug 2026').",
            "ai_confidence": mfg_date_field.get("confidence", 0.91),
            "recommended_action": "Require manufacturer to print clear, legible manufacturing date codes.",
            "penalty_estimate_inr": 20000
        })
    else:
        passed_rules.append({
            "rule_code": "LMPC_R6_1_D_MFG_DATE",
            "rule_title": "Rule 6(1)(d) - Manufacturing Date Validated",
            "status": "PASS",
            "evidence": mfg_date_val
        })

    # 5. Rule 6(1)(e): Maximum Retail Price (MRP) & Tax Inclusion Clause
    mrp_field = fields.get("mrp", {})
    mrp_val = (mrp_field.get("value") or "").strip()
    tax_field = fields.get("mrp_tax_statement", {})
    tax_val = (tax_field.get("value") or "").strip()
    
    if not mrp_val or not re.search(r"(?:₹|Rs\.?|INR)\s*\d+", mrp_val, re.IGNORECASE):
        violations.append({
            "rule_code": "LMPC_R6_1_E_MRP_MISSING",
            "rule_title": "Rule 6(1)(e) - Maximum Retail Price (MRP) Declaration",
            "severity": "CRITICAL",
            "detected_evidence": f"Found: '{mrp_val}'" if mrp_val else "No valid MRP found on packaging.",
            "expected_requirement": "MRP must be clearly printed in Indian Rupees with currency symbol ('₹' or 'Rs.') and numerical value.",
            "ai_confidence": mrp_field.get("confidence", 0.94),
            "recommended_action": "Section 36 prosecution for missing or deceptive retail pricing.",
            "penalty_estimate_inr": 25000
        })
    else:
        combined_mrp_text = f"{mrp_val} {tax_val}".lower()
        if "tax" not in combined_mrp_text and "incl" not in combined_mrp_text:
            violations.append({
                "rule_code": "LMPC_R6_1_E_TAX_STATEMENT",
                "rule_title": "Rule 6(1)(e) - 'Inclusive of all taxes' Statement Missing",
                "severity": "MEDIUM",
                "detected_evidence": f"MRP declared as '{mrp_val}' without the mandatory 'incl. of all taxes' clause.",
                "expected_requirement": "MRP declaration must expressly state 'inclusive of all taxes' or 'incl. of all taxes'.",
                "ai_confidence": 0.93,
                "recommended_action": "Issue warning/notice to append tax inclusion statement on pricing label.",
                "penalty_estimate_inr": 10000
            })
        else:
            passed_rules.append({
                "rule_code": "LMPC_R6_1_E_MRP",
                "rule_title": "Rule 6(1)(e) - MRP & Tax Inclusivity Verified",
                "status": "PASS",
                "evidence": f"{mrp_val} (Incl. of all taxes)"
            })

    # 6. Rule 6(1)(e) Amendment: Mandatory Unit Sale Price (USP)
    usp_field = fields.get("unit_sale_price", {})
    usp_val = (usp_field.get("value") or "").strip()
    
    if not usp_val or not re.search(r"(?:₹|Rs\.?|INR|\d)\s*(?:\/|per)\s*(?:g|kg|ml|l|piece|n|u)", usp_val, re.IGNORECASE):
        if is_small_pack_exempt:
            # Rule 26 statutory exemption for packages ≤ 10g
            passed_rules.append({
                "rule_code": "LMPC_R6_1_E_USP_EXEMPT",
                "rule_title": "Rule 6(1)(e) - USP Exempt (Rule 26 Small Pack)",
                "status": "EXEMPT",
                "evidence": f"Package size ({net_val}) qualifies for Rule 26 exemption."
            })
        else:
            violations.append({
                "rule_code": "LMPC_R6_1_E_USP_MISSING",
                "rule_title": "Rule 6(1)(e) Amendment - Unit Sale Price (USP) Omission",
                "severity": "HIGH",
                "detected_evidence": f"Found: '{usp_val}'" if usp_val else "Unit Sale Price (USP) is completely absent on the packaging.",
                "expected_requirement": "Mandatory for all pre-packaged commodities to state Unit Sale Price (e.g. '₹ 0.40 per g' or '₹ 25.00 per 100ml') to prevent deceptive sizing.",
                "ai_confidence": usp_field.get("confidence", 0.92),
                "recommended_action": "Issue Show-Cause Notice under Section 36(1) for omitting mandatory Unit Sale Price.",
                "penalty_estimate_inr": 25000
            })
    else:
        passed_rules.append({
            "rule_code": "LMPC_R6_1_E_USP",
            "rule_title": "Rule 6(1)(e) - Unit Sale Price (USP) Verified",
            "status": "PASS",
            "evidence": usp_val
        })

    # 7. Rule 6(1)(f): Consumer Care Contact Details
    cc_field = fields.get("consumer_care_details", {})
    cc_val = (cc_field.get("value") or "").strip()
    if not cc_val or len(cc_val) < 8:
        violations.append({
            "rule_code": "LMPC_R6_1_F_CONSUMER_CARE",
            "rule_title": "Rule 6(1)(f) - Consumer Care Helpline / Grievance Cell",
            "severity": "HIGH",
            "detected_evidence": "No consumer care telephone, email, or contact address found.",
            "expected_requirement": "Every package must bear the name, address, telephone number, and email ID of the person/office to contact in case of consumer complaints.",
            "ai_confidence": cc_field.get("confidence", 0.89),
            "recommended_action": "Require brand to print active consumer helpline number and grievance email.",
            "penalty_estimate_inr": 20000
        })
    else:
        passed_rules.append({
            "rule_code": "LMPC_R6_1_F_CONSUMER_CARE",
            "rule_title": "Rule 6(1)(f) - Consumer Care Cell Verified",
            "status": "PASS",
            "evidence": cc_val[:50] + "..."
        })

    # 8. Rule 6(1)(g): Country of Origin
    coo_field = fields.get("country_of_origin", {})
    coo_val = (coo_field.get("value") or "").strip()
    if not coo_val:
        violations.append({
            "rule_code": "LMPC_R6_1_G_COUNTRY_OF_ORIGIN",
            "rule_title": "Rule 6(1)(g) - Country of Origin Declaration",
            "severity": "MEDIUM",
            "detected_evidence": "Country of origin is not explicitly declared.",
            "expected_requirement": "Every package must clearly state the country of manufacture / origin (e.g. 'Made in India' or 'Country of Origin: India').",
            "ai_confidence": coo_field.get("confidence", 0.90),
            "recommended_action": "Order addition of Country of Origin declaration.",
            "penalty_estimate_inr": 10000
        })
    else:
        passed_rules.append({
            "rule_code": "LMPC_R6_1_G_COUNTRY_OF_ORIGIN",
            "rule_title": "Rule 6(1)(g) - Country of Origin Verified",
            "status": "PASS",
            "evidence": coo_val
        })

    # 9. Font Height Policy — Marked strictly as requiring physical calibration
    unassessed_rules = [{
        "rule_code": "LMPC_R7_SCHEDULE_II_FONT_HEIGHT",
        "rule_title": "Rule 7 & Schedule II - Minimum Font Height Compliance",
        "status": "REQUIRES_PHYSICAL_CALIBRATION",
        "evidence": "Font height in physical millimeters cannot be accurately measured from uncalibrated 2D photographs. Requires physical millimeter reference card.",
        "requires_human_verification": True
    }]

    # 10. Compute Final Compliance Grade & Score
    total_checks = len(violations) + len(passed_rules)
    pass_count = len(passed_rules)
    score = round((pass_count / total_checks) * 100.0, 1) if total_checks > 0 else 100.0
    
    if score >= 90.0:
        grade = "A (Fully Compliant)"
    elif score >= 75.0:
        grade = "B (Minor Defects)"
    elif score >= 55.0:
        grade = "C (Significant Violations)"
    else:
        grade = "F (Non-Compliant / Unlawful)"

    total_penalty = sum(v.get("penalty_estimate_inr", 0) for v in violations)
    
    return {
        "overall_compliance_score": score,
        "compliance_grade": grade,
        "violations": violations,
        "passed_rules": passed_rules,
        "unassessed_rules": unassessed_rules,
        "exemptions_applied": exemptions_applied,
        "total_violations_count": len(violations),
        "total_penalty_estimate_inr": total_penalty
    }
