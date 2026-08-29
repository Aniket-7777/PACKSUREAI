import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(200), default="Officer")
    role = Column(String(50), default="inspector") # admin, inspector, reviewer, citizen
    badge_number = Column(String(100), default="DOCA-INSP-2026")
    department = Column(String(200), default="Legal Metrology Enforcement Wing")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LegalRule(Base):
    __tablename__ = "legal_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    rule_code = Column(String(50), unique=True, index=True) # e.g. "RULE_6_USP", "RULE_5_UNITS"
    rule_title = Column(String(255), nullable=False)
    version = Column(String(50), default="2026.1")
    effective_from = Column(String(50), default="2011-04-01")
    effective_to = Column(String(50), nullable=True) # null = currently active
    applicable_categories = Column(String(255), default="ALL") # ALL, FOOD, COSMETICS, COMMODITIES
    requirement_summary = Column(Text, nullable=False)
    legal_act_reference = Column(String(255), default="Legal Metrology (Packaged Commodities) Rules, 2011")
    penalty_clause = Column(String(255), default="Sec 36 of Legal Metrology Act, 2009 (₹25,000 fine)")
    severity_level = Column(String(50), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    is_active = Column(Boolean, default=True)

class Scan(Base):
    __tablename__ = "scans"
    
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(255), default="Unidentified Package")
    brand_name = Column(String(255), default="Unknown Brand")
    category = Column(String(100), default="Food & Grocery")
    barcode = Column(String(100), nullable=True)
    
    # Packaging Images (Front, Back, Side, Bottom)
    front_image_url = Column(String(500), nullable=True)
    back_image_url = Column(String(500), nullable=True)
    side_image_url = Column(String(500), nullable=True)
    bottom_image_url = Column(String(500), nullable=True)
    
    # E-Commerce audit link if applicable
    ecommerce_url = Column(String(1000), nullable=True)
    
    # Status & Evaluation
    status = Column(String(50), default="COMPLETED") # PENDING_REVIEW, COMPLETED, VIOLATION_CONFIRMED
    overall_compliance_score = Column(Float, default=100.0) # 0 to 100
    compliance_grade = Column(String(50), default="A") # A, B, C, F
    risk_score = Column(Float, default=10.0) # 0 to 100 Priority Risk Index
    is_hitl_verified = Column(Boolean, default=True)
    
    # Raw OCR payload
    raw_ocr_text = Column(Text, nullable=True)
    quality_warnings = Column(JSON, default=list)
    
    created_by_user_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    extracted_fields = relationship("ExtractedField", back_populates="scan", cascade="all, delete-orphan")
    violations = relationship("Violation", back_populates="scan", cascade="all, delete-orphan")
    inspection = relationship("Inspection", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    field_key = Column(String(100), nullable=False) # e.g. "mrp", "unit_sale_price", "net_quantity", "manufacturer_address"
    field_label = Column(String(200), nullable=False)
    extracted_value = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95) # 0.00 to 1.00
    bbox = Column(JSON, nullable=True) # { "x": 10, "y": 20, "w": 100, "h": 40, "face": "back" }
    
    # Human in the Loop (HITL) fields
    requires_human_verification = Column(Boolean, default=False)
    is_verified_by_human = Column(Boolean, default=False)
    human_corrected_value = Column(Text, nullable=True)
    verification_notes = Column(String(255), nullable=True)
    
    scan = relationship("Scan", back_populates="extracted_fields")

class Violation(Base):
    __tablename__ = "violations"
    
    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    rule_code = Column(String(100), nullable=False)
    rule_title = Column(String(255), nullable=False)
    severity = Column(String(50), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    
    detected_evidence = Column(Text, nullable=False)
    expected_requirement = Column(Text, nullable=False)
    ai_confidence = Column(Float, default=0.92)
    recommended_action = Column(Text, nullable=False)
    penalty_estimate_inr = Column(Integer, default=25000)
    
    is_dismissed = Column(Boolean, default=False)
    dismissal_reason = Column(String(255), nullable=True)
    
    scan = relationship("Scan", back_populates="violations")

class Inspection(Base):
    __tablename__ = "inspections"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(100), unique=True, index=True) # e.g. "DOCA-CASE-2026-0042"
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    inspector_id = Column(Integer, nullable=True)
    reviewer_id = Column(Integer, nullable=True)
    
    stage = Column(String(50), default="TRIAGE") # TRIAGE, UNDER_REVIEW, NOTICE_ISSUED, HEARING, COMPOUNDED, CLOSED
    priority_level = Column(String(50), default="MEDIUM") # HIGH, MEDIUM, LOW
    priority_risk_index = Column(Float, default=45.0)
    
    legal_notice_issued = Column(Boolean, default=False)
    notice_reference_no = Column(String(100), nullable=True)
    notice_issued_date = Column(DateTime, nullable=True)
    notice_pdf_path = Column(String(500), nullable=True)
    hearing_deadline_days = Column(Integer, default=15)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    scan = relationship("Scan", back_populates="inspection")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    username = Column(String(100), default="system")
    user_role = Column(String(50), default="inspector")
    action_type = Column(String(100), nullable=False) # e.g. "SCAN_CREATED", "HITL_FIELD_CORRECTED", "NOTICE_DISPATCHED"
    entity_type = Column(String(100), nullable=False) # "scan", "field", "inspection", "rule"
    entity_id = Column(Integer, nullable=True)
    change_summary = Column(Text, nullable=False)
    ip_address = Column(String(100), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
