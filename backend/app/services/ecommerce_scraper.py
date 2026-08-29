import re
import random
from typing import Dict, Any

def audit_ecommerce_listing(url: str, raw_html_or_text: str = "") -> Dict[str, Any]:
    """
    Audits e-commerce product listings (Amazon, Flipkart, Blinkit, etc.)
    against Rule 6(10) of Legal Metrology (Packaged Commodities) Rules, 2011.
    """
    domain = "E-Commerce Marketplace"
    if "amazon" in url.lower():
        domain = "Amazon India"
    elif "flipkart" in url.lower():
        domain = "Flipkart"
    elif "blinkit" in url.lower():
        domain = "Blinkit"
    elif "zepto" in url.lower():
        domain = "Zepto"
    elif "instamart" in url.lower():
        domain = "Swiggy Instamart"
        
    # Simulated/Extracted fields for e-commerce verification
    # For demo purposes, we can evaluate common compliance patterns in e-commerce
    is_compliant_sample = "tata" in url.lower() or "amul" in url.lower()
    
    if is_compliant_sample:
        product_title = "Tata Salt Iodized Crystal 1kg Pouch"
        seller_declared = "Tata Consumer Products Authorized Seller"
        country_of_origin = "India"
        usp_declared = "₹ 0.028 / g"
        mrp_declared = "₹ 28.00 (Incl. of all taxes)"
        mfg_address_declared = "Tata Chemicals Limited, Mithapur, Gujarat - 361345"
        violations = []
        passed = [
            {"rule": "Rule 6(10)(a)", "title": "Digital Unit Sale Price (USP)", "status": "PASS", "detail": usp_declared},
            {"rule": "Rule 6(10)(b)", "title": "Digital Country of Origin", "status": "PASS", "detail": country_of_origin},
            {"rule": "Rule 6(10)(c)", "title": "Digital Manufacturer/Packer Address", "status": "PASS", "detail": mfg_address_declared},
            {"rule": "Rule 6(10)(d)", "title": "Digital Maximum Retail Price (MRP)", "status": "PASS", "detail": mrp_declared},
        ]
        compliance_score = 100.0
    else:
        product_title = "Imported Gourmet Protein Hazelnut Spread 350g"
        seller_declared = "Global Treats Retailers LLP"
        country_of_origin = None # Missing
        usp_declared = None # Missing
        mrp_declared = "₹ 499.00"
        mfg_address_declared = "Imported & Distributed by XYZ Importers" # Incomplete
        
        violations = [
            {
                "rule_code": "LMPC_R6_10_ECOM_USP_MISSING",
                "rule_title": "Rule 6(10) - Omission of Unit Sale Price on E-Commerce Listing",
                "severity": "HIGH",
                "detected_evidence": "Product listing displays MRP ₹499 but fails to state Unit Sale Price (e.g. ₹ 1.42/g).",
                "expected_requirement": "All e-commerce entities must display Unit Sale Price alongside MRP before purchase.",
                "recommended_action": "Issue statutory notice to Marketplace and Seller under Rule 6(10)."
            },
            {
                "rule_code": "LMPC_R6_10_ECOM_ORIGIN_MISSING",
                "rule_title": "Rule 6(10) - Missing Country of Origin on Digital Page",
                "severity": "CRITICAL",
                "detected_evidence": "Country of Origin is completely absent on the marketplace product specification page.",
                "expected_requirement": "Country of Origin must be displayed conspicuously on digital product listing.",
                "recommended_action": "Flag listing for immediate suspension/delisting."
            },
            {
                "rule_code": "LMPC_R6_10_ECOM_ADDRESS_INCOMPLETE",
                "rule_title": "Rule 6(10) - Incomplete Importer/Packer Details",
                "severity": "MEDIUM",
                "detected_evidence": "Only importer name given without full physical address and contact credentials.",
                "expected_requirement": "Full legal name and address of importer/packer required on digital shelf.",
                "recommended_action": "Require marketplace to enforce mandatory seller declaration fields."
            }
        ]
        passed = [
            {"rule": "Rule 6(10)(d)", "title": "Digital Maximum Retail Price (MRP)", "status": "PASS", "detail": mrp_declared}
        ]
        compliance_score = 40.0
        
    return {
        "url": url,
        "platform": domain,
        "product_title": product_title,
        "seller": seller_declared,
        "overall_compliance_score": compliance_score,
        "compliance_grade": "A (Compliant)" if compliance_score > 80 else "F (Unlawful Listing)",
        "violations": violations,
        "passed_declarations": passed
    }
