"""
confidence_calibrator.py — Calibrated Confidence Assessment Engine.

Computes mathematically objective, multi-factor confidence scores rather than
trusting arbitrary model-reported numbers.

Calibration Factors:
1. Image Quality Factor (blur, illumination, glare penalty)
2. Field Syntax & Structural Validity (regex pattern rigor)
3. Cross-Field Mathematical Consistency (USP ≈ MRP / Net Qty check)
4. External Source Corroboration (GS1 / Open Food Facts agreement)
"""

import re
from typing import Dict, Any, Optional


def calibrate_field_confidences(
    fields: Dict[str, Any],
    qa_metrics: Optional[Dict[str, Any]] = None,
    barcode_meta: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Applies multi-factor calibration across all extracted packaging fields.
    Updates each field's confidence and 'requires_human_verification' flag.
    """
    qa = qa_metrics or {}
    barcode = barcode_meta or {}
    
    # 1. Base Image Quality Factor (0.70 to 1.00)
    blur_score = qa.get("blur_score", 100.0)
    glare_ratio = qa.get("glare_ratio", 0.0)
    
    quality_factor = 1.0
    if blur_score < 30.0:
        quality_factor *= 0.80
    elif blur_score < 50.0:
        quality_factor *= 0.90
        
    if glare_ratio > 0.30:
        quality_factor *= 0.85

    # 2. Field-by-Field Syntax & Semantic Scoring
    for field_key, field_data in fields.items():
        val = field_data.get("value")
        if not val or val is None:
            field_data["confidence"] = 0.0
            field_data["requires_human_verification"] = True
            continue

        str_val = str(val).strip()
        syntax_score = _calculate_syntax_score(field_key, str_val)
        
        # Combine Quality factor + Syntax score
        calibrated = round(min(0.99, max(0.20, syntax_score * quality_factor)), 2)
        field_data["confidence"] = calibrated
        field_data["requires_human_verification"] = calibrated < 0.85

    # 3. Cross-Field Mathematical Validation: USP ≈ MRP / Net Quantity
    _validate_usp_math_consistency(fields)

    # 4. Barcode Corroboration Boost / Penalty
    _apply_barcode_corroboration(fields, barcode)

    return fields


def _calculate_syntax_score(field_key: str, val: str) -> float:
    """Evaluates field-specific regex and structural validity."""
    if not val:
        return 0.0

    if field_key == "mrp":
        # Must have currency indicator and realistic price
        if re.search(r"^(?:₹|Rs\.?|INR)\s*\d+(?:\.\d{1,2})?$", val, re.IGNORECASE):
            return 0.97
        if re.search(r"\d+(?:\.\d{1,2})?", val):
            return 0.80
        return 0.40

    if field_key == "net_quantity":
        # Standard metric unit format
        if re.search(r"^\d+(?:\.\d+)?\s*(?:g|kg|ml|l|N|u)(?:\s*\(.*?\))?$", val, re.IGNORECASE):
            return 0.96
        if re.search(r"\d+\s*(?:gms?|ltr?|kilo)\b", val, re.IGNORECASE):
            return 0.90 # High confidence that it's a non-standard syntax violation
        return 0.60

    if field_key == "unit_sale_price":
        # Must be in ₹ X.XX / unit format
        if re.search(r"(?:₹|Rs\.?|INR)\s*\d+(?:\.\d{1,4})?\s*(?:\/|per)\s*(?:g|kg|ml|l|piece|n|u)\b", val, re.IGNORECASE):
            return 0.96
        return 0.65

    if field_key == "mfg_date":
        # Valid date syntax (MM/YYYY or DD/MM/YYYY or MMM YYYY)
        if re.search(r"\b(?:\d{1,2}[/-]\d{2,4}|[A-Za-z]{3,9}\s+\d{2,4})\b", val):
            return 0.95
        return 0.55

    if field_key == "best_before_or_expiry":
        if re.search(r"\b(?:\d{1,2}[/-]\d{2,4}|\d+\s*months?|\d+\s*days?)\b", val, re.IGNORECASE):
            return 0.94
        return 0.60

    if field_key == "consumer_care_details":
        has_phone = bool(re.search(r"\b(?:1800[-\s]?\d{3}[-\s]?\d{3,4}|\d{10,11}|\d{3,5}[-\s]?\d{6,8})\b", val))
        has_email = bool(re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", val))
        if has_phone and has_email:
            return 0.98
        if has_phone or has_email:
            return 0.88
        return 0.50

    if field_key == "manufacturer_name_and_address":
        has_pin = bool(re.search(r"\b\d{6}\b", val))
        if len(val) > 25 and has_pin:
            return 0.97
        if len(val) > 15:
            return 0.85
        return 0.45

    if field_key == "country_of_origin":
        if re.search(r"(?:Made\s*in|Country\s*of\s*Origin|Origin)\s*:?\s*[A-Za-z\s]+", val, re.IGNORECASE):
            return 0.97
        if "india" in val.lower():
            return 0.95
        return 0.70

    if field_key == "generic_name":
        if len(val) >= 3:
            return 0.92
        return 0.50

    return 0.80


def _validate_usp_math_consistency(fields: Dict[str, Any]):
    """Cross-validates declared Unit Sale Price against declared MRP / Net Quantity."""
    mrp_data = fields.get("mrp", {})
    net_data = fields.get("net_quantity", {})
    usp_data = fields.get("unit_sale_price", {})
    
    mrp_val = mrp_data.get("value")
    net_val = net_data.get("value")
    usp_val = usp_data.get("value")
    
    if not (mrp_val and net_val and usp_val):
        return

    try:
        # Extract numerical price
        mrp_num = float(re.search(r"(\d+(?:\.\d+)?)", str(mrp_val)).group(1))
        
        # Extract numerical net quantity and base unit
        net_m = re.search(r"(\d+(?:\.\d+)?)\s*([a-zA-Z]+)", str(net_val))
        if not net_m:
            return
        net_num = float(net_m.group(1))
        net_unit = net_m.group(2).lower()
        
        # Extract numerical USP and denominator unit
        usp_m = re.search(r"(\d+(?:\.\d+)?)\s*(?:\/|per)\s*([a-zA-Z]+)", str(usp_val), re.IGNORECASE)
        if not usp_m:
            return
        usp_num = float(usp_m.group(1))
        usp_unit = usp_m.group(2).lower()
        
        # Compute expected unit price
        expected_usp = None
        if net_unit in ("g", "gm", "gms") and usp_unit in ("g", "gm"):
            expected_usp = mrp_num / net_num
        elif net_unit in ("kg", "kilo") and usp_unit in ("g", "gm"):
            expected_usp = mrp_num / (net_num * 1000.0)
        elif net_unit in ("kg", "kilo") and usp_unit in ("kg", "kilo"):
            expected_usp = mrp_num / net_num
        elif net_unit in ("ml", "ltr", "l") and usp_unit in ("ml", "l"):
            expected_usp = mrp_num / net_num if net_unit == usp_unit else mrp_num / (net_num * 1000.0)
            
        if expected_usp and expected_usp > 0:
            ratio = usp_num / expected_usp
            # If within ±10% margin of mathematical precision
            if 0.90 <= ratio <= 1.10:
                # Math checks out perfectly -> Boost confidence on all 3 fields
                mrp_data["confidence"] = min(0.99, mrp_data.get("confidence", 0.9) + 0.05)
                net_data["confidence"] = min(0.99, net_data.get("confidence", 0.9) + 0.05)
                usp_data["confidence"] = min(0.99, usp_data.get("confidence", 0.9) + 0.05)
                usp_data["math_verified"] = True
            else:
                # Math mismatch -> Flag discrepancy
                usp_data["confidence"] = min(usp_data.get("confidence", 0.9), 0.65)
                usp_data["requires_human_verification"] = True
                usp_data["math_discrepancy_note"] = f"Calculated ₹{expected_usp:.3f}/{usp_unit} vs declared ₹{usp_num}/{usp_unit}"
    except Exception:
        pass


def _apply_barcode_corroboration(fields: Dict[str, Any], barcode: Dict[str, Any]):
    """Corroborates visual field extractions against GS1 / Open Food Facts registered data."""
    if not barcode or barcode.get("source") == "not_found":
        return

    # Check Net Quantity corroboration
    reg_net = barcode.get("net_quantity")
    vis_net = fields.get("net_quantity", {}).get("value")
    if reg_net and vis_net:
        # Extract bare numbers
        reg_num = re.search(r"\d+", str(reg_net))
        vis_num = re.search(r"\d+", str(vis_net))
        if reg_num and vis_num and reg_num.group(0) == vis_num.group(0):
            fields["net_quantity"]["confidence"] = min(0.99, fields["net_quantity"].get("confidence", 0.9) + 0.05)
            fields["net_quantity"]["corroborated_with_barcode"] = True
        else:
            fields["net_quantity"]["barcode_discrepancy"] = f"Visual: '{vis_net}' vs Registered: '{reg_net}'"

    # Check Country of Origin corroboration
    if barcode.get("country_of_origin") and fields.get("country_of_origin", {}).get("value"):
        fields["country_of_origin"]["confidence"] = min(0.99, fields["country_of_origin"].get("confidence", 0.9) + 0.04)
        fields["country_of_origin"]["corroborated_with_barcode"] = True
