import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.entities import User, LegalRule, Scan, ExtractedField, Violation, Inspection, AuditLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Seed Users if not present
        if db.query(User).count() == 0:
            users = [
                User(username="admin", email="admin@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Dr. Rajesh Mehta (Director)", role="admin", badge_number="DOCA-DIR-001", department="National Compliance & AI Governance"),
                User(username="aniket", email="aniket@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Aniket Kumar", role="inspector", badge_number="DOCA-INSP-2026", department="Delhi NCR (North Zone)"),
                User(username="priya_sharma", email="priya.sharma@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Insp. Priya Sharma", role="inspector", badge_number="DOCA-INSP-302", department="Mumbai Port & Maharashtra Circle"),
                User(username="rahul_nair", email="rahul.nair@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Insp. Rahul Nair", role="inspector", badge_number="DOCA-INSP-415", department="Bengaluru Urban & South Zone"),
                User(username="rajesh_verma", email="rajesh.verma@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Insp. Rajesh Verma", role="inspector", badge_number="DOCA-INSP-209", department="Kolkata Port & Eastern Directorate"),
                User(username="vikram", email="inspector@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Insp. Vikram Singh", role="inspector", badge_number="DOCA-INSP-104", department="Punjab & North-West Circle"),
                User(username="reviewer", email="reviewer@doca.gov.in", hashed_password=get_password_hash("password123"), full_name="Adv. Ananya Sharma", role="reviewer", badge_number="DOCA-LEGAL-042", department="Statutory Review & Notice Directorate"),
                User(username="citizen", email="citizen@gmail.com", hashed_password=get_password_hash("password123"), full_name="Priya Verma (Citizen / Consumer)", role="customer", badge_number="INGRAM-USR-8821", department="Consumer Redressal & Fair Trade Wing")
            ]
            db.add_all(users)
            db.commit()
            print("[OK] Seeded comprehensive officers & regional inspectorate")


        # 2. Seed Versioned Legal Rules
        if db.query(LegalRule).count() == 0:
            rules = [
                LegalRule(
                    rule_code="LMPC_R6_1_A_MFG_ADDRESS",
                    rule_title="Rule 6(1)(a) - Name & Complete Physical Address of Manufacturer/Packer/Importer",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="Every package must declare the legal name and complete physical address (with State/PIN) of the manufacturer, packer, or importer.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹25,000 fine)",
                    severity_level="CRITICAL"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_B_GENERIC_NAME",
                    rule_title="Rule 6(1)(b) - Common or Generic Commodity Name",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="Conspicuous declaration of the common or generic name of commodity contained in package on Principal Display Panel.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹20,000 fine)",
                    severity_level="HIGH"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_C_NET_QTY",
                    rule_title="Rule 6(1)(c) - Net Quantity in Standard Metric Units",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="Net quantity declaration in terms of standard unit of weight, measure or number with SI symbols ('g', 'kg', 'ml', 'l', 'N').",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹25,000 fine)",
                    severity_level="CRITICAL"
                ),
                LegalRule(
                    rule_code="LMPC_R5_NON_STANDARD_UNIT",
                    rule_title="Rule 5 - Prohibition of Non-Standard Units (e.g. 'gms', 'kilo', 'lit')",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="Non-standard abbreviations like 'gm', 'gms', 'ltr', 'doz' are strictly prohibited; metric symbols required.",
                    penalty_clause="Section 36 of Legal Metrology Act, 2009 (₹15,000 fine)",
                    severity_level="HIGH"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_D_MFG_DATE",
                    rule_title="Rule 6(1)(d) - Month & Year of Manufacture / Pre-packing / Import",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="Clear month and year declaration (e.g., '08/2026' or 'Aug 2026') for consumer transparency.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹20,000 fine)",
                    severity_level="HIGH"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_E_MRP",
                    rule_title="Rule 6(1)(e) - Maximum Retail Price (MRP) & Tax Inclusivity",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="MRP declared in Indian Rupees with 'inclusive of all taxes' or 'incl. of all taxes'.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹25,000 fine)",
                    severity_level="CRITICAL"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_E_USP",
                    rule_title="Rule 6(1)(e) Amendment - Mandatory Unit Sale Price (USP)",
                    version="2026.1",
                    effective_from="2022-04-01",
                    requirement_summary="Mandatory Unit Sale Price declaration (e.g. '₹ 0.40 per g' or '₹ 25.00 per 100ml') to prevent deceptive packaging sizes.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹25,000 fine)",
                    severity_level="HIGH"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_F_CONSUMER_CARE",
                    rule_title="Rule 6(1)(f) - Consumer Care Helpline, Email & Contact Person",
                    version="2026.1",
                    effective_from="2011-04-01",
                    requirement_summary="Every package must state consumer care contact person, address, telephone number, and email ID.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹20,000 fine)",
                    severity_level="HIGH"
                ),
                LegalRule(
                    rule_code="LMPC_R6_1_G_COUNTRY_OF_ORIGIN",
                    rule_title="Rule 6(1)(g) - Country of Origin Declaration",
                    version="2026.1",
                    effective_from="2017-06-23",
                    requirement_summary="Mandatory statement of country of manufacture / origin on all packaged commodities.",
                    penalty_clause="Section 36(1) of Legal Metrology Act, 2009 (₹10,000 fine)",
                    severity_level="MEDIUM"
                ),
                LegalRule(
                    rule_code="LMPC_R6_10_ECOM_DECLARATIONS",
                    rule_title="Rule 6(10) - E-Commerce Digital Marketplace Mandatory Declarations",
                    version="2026.1",
                    effective_from="2018-01-01",
                    requirement_summary="All digital marketplace listings must display mandatory LMPC declarations prior to purchase.",
                    penalty_clause="Section 36/38 of Legal Metrology Act, 2009 (₹50,000 fine)",
                    severity_level="CRITICAL"
                )
            ]
            db.add_all(rules)
            db.commit()
            print("[OK] Seeded versioned Legal Metrology rules")

        # 3. Seed Sample Inspection Cases
        if db.query(Scan).count() == 0:
            insp_aniket = db.query(User).filter(User.username == "aniket").first()
            insp_priya = db.query(User).filter(User.username == "priya_sharma").first()
            aniket_id = insp_aniket.id if insp_aniket else 1
            priya_id = insp_priya.id if insp_priya else 2

            # Case 1: Compliant Tata Salt (Audited by Aniket Kumar)
            s1 = Scan(
                product_name="Tata Salt Vacuum Evaporated Iodised Salt 1kg",
                brand_name="Tata Consumer Products",
                category="Food & Grocery",
                barcode="8901030383842",
                front_image_url="/sample_tata_front.jpg",
                back_image_url="/sample_tata_back.jpg",
                status="COMPLETED",
                overall_compliance_score=100.0,
                compliance_grade="A (Fully Compliant)",
                risk_score=12.0,
                is_hitl_verified=True,
                created_by_user_id=aniket_id,
                raw_ocr_text="Tata Salt | Vacuum Evaporated Iodised Salt | MRP Rs 28.00 (Incl of all taxes) | Net Qty 1 kg | Unit Sale Price Rs 0.028/g | Mfg 08/2026 | Made in India | Tata Chemicals Ltd Mithapur Gujarat"
            )
            db.add(s1)
            db.commit()
            db.refresh(s1)
            
            # Fields for Case 1
            fields_s1 = [
                ExtractedField(scan_id=s1.id, field_key="generic_name", field_label="Common / Generic Name", extracted_value="Vacuum Evaporated Iodised Salt", confidence=0.98, bbox={"x": 10, "y": 25, "w": 80, "h": 12}),
                ExtractedField(scan_id=s1.id, field_key="net_quantity", field_label="Net Quantity", extracted_value="1 kg", confidence=0.96, bbox={"x": 10, "y": 70, "w": 40, "h": 10}),
                ExtractedField(scan_id=s1.id, field_key="mrp", field_label="Maximum Retail Price", extracted_value="₹ 28.00", confidence=0.97, bbox={"x": 15, "y": 20, "w": 45, "h": 10}),
                ExtractedField(scan_id=s1.id, field_key="mrp_tax_statement", field_label="Taxes Statement", extracted_value="Incl. of all taxes", confidence=0.94, bbox={"x": 15, "y": 30, "w": 45, "h": 8}),
                ExtractedField(scan_id=s1.id, field_key="unit_sale_price", field_label="Unit Sale Price", extracted_value="₹ 0.028 / g", confidence=0.93, bbox={"x": 15, "y": 40, "w": 45, "h": 8}),
                ExtractedField(scan_id=s1.id, field_key="mfg_date", field_label="Manufacturing Date", extracted_value="08/2026", confidence=0.95, bbox={"x": 15, "y": 50, "w": 35, "h": 8}),
                ExtractedField(scan_id=s1.id, field_key="manufacturer_name_and_address", field_label="Manufacturer Details", extracted_value="Tata Chemicals Limited, Leelanagar, Mithapur, Gujarat - 361345", confidence=0.97, bbox={"x": 10, "y": 65, "w": 80, "h": 15}),
                ExtractedField(scan_id=s1.id, field_key="consumer_care_details", field_label="Consumer Care", extracted_value="Toll Free: 1800-108-4488, Email: care@tataconsumer.com", confidence=0.94, bbox={"x": 10, "y": 82, "w": 80, "h": 12}),
                ExtractedField(scan_id=s1.id, field_key="country_of_origin", field_label="Country of Origin", extracted_value="Made in India", confidence=0.98, bbox={"x": 55, "y": 50, "w": 35, "h": 8})
            ]
            db.add_all(fields_s1)
            
            db.add(Inspection(
                case_number="DOCA-CASE-2026-0001",
                scan_id=s1.id,
                inspector_id=aniket_id,
                stage="CLOSED",
                priority_level="LOW",
                priority_risk_index=12.0
            ))

            # Case 2: High Risk Non-Compliant (QuickBite Foods - Audited by Insp. Priya Sharma)
            s2 = Scan(
                product_name="QuickBite Masala Corn Crisps 85g",
                brand_name="QuickBite Foods Pvt Ltd",
                category="Food & Grocery",
                barcode="8909876543210",
                front_image_url="/sample_quickbite_front.jpg",
                back_image_url="/sample_quickbite_back.jpg",
                status="PENDING_REVIEW",
                overall_compliance_score=42.0,
                compliance_grade="F (Unlawful / Non-Compliant)",
                risk_score=88.5,
                is_hitl_verified=False,
                created_by_user_id=priya_id,
                raw_ocr_text="QuickBite | Masala Corn Crisps | MRP Rs 40 (Tax extra) | Net Wt 85 gms | Pkd 08/2026 | Made in India"
            )
            db.add(s2)
            db.commit()
            db.refresh(s2)
            
            fields_s2 = [
                ExtractedField(scan_id=s2.id, field_key="generic_name", field_label="Common / Generic Name", extracted_value="Extruded Corn Snack", confidence=0.92, bbox={"x": 10, "y": 25, "w": 80, "h": 12}),
                ExtractedField(scan_id=s2.id, field_key="net_quantity", field_label="Net Quantity", extracted_value="85 gms", confidence=0.94, bbox={"x": 10, "y": 70, "w": 40, "h": 10}),
                ExtractedField(scan_id=s2.id, field_key="mrp", field_label="Maximum Retail Price", extracted_value="₹ 4O.00", confidence=0.62, bbox={"x": 15, "y": 20, "w": 45, "h": 10}, requires_human_verification=True), # Low conf OCR '4O' vs '40'
                ExtractedField(scan_id=s2.id, field_key="mrp_tax_statement", field_label="Taxes Statement", extracted_value="Tax Extra", confidence=0.88, bbox={"x": 15, "y": 30, "w": 45, "h": 8}),
                ExtractedField(scan_id=s2.id, field_key="unit_sale_price", field_label="Unit Sale Price", extracted_value=None, confidence=0.0, bbox=None, requires_human_verification=False), # Missing
                ExtractedField(scan_id=s2.id, field_key="mfg_date", field_label="Manufacturing Date", extracted_value="08/2026", confidence=0.91, bbox={"x": 15, "y": 50, "w": 35, "h": 8}),
                ExtractedField(scan_id=s2.id, field_key="manufacturer_name_and_address", field_label="Manufacturer Details", extracted_value="QuickBite Foods Pvt Ltd, Plot 14, Okhla Phase 1", confidence=0.85, bbox={"x": 10, "y": 65, "w": 80, "h": 15}),
                ExtractedField(scan_id=s2.id, field_key="consumer_care_details", field_label="Consumer Care", extracted_value="Email: contact@quickbite.in", confidence=0.80, bbox={"x": 10, "y": 82, "w": 80, "h": 12}, requires_human_verification=True), # Missing Phone
                ExtractedField(scan_id=s2.id, field_key="country_of_origin", field_label="Country of Origin", extracted_value="Made in India", confidence=0.95, bbox={"x": 55, "y": 50, "w": 35, "h": 8})
            ]
            db.add_all(fields_s2)
            
            violations_s2 = [
                Violation(scan_id=s2.id, rule_code="LMPC_R6_1_E_USP_MISSING", rule_title="Rule 6(1)(e) - Unit Sale Price (USP) Omission", severity="CRITICAL", detected_evidence="Unit Sale Price (USP) is completely absent on packaging.", expected_requirement="Mandatory to declare USP (e.g. ₹ 0.47/g) to prevent deceptive package sizing.", ai_confidence=0.95, recommended_action="Issue Show Cause Notice under Section 36 for undeclared USP.", penalty_estimate_inr=25000),
                Violation(scan_id=s2.id, rule_code="LMPC_R5_NON_STANDARD_UNIT", rule_title="Rule 5 - Non-Standard Metric Symbol ('gms')", severity="HIGH", detected_evidence="Found illegal unit syntax '85 gms'.", expected_requirement="Rule 5 mandates standard metric symbol 'g' only.", ai_confidence=0.96, recommended_action="Order mandatory label correction to standard metric symbol 'g'.", penalty_estimate_inr=15000),
                Violation(scan_id=s2.id, rule_code="LMPC_R6_1_E_TAX_STATEMENT", rule_title="Rule 6(1)(e) - Illegal 'Tax Extra' Clause on MRP", severity="CRITICAL", detected_evidence="Declared as 'MRP Rs 40 (Tax extra)'. Under LMPC Rules, MRP must be all-inclusive.", expected_requirement="MRP must strictly be inclusive of all taxes.", ai_confidence=0.93, recommended_action="Initiate immediate penal proceedings under Section 36(1).", penalty_estimate_inr=25000),
                Violation(scan_id=s2.id, rule_code="LMPC_R6_1_F_CONSUMER_CARE_INCOMPLETE", rule_title="Rule 6(1)(f) - Incomplete Consumer Care Details", severity="MEDIUM", detected_evidence="Consumer care provides email only; telephone helpline number is missing.", expected_requirement="Consumer care must provide both active telephone and email.", ai_confidence=0.89, recommended_action="Direct manufacturer to add working telephone helpline.", penalty_estimate_inr=15000)
            ]
            db.add_all(violations_s2)
            
            db.add(Inspection(
                case_number="DOCA-CASE-2026-0002",
                scan_id=s2.id,
                inspector_id=priya_id,
                stage="TRIAGE",
                priority_level="HIGH",
                priority_risk_index=88.5
            ))
            
            db.commit()
            print("[OK] Seeded sample cases with authentic inspector links")

            
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
