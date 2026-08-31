import os
import sys
from pathlib import Path

# Set up project path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.core.database import SessionLocal, engine
from app.models.entities import User, Scan, Inspection, Violation, ExtractedField, AuditLog
from sqlalchemy import inspect

def print_separator(title=""):
    print("\n" + "=" * 85)
    if title:
        print(f"  {title}")
        print("=" * 85)

def show_database_tables():
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    
    print_separator("DATABASE TABLES REGISTERED IN PACKSURE-AI")
    print(f"Connected Engine: {engine.url.drivername} ({engine.url.database or 'PostgreSQL / Neon'})")
    print(f"Total Registered Tables: {len(table_names)}")
    for i, t in enumerate(table_names, 1):
        cols = [c['name'] for c in inspector.get_columns(t)]
        print(f"  {i}. Table: '{t:<16}' -> Columns: {', '.join(cols[:5])}{'...' if len(cols) > 5 else ''}")

def show_sample_data():
    db = SessionLocal()
    try:
        # 1. Users / Officers
        print_separator("1. TABLE: users (Enforcement Officers & Statutory Roles)")
        users = db.query(User).all()
        print(f"{'ID':<4} | {'Username':<14} | {'Full Name':<24} | {'Badge':<16} | {'Role':<10} | {'Department'}")
        print("-" * 85)
        for u in users:
            print(f"{u.id:<4} | {u.username:<14} | {u.full_name:<24} | {u.badge_number or 'N/A':<16} | {u.role:<10} | {u.department or 'N/A'}")

        # 2. Scanned Commodities
        print_separator("2. TABLE: scans (Packaged Commodity Evidence Records)")
        scans = db.query(Scan).order_by(Scan.id.desc()).limit(5).all()
        print(f"{'ID':<4} | {'Product Name':<30} | {'Brand':<15} | {'Score':<7} | {'Risk':<5} | {'Status'}")
        print("-" * 85)
        for s in scans:
            p_name = (s.product_name[:27] + '...') if s.product_name and len(s.product_name) > 30 else (s.product_name or 'N/A')
            print(f"{s.id:<4} | {p_name:<30} | {str(s.brand_name)[:15]:<15} | {str(s.overall_compliance_score) + '%':<7} | {s.risk_score:<5} | {s.status}")

        # 3. Inspection Dockets & Section 36 Cases
        print_separator("3. TABLE: inspections (Statutory Enforcement Dockets)")
        inspections = db.query(Inspection).order_by(Inspection.id.desc()).limit(5).all()
        print(f"{'ID':<4} | {'Case Number':<24} | {'Scan ID':<8} | {'Stage':<14} | {'Priority':<8} | {'Notice Issued'}")
        print("-" * 85)
        for insp in inspections:
            print(f"{insp.id:<4} | {insp.case_number:<24} | {insp.scan_id:<8} | {insp.stage:<14} | {insp.priority_level:<8} | {str(insp.legal_notice_issued)}")

        # 4. Violations Logged
        print_separator("4. TABLE: violations (Detected Legal Breaches under LMPC 2011)")
        violations = db.query(Violation).order_by(Violation.id.desc()).limit(5).all()
        print(f"{'ID':<4} | {'Scan':<5} | {'Rule Code':<16} | {'Severity':<9} | {'Penalty':<12} | {'Detected Evidence'}")
        print("-" * 85)
        for v in violations:
            ev = (v.detected_evidence[:28] + '...') if v.detected_evidence and len(v.detected_evidence) > 30 else (v.detected_evidence or 'N/A')
            print(f"{v.id:<4} | {v.scan_id:<5} | {v.rule_code:<16} | {v.severity:<9} | ₹{v.penalty_estimate_inr or 25000:<11} | {ev}")

        # 5. Audit Trail
        print_separator("5. TABLE: audit_logs (Immutable Chain-of-Custody Log)")
        audits = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(5).all()
        print(f"{'ID':<4} | {'Officer':<12} | {'Action':<24} | {'Entity':<10} | {'Timestamp'}")
        print("-" * 85)
        for a in audits:
            t_str = a.created_at.strftime('%Y-%m-%d %H:%M:%S') if a.created_at else 'N/A'
            print(f"{a.id:<4} | {a.username:<12} | {a.action_type:<24} | {a.entity_type:<10} | {t_str}")

        print_separator("END OF LIVE DATABASE INSPECTION")

    finally:
        db.close()

if __name__ == "__main__":
    show_database_tables()
    show_sample_data()
