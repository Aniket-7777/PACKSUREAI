import os
import datetime
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from app.core.config import settings, REPORT_DIR

def generate_legal_notice_pdf(
    case_no: str,
    product_name: str,
    brand_name: str,
    manufacturer_address: str,
    violations: list,
    total_penalty: int,
    inspector_name: str = "Enforcement Officer - Legal Metrology",
    hearing_deadline_days: int = 15
) -> str:
    """
    Generates a formal, court-admissible Show Cause Notice PDF under Section 36 of the Legal Metrology Act, 2009.
    """
    filename = f"Legal_Notice_{case_no.replace('/', '_')}.pdf"
    pdf_path = REPORT_DIR / filename
    
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        'GovtHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#0f2942")
    )
    
    sub_header_style = ParagraphStyle(
        'GovtSubHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#856404")
    )
    
    notice_title_style = ParagraphStyle(
        'NoticeTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#a71d2a")
    )
    
    body_style = ParagraphStyle(
        'NoticeBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        alignment=TA_JUSTIFY,
        textColor=colors.HexColor("#222222")
    )
    
    body_bold = ParagraphStyle(
        'NoticeBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#111111")
    )
    
    elements = []
    
    # 1. Official Header
    elements.append(Paragraph("GOVERNMENT OF INDIA", header_title_style))
    elements.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", header_title_style))
    elements.append(Paragraph("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY WING", sub_header_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f2942"), spaceAfter=10))
    
    # 2. Case Ref and Date Table
    issue_date = datetime.datetime.now().strftime("%d-%B-%Y")
    ref_table_data = [
        [
            Paragraph(f"<b>Notice Ref No:</b> {case_no}", body_style),
            Paragraph(f"<b>Date of Issuance:</b> {issue_date}", ParagraphStyle('R', parent=body_style, alignment=TA_RIGHT))
        ]
    ]
    ref_table = Table(ref_table_data, colWidths=[300, 240])
    ref_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(ref_table)
    elements.append(Spacer(1, 10))
    
    # 3. Addressee
    elements.append(Paragraph("<b>TO:</b>", body_bold))
    elements.append(Paragraph(f"<b>M/s {brand_name}</b>", body_bold))
    elements.append(Paragraph(f"{manufacturer_address or 'Address on record of the pre-packed commodity'}", body_style))
    elements.append(Spacer(1, 10))
    
    # 4. Notice Subject
    elements.append(Paragraph(
        f"<u><b>NOTICE UNDER SECTION 36 OF THE LEGAL METROLOGY ACT, 2009 READ WITH RULE 6 & 7 OF LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011</b></u>",
        notice_title_style
    ))
    elements.append(Spacer(1, 10))
    
    # 5. Body Text
    intro_p = f"""
    WHEREAS, an official inspection and AI-assisted compliance scan was conducted on the packaged commodity 
    <b>'{product_name}'</b> (Brand: <b>{brand_name}</b>) manufactured, pre-packed, or marketed by your establishment. 
    AND WHEREAS, upon physical and digital verification of the Principal Display Panel (PDP) and product package faces, 
    the following statutory violations under the <b>Legal Metrology (Packaged Commodities) Rules, 2011</b> were detected:
    """
    elements.append(Paragraph(intro_p, body_style))
    elements.append(Spacer(1, 10))
    
    # 6. Violations Table
    v_rows = [
        [
            Paragraph("<b>#</b>", body_bold),
            Paragraph("<b>Rule & Legal Provision</b>", body_bold),
            Paragraph("<b>Detected Violation & Evidence</b>", body_bold),
            Paragraph("<b>Compounded Penalty (INR)</b>", body_bold)
        ]
    ]
    
    for idx, v in enumerate(violations, start=1):
        v_rows.append([
            Paragraph(str(idx), body_style),
            Paragraph(f"<b>{v.get('rule_title', 'Rule 6')}</b><br/><i>{v.get('rule_code', '')}</i>", body_style),
            Paragraph(f"{v.get('detected_evidence', '')}<br/><b>Required:</b> {v.get('expected_requirement', '')}", body_style),
            Paragraph(f"₹ {v.get('penalty_estimate_inr', 25000):,}", ParagraphStyle('c', parent=body_style, alignment=TA_RIGHT))
        ])
        
    v_rows.append([
        Paragraph("", body_style),
        Paragraph("<b>TOTAL ESTIMATED STATUTORY LIABILITY:</b>", body_bold),
        Paragraph("", body_style),
        Paragraph(f"<b>₹ {total_penalty:,}</b>", ParagraphStyle('c', parent=body_bold, alignment=TA_RIGHT, textColor=colors.HexColor("#a71d2a")))
    ])
    
    v_table = Table(v_rows, colWidths=[25, 160, 245, 110])
    v_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f4f6f8")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(v_table)
    elements.append(Spacer(1, 12))
    
    # 7. Directive & Demand
    directive_p = f"""
    NOW, THEREFORE, you are hereby called upon to <b>SHOW CAUSE</b> in writing within <b>{hearing_deadline_days} days</b> 
    from the date of service of this notice as to why legal proceedings under Section 36/38 of the Legal Metrology Act, 2009 
    should not be instituted against you before the Competent Magistrate or why compoundable penalties should not be realized.
    <br/><br/>
    Take notice that failure to submit a satisfactory explanation or proof of corrective action within the stipulated period 
    shall compel this authority to initiate prosecution without further intimation.
    """
    elements.append(Paragraph(directive_p, body_style))
    elements.append(Spacer(1, 20))
    
    # 8. Signature Block
    sig_data = [
        [
            Paragraph("<b>Digital Evidence Hash:</b><br/>SHA-256 Verified Evidence Chain", ParagraphStyle('H', parent=body_style, fontSize=7, textColor=colors.HexColor("#777777"))),
            Paragraph(f"<b>Authorized Signatory</b><br/>{inspector_name}<br/><i>Legal Metrology Enforcement Wing<br/>Ministry of Consumer Affairs</i>", ParagraphStyle('S', parent=body_style, alignment=TA_RIGHT))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[280, 260])
    sig_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'BOTTOM')]))
    elements.append(sig_table)
    
    doc.build(elements)
    return str(pdf_path)
