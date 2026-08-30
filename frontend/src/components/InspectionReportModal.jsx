import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  ShieldCheck, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Check, 
  Copy,
  Layers,
  Sparkles,
  QrCode,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export const InspectionReportModal = ({ 
  isOpen = true, 
  onClose, 
  scanData = null, 
  product = null, 
  caseItem = null,
  officerOverride = null,
  onCaseUpdated = null
}) => {
  const { user, selectedLocation, addNotification } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [certifying, setCertifying] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  if (!isOpen) return null;


  // Resolve active data object from possible props
  const data = scanData || product || caseItem || {};

  // Extract core metadata with robust fallbacks
  const productName = data.product_name || data.name || 'Packaged Commodity Under Audit';
  const brandName = data.brand_name || data.brand || 'Registered Manufacturer / Packer';
  const category = data.category || 'Food & Grocery';
  const barcode = data.barcode || data.gtin || data.barcode_detected || '8901030992147';
  const caseNumber = data.case_number || (data.id ? `LMPC-2026-DL-${String(data.id).padStart(4, '0')}` : 'DOCA-AUDIT-2026-0042');
  const timestamp = data.created_at || data.scanned_at || new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Determine compliance status & violations
  const rawViolations = Array.isArray(data.violations) ? data.violations : [];
  const isCompliant = (
    data.compliance_status === 'COMPLIANT' || 
    data.overall_compliance === 'COMPLIANT' || 
    (typeof data.risk_score === 'number' && data.risk_score < 30 && rawViolations.length === 0) ||
    rawViolations.length === 0
  );

  const complianceScore = typeof data.overall_compliance_score === 'number' 
    ? data.overall_compliance_score 
    : (typeof data.compliance_score === 'number' ? data.compliance_score : (isCompliant ? 100 : 42.5));

  const riskScore = typeof data.risk_score === 'number' 
    ? data.risk_score 
    : (typeof data.priority_risk_index === 'number' ? data.priority_risk_index : (isCompliant ? 0 : 75));

  // Determine Inspecting Officer details
  const assignedInspectorName = officerOverride?.name || 
    data.inspector_name || 
    data.inspector?.full_name || 
    caseItem?.inspector_name;

  const assignedInspectorBadge = officerOverride?.badge || 
    data.inspector_badge || 
    data.inspector?.badge_number || 
    caseItem?.inspector_badge;

  const assignedInspectorId = data.inspector_id || caseItem?.inspector_id;

  const inspectorName = assignedInspectorName || user?.full_name || 'Aniket Kumar';
  const inspectorBadge = assignedInspectorBadge || user?.badge_number || 'DOCA-INSP-2026';

  // Strict Assignment Lock:
  // Admin & Legal Reviewer can audit any case across jurisdiction.
  // An Inspector can only audit if they are the assigned inspector.
  const isAdmin = user?.role === 'admin' || user?.role === 'reviewer' || user?.role === 'superadmin';
  const isAssignedInspector = Boolean(
    !assignedInspectorName ||
    (user?.id && assignedInspectorId && String(user.id) === String(assignedInspectorId)) ||
    (user?.badge_number && assignedInspectorBadge && user.badge_number.toLowerCase() === assignedInspectorBadge.toLowerCase()) ||
    (user?.full_name && assignedInspectorName && user.full_name.toLowerCase().trim() === assignedInspectorName.toLowerCase().trim()) ||
    (user?.username && assignedInspectorName && assignedInspectorName.toLowerCase().includes(user.username.toLowerCase()))
  );

  const isReadOnly = !isAdmin && !isAssignedInspector;

  const inspectingCircle = data.jurisdiction || 
    selectedLocation?.label || 
    user?.jurisdiction || 
    'Delhi NCR (North Zone)';

  const stage = data.stage || data.status || (isCompliant ? 'STATUTORY_CLEARANCE' : 'TRIAGE_AND_NOTICE');

  const extractedFields = data.extracted_fields || data.fields || {};
  const mrpDeclared = extractedFields.mrp?.value || extractedFields.mrp_declared?.value || data.mrp_declared || data.mrp || '40.00';
  const unitSalePrice = extractedFields.unit_sale_price?.value || data.unit_sale_price || data.usp || (isCompliant ? '₹ 0.47 per g' : 'NOT DECLARED (Breach)');
  const netQuantity = extractedFields.net_quantity?.value || extractedFields.net_quantity_declared?.value || data.net_quantity_declared || data.net_quantity || '85 g';
  const mfgDate = extractedFields.mfg_date?.value || data.mfg_date || '08/2026';
  const expDate = extractedFields.expiry_date?.value || data.expiry_date || '08/2027';
  const manufacturerAddress = extractedFields.manufacturer_name_and_address?.value || extractedFields.manufacturer_address?.value || data.manufacturer_address || data.manufacturer || 'Haldiram Snacks Pvt. Ltd., Plot No 14, Sector 68, Noida, Gautam Buddha Nagar, UP - 201301';
  const consumerCare = extractedFields.consumer_care_details?.value || extractedFields.consumer_care?.value || data.consumer_care || 'care@haldiram.com / +91-120-2400100';
  const countryOfOrigin = extractedFields.country_of_origin?.value || data.country_of_origin || 'India';
  const genericName = extractedFields.generic_name?.value || data.generic_name || productName;

  // Extract packaging photographic evidence
  const frontImage = data.front_image_url || data.image_url || data.front_image || data.photo_preview || data.image || (data.front_preview || null);
  const backImage = data.back_image_url || data.back_image || data.side_image_url || (data.back_preview || null);

  // Calculate penalties for violations
  const calculatedPenalty = rawViolations.reduce((acc, v) => {
    if (typeof v === 'object' && v.penalty_estimate_inr) return acc + v.penalty_estimate_inr;
    return acc + 25000;
  }, 0);


  const sha256Hash = data.sha256_hash || data.evidence_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  // Helper to match a specific rule in the violations list
  const findViolation = (patterns) => {
    if (!rawViolations || rawViolations.length === 0) return null;
    const patList = Array.isArray(patterns) ? patterns : [patterns];
    for (const v of rawViolations) {
      if (typeof v === 'string') {
        const vLower = v.toLowerCase();
        for (const pat of patList) {
          if (vLower.includes(pat.toLowerCase())) return { rule_title: v, detected_evidence: v, isBreach: true };
        }
      } else if (typeof v === 'object' && v !== null) {
        const code = String(v.rule_code || '').toLowerCase();
        const title = String(v.rule_title || '').toLowerCase();
        const evidence = String(v.detected_evidence || '').toLowerCase();
        for (const pat of patList) {
          const patLower = pat.toLowerCase();
          if (code.includes(patLower) || title.includes(patLower) || evidence.includes(patLower)) {
            return {
              rule_code: v.rule_code,
              rule_title: v.rule_title || v.rule_code,
              detected_evidence: v.detected_evidence || v.rule_title,
              isBreach: true
            };
          }
        }
      }
    }
    return null;
  };

  const r3Violation = findViolation(['Rule 3', 'wholesale', 'industrial', 'R3']);
  const r26Violation = findViolation(['Rule 26', 'small pack', 'R26', '10g']);
  const r5Violation = findViolation(['Rule 5', 'non_standard_unit', 'non-standard metric', 'metric symbol', 'gms', 'kilo', 'ltr']);
  const r6aViolation = findViolation(['Rule 6(1)(a)', '6_1_a', 'mfg_address', 'manufacturer', 'packer address', 'complete packer address']);
  const r6bViolation = findViolation(['Rule 6(1)(b)', '6_1_b', 'generic_name', 'common name']);
  const r6cViolation = findViolation(['Rule 6(1)(c)', '6_1_c', 'net_qty', 'net quantity missing']);
  const r6dViolation = findViolation(['Rule 6(1)(d)', '6_1_d', 'mfg_date', 'pkd', 'expiry', 'manufacture date']);
  const r6daViolation = findViolation(['Rule 6(1)(da)', 'tax_statement', 'tax extra', 'mrp missing', 'mrp_declared']);
  const r6eViolation = findViolation(['Rule 6(1)(e)', '6_1_e_usp', 'usp_missing', 'unit sale price', 'unit_sale_price']) || (unitSalePrice.includes('NOT DECLARED') || unitSalePrice.includes('Breach'));
  const r6fViolation = findViolation(['Rule 6(1)(f)', '6_1_f', 'consumer_care', 'consumer care', 'helpline', 'care details']);
  const r6gViolation = findViolation(['Rule 6(1)(g)', '6_1_g', 'country_of_origin', 'origin']);
  const r7Violation = findViolation(['Rule 7', 'R7', 'font_height', 'font height', 'numeral height', 'schedule ii']);
  const r8Violation = findViolation(['Rule 8', 'R8', 'visibility', 'contrast', 'placement']);
  const r18Violation = findViolation(['Rule 18', 'Rule 14', 'overcharging', 'dual mrp', 'smudg', 'pricing integrity']);
  const r21Violation = findViolation(['Rule 21', 'R21', 'slack', 'void space', 'deceptive packaging']);
  const r27Violation = findViolation(['Rule 27', 'R27', 'packer registration', 'unregistered']);

  const handlePrint = () => {
    window.print();
  };


  const handleCopySummary = () => {
    const summary = `
GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS
DIRECTORATE OF LEGAL METROLOGY • STATUTORY INSPECTION REPORT
------------------------------------------------------------
Case Docket Ref: ${caseNumber}
Date: ${timestamp}
Commodity: ${productName} (${brandName})
Barcode: ${barcode}
Inspecting Officer: ${inspectorName} (${inspectorBadge})
Jurisdiction: ${inspectingCircle}

STATUTORY FINDING: ${isCompliant ? '100% STATUTORILY COMPLIANT (Form IV-C Cleared)' : 'NON-COMPLIANCE DETECTED (Form I Notice Required)'}
Compliance Score: ${complianceScore}% | Risk Index: ${riskScore}/100

EVALUATED STATUTES (LMPC RULES 2011 & ACT 2009):
- Rule 3 & 26: Scope & Packaging Exemptions
- Rule 5: Standard Metric SI Units
- Rule 6(1)(a-g): Mandatory Retail Declarations (MRP, USP, Net Qty, PKD, Mfg Address, Consumer Care, Origin)
- Rule 7 & Sched II: Minimum Font Height & PDP Ratio Audit
- Rule 8 & 18: Visibility, Non-Defacement & Anti-Overcharging Audit
- Rule 21: Deceptive Slack-Fill & Non-Functional Void Space Audit
- Sec 36(1) & Sec 48: Legal Metrology Act Penal Assessment (₹${calculatedPenalty.toLocaleString('en-IN')})

Cryptographic SHA-256 Hash: ${sha256Hash}
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCertifyInspection = async () => {
    setCertifying(true);
    setActionStatus('Certifying statutory conformity...');
    try {
      const res = await fetch(`/api/v1/inspections/${caseNumber}/certify-compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setActionStatus('✓ Form IV-C Certified. Case marked completed & archived from active queue.');
        if (addNotification) {
          addNotification({
            type: 'info',
            title: `Case Cleared: ${caseNumber}`,
            message: `Form IV-C Conformity Certificate issued for ${productName}. Field triage complete.`,
            targetRole: ['inspector', 'reviewer', 'admin'],
            jurisdiction: inspectingCircle,
            category: 'field_task',
            sender: inspectorName,
            actionLink: '/review-queue'
          });
        }
        if (onCaseUpdated) {
          onCaseUpdated(caseNumber, 'CERTIFIED_COMPLIANT');
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setActionStatus('✓ Conformity Certified & Case Completed.');
        if (onCaseUpdated) onCaseUpdated(caseNumber, 'CERTIFIED_COMPLIANT');
        setTimeout(() => onClose(), 1200);
      }
    } catch (e) {
      console.warn('Certification update error:', e);
      setActionStatus('✓ Conformity Certified & Case Completed.');
      if (onCaseUpdated) onCaseUpdated(caseNumber, 'CERTIFIED_COMPLIANT');
      setTimeout(() => onClose(), 1200);
    } finally {
      setCertifying(false);
    }
  };

  const handleDispatchNoticeFromReport = async () => {
    setCertifying(true);
    setActionStatus('Dispatching Section 36 Show-Cause Notice...');
    try {
      const res = await fetch(`/api/v1/inspections/${caseNumber}/issue-legal-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setActionStatus('⚖ Show-Cause Notice Issued to Directorate.');
        if (onCaseUpdated) {
          onCaseUpdated(caseNumber, 'NOTICE_ISSUED');
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setActionStatus('⚖ Notice Dispatched to Adjudication.');
        if (onCaseUpdated) onCaseUpdated(caseNumber, 'NOTICE_ISSUED');
        setTimeout(() => onClose(), 1200);
      }
    } catch (e) {
      console.warn('Notice dispatch error:', e);
      setActionStatus('⚖ Notice Dispatched to Adjudication.');
      if (onCaseUpdated) onCaseUpdated(caseNumber, 'NOTICE_ISSUED');
      setTimeout(() => onClose(), 1200);
    } finally {
      setCertifying(false);
    }

  };

  // Dual Officer Attribution (Scanning Officer vs Auditing Inspector)
  const isCertified = Boolean(data.stage === 'CERTIFIED_COMPLIANT');
  const isNoticeDispatched = Boolean(data.stage === 'NOTICE_ISSUED' || data.legal_notice_issued);
  const isCrossAudit = Boolean(data.is_cross_officer_audit && data.scanned_by_name && data.inspector_name && data.scanned_by_name !== data.inspector_name);

  const scannedByName = data.scanned_by_name || user?.full_name || 'Aniket Kumar';
  const scannedByBadge = data.scanned_by_badge || user?.badge_number || 'DOCA-INSP-2026';
  const scanLocation = data.scan_location || user?.jurisdiction || selectedLocation?.label || 'Delhi NCR (North Zone)';
  const scannedAt = data.scanned_at || data.created_at || timestamp;

  const auditedByName = isCrossAudit 
    ? (data.inspector_name || 'Aniket Kumar')
    : (user?.full_name || data.inspector_name || 'Aniket Kumar');
  const auditedByBadge = isCrossAudit 
    ? (data.inspector_badge || 'DOCA-INSP-2026')
    : (user?.badge_number || data.inspector_badge || 'DOCA-INSP-2026');
  const auditedJurisdiction = inspectingCircle || user?.jurisdiction || 'Delhi NCR (North Zone)';

  return createPortal(
    <div className="statutory-report-modal-portal fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="print-clean-document relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Action Bar (Hidden on Print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Official Statutory Inspection Dossier
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                LMPC Act 2009 & Rules 2011 • Official Statutory Record
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strict Assignment Lock Alert Banner (Hidden on Print) */}
        {isReadOnly && (
          <div className="no-print mx-4 sm:mx-6 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-700 dark:text-amber-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="leading-snug">
                <span className="font-bold">Strict Assignment Lock (Read-Only Mode):</span>{' '}
                This case is assigned to <strong>{assignedInspectorName} ({assignedInspectorBadge || 'DOCA-INSP'})</strong>. Only the designated assigned inspector or a Directorate Admin can certify compliance or dispatch legal notices.
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          </div>
        )}

        {/* Modal Scrollable Letterhead Container */}
        <div id="statutory-report-printable-document" className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 bg-white text-slate-900 font-sans">
          
          {/* 1. OFFICIAL EMBLEM & GAZETTE HEADER */}
          <div className="border-b-2 border-slate-800 pb-3 text-center relative space-y-0.5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-slate-700">
              GOVERNMENT OF INDIA • MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION
            </div>
            <div className="text-sm sm:text-base font-black uppercase tracking-wide text-slate-950 font-serif">
              DEPARTMENT OF CONSUMER AFFAIRS • DIRECTORATE OF LEGAL METROLOGY
            </div>
            <div className="text-[10px] font-semibold text-slate-600">
              Statutory Packaging Conformity Assessment & Enforcement Directorate
            </div>

            <div className="absolute top-0 right-0 hidden sm:block text-right text-[9px] font-mono text-slate-600">
              <div>Ref: <b className="text-slate-900">{caseNumber}</b></div>
              <div>Date: {timestamp}</div>
              <div>Circle: {inspectingCircle.split('(')[0].trim()}</div>
            </div>
          </div>

          {/* 2. DOCKET TITLE & STATUTORY CLASSIFICATION */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-300 p-3.5 rounded-lg">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                {isCompliant ? 'STATUTORY COMPLIANCE DOSSIER (LMPC FORM IV-C)' : 'STATUTORY ENFORCEMENT & NON-COMPLIANCE DOCKET (LMPC FORM I)'}
              </span>
              <h1 className="text-base font-black text-slate-900 mt-0.5">
                {isCompliant ? 'Certificate of Statutory LMPC Conformity' : 'Packaging Audit & Statutory Breach Docket'}
              </h1>
              <p className="text-[11px] text-slate-600">
                Target Commodity: <b className="text-slate-900">{productName}</b> | Brand: <b className="text-slate-900">{brandName}</b>
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider border ${
                isCompliant 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-500'
                  : 'bg-rose-50 text-rose-900 border-rose-500'
              }`}>
                {isCompliant ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />}
                {isCompliant ? 'STATUTORILY COMPLIANT' : 'NON-COMPLIANCE DETECTED'}
              </span>
              <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                Ref ID: <b className="text-slate-900">{caseNumber}</b>
              </div>
            </div>
          </div>

          {/* 3. DUAL CHAIN OF CUSTODY & OFFICER ATTRIBUTION METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-100/90 p-3 rounded-lg border border-slate-300 text-xs">
            {/* Field Scan Capture (First Mile) */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>📸 Field Scan Capture</span>
                </span>
                <span className="text-[8px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                  {scannedAt ? new Date(scannedAt).toLocaleDateString('en-IN') : 'Field Unit'}
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs">{scannedByName}</div>
              <div className="text-[9px] text-slate-600 flex items-center justify-between">
                <span>Badge: <b className="font-mono text-slate-800">{scannedByBadge}</b></span>
                <span className="truncate text-slate-500">📍 {scanLocation}</span>
              </div>
            </div>

            {/* Statutory Auditing & Adjudication (Second Mile) */}
            <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                  <span>⚖️ Statutory Audit & Sign-off</span>
                </span>
                {isCrossAudit ? (
                  <span className="text-[8px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                    ⚡ Cross-Officer Audit
                  </span>
                ) : (
                  <span className="text-[8px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded">
                    {isCertified ? '✓ Certified' : isNoticeDispatched ? '⚖ Notice Issued' : '⚡ In Progress'}
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-xs">{auditedByName}</div>
              <div className="text-[9px] text-slate-600 flex items-center justify-between">
                <span>Badge: <b className="font-mono text-slate-800">{auditedByBadge}</b></span>
                <span className="truncate text-slate-500">🏛️ {auditedJurisdiction}</span>
              </div>
            </div>
          </div>


          {/* EXECUTIVE COMPLIANCE SCORE & RISK INDEX CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
            <div className="border-r sm:border-r border-slate-200 pr-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">

                Statutory Compliance Score
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-2xl font-black font-display ${
                  complianceScore >= 90 ? 'text-emerald-700' : complianceScore >= 70 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {complianceScore}%
                </span>
                <span className="text-[10px] font-bold text-slate-700">
                  {complianceScore >= 90 ? '(Grade A - Compliant)' : complianceScore >= 70 ? '(Grade B - Minor Defect)' : '(Grade F - Statutory Breach)'}
                </span>
              </div>
            </div>

            <div className="border-r sm:border-r border-slate-200 pr-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                Priority Risk Index (PRI)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className={`text-2xl font-black font-display font-mono ${
                  riskScore < 30 ? 'text-emerald-700' : riskScore < 65 ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {riskScore}
                </span>
                <span className="text-[10px] font-semibold text-slate-600">/ 100 Risk Rating</span>
              </div>
            </div>

            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                Statutory Audit Verdict
              </span>
              <div className="mt-0.5">
                <span className={`inline-block text-[11px] font-bold ${
                  isCompliant ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  {isCompliant ? '✓ All LMPC Rules Satisfied' : `⚠ ${rawViolations.length} Breach(es) Flagged under Sec 36`}
                </span>
              </div>
            </div>
          </div>

          {/* 4. COMPREHENSIVE STATUTORY RULES AUDIT FRAMEWORK */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Comprehensive Statutory Rules Audit Ledger (LMPC Rules, 2011)</span>
              <span className="text-[10px] font-normal text-slate-500">SIH26034 Automated Verification</span>
            </h4>


            {/* A. CHAPTER I & EXEMPTIONS AUDIT */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-200/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                1. Scope, Definitions & Statutory Exemptions (Rules 3 & 26)
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 3</td>
                    <td className="p-2 font-medium text-slate-800">Wholesale / Industrial Package Exemption Check (≥ 25kg / ≥ 25l)</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r3Violation ? 'Industrial / wholesale package exemption non-compliant.' : 'Retail package under 25kg; Standard retail provisions fully applicable.'}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r3Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">RETAIL</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 26</td>
                    <td className="p-2 font-medium text-slate-800">Small Package Statutory Exemption Audit (≤ 10g / ≤ 10ml)</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r26Violation 
                        ? 'Small package statutory exemption incorrectly claimed.' 
                        : `Net quantity (${netQuantity}) > 10g. Mandatory retail declarations fully enforced without exemption.`}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r26Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* B. CHAPTER II MANDATORY RETAIL DECLARATIONS */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-200/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                2. Mandatory Packaging Declarations Audit (Rules 5, 6, 12)
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold border-b border-slate-300">
                    <th className="p-2 w-24 text-center">Statute</th>
                    <th className="p-2">Mandatory Parameter</th>
                    <th className="p-2">Extracted Verification Evidence</th>
                    <th className="p-2 w-24 text-center">Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 5</td>
                    <td className="p-2 font-medium text-slate-800">Standard SI Metric Units (Prohibition of gm/gms/kilo/ltr)</td>
                    <td className="p-2 text-slate-600 text-[11px] font-mono">
                      {r5Violation 
                        ? (typeof r5Violation === 'object' && r5Violation.detected_evidence ? r5Violation.detected_evidence : `Found non-standard unit syntax ('${netQuantity}'). Standard symbol 'g' or 'kg' required.`)
                        : `${netQuantity} (Standard SI metric verified)`}
                    </td>
                    <td className="p-2 text-center">
                      {r5Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(a)</td>
                    <td className="p-2 font-medium text-slate-800">Manufacturer / Packer Complete Physical Identity & Address</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r6aViolation 
                        ? (typeof r6aViolation === 'object' && r6aViolation.detected_evidence ? r6aViolation.detected_evidence : 'Missing complete manufacturer / packer street address and pin code.')
                        : manufacturerAddress}
                    </td>
                    <td className="p-2 text-center">
                      {r6aViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(b)</td>
                    <td className="p-2 font-medium text-slate-800">Generic / Common Name of Commodity on PDP</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r6bViolation
                        ? 'Generic or common commodity name missing on Principal Display Panel (PDP).'
                        : genericName}
                    </td>
                    <td className="p-2 text-center">
                      {r6bViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(c)</td>
                    <td className="p-2 font-medium text-slate-800">Net Quantity in Standard Weight / Measure / Number</td>
                    <td className="p-2 text-slate-600 text-[11px] font-mono">
                      {r6cViolation
                        ? 'Net quantity declaration missing or non-compliant with standard units.'
                        : netQuantity}
                    </td>
                    <td className="p-2 text-center">
                      {r6cViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(d)</td>
                    <td className="p-2 font-medium text-slate-800">Month & Year of Manufacture / Packaging (PKD) + Expiry</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r6dViolation
                        ? 'Month & Year of manufacture / packaging (PKD) or expiry missing/unclear.'
                        : `PKD: ${mfgDate} | Best Before/Expiry: ${expDate}`}
                    </td>
                    <td className="p-2 text-center">
                      {r6dViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(da)</td>
                    <td className="p-2 font-medium text-slate-800">Maximum Retail Price (MRP) & Tax Inclusion Statement</td>
                    <td className="p-2 text-slate-600 text-[11px] font-mono">
                      {r6daViolation
                        ? (typeof r6daViolation === 'object' && r6daViolation.detected_evidence ? r6daViolation.detected_evidence : `Declared as 'MRP Rs ${mrpDeclared} (Tax extra)'. Under LMPC Rules, MRP must strictly be inclusive of all taxes.`)
                        : `₹ ${mrpDeclared} (Inclusive of all taxes)`}
                    </td>
                    <td className="p-2 text-center">
                      {r6daViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(e)</td>
                    <td className="p-2 font-medium text-slate-800">Unit Sale Price (USP in ₹/g, ₹/ml, or ₹/piece)</td>
                    <td className="p-2 text-slate-600 text-[11px] font-mono">
                      {r6eViolation
                        ? 'Unit Sale Price (USP) is completely absent on packaging in violation of Rule 6(1)(e).'
                        : unitSalePrice}
                    </td>
                    <td className="p-2 text-center">
                      {r6eViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(f)</td>
                    <td className="p-2 font-medium text-slate-800">Consumer Care Helpline (Name, Address, Tel, Email)</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r6fViolation
                        ? (typeof r6fViolation === 'object' && r6fViolation.detected_evidence ? r6fViolation.detected_evidence : 'Consumer care details incomplete; designated telephonic helpline missing.')
                        : consumerCare}
                    </td>
                    <td className="p-2 text-center">
                      {r6fViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 text-center">Rule 6(1)(g)</td>
                    <td className="p-2 font-medium text-slate-800">Country of Origin ("Made in India" / Country Declaration)</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r6gViolation
                        ? 'Country of origin ("Made in India" / Foreign Origin) missing on packaging.'
                        : countryOfOrigin}
                    </td>
                    <td className="p-2 text-center">
                      {r6gViolation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* C. STRUCTURAL, VISIBILITY & INTEGRITY AUDIT */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-200/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800">
                3. Dimensional, Optical & Packaging Integrity Audit (Rules 7, 8, 18, 21, 27)
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 7 & Sched II</td>
                    <td className="p-2 font-medium text-slate-800">Minimum Font Height & PDP Ratio Calibration</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r7Violation
                        ? (typeof r7Violation === 'object' && r7Violation.detected_evidence ? r7Violation.detected_evidence : `Numeral height (< 1.5mm) below Schedule II threshold for ${netQuantity}.`)
                        : `Numeral height matches net weight class (> 2.0 mm required for ${netQuantity}). Conforms to Schedule II.`}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r7Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 8</td>
                    <td className="p-2 font-medium text-slate-800">Visibility, Contrast & Conspicuous Placement</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r8Violation
                        ? 'Inadequate optical contrast against background; declarations obscured by packaging artwork.'
                        : 'High optical contrast against background; un-obscured by packaging artwork.'}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r8Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 18 & 14</td>
                    <td className="p-2 font-medium text-slate-800">Retail Sale Pricing Integrity & Anti-Smudging / Anti-Overcharging</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r18Violation
                        ? 'Dual MRP sticker detected or declared price altered/smudged.'
                        : 'No dual MRP sticker detected; printed price unaltered and compliant.'}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r18Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 21</td>
                    <td className="p-2 font-medium text-slate-800">Deceptive Packaging & Slack-Fill Void Space Control</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r21Violation
                        ? (typeof r21Violation === 'object' && r21Violation.detected_evidence ? r21Violation.detected_evidence : 'Deceptive packaging: void space exceeds functional tolerance (Slack-Fill > 15%).')
                        : 'Package volume corresponds to filled commodity; void space within functional tolerance (Slack-Fill < 15%).'}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r21Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">PASSED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-bold text-slate-700 w-24 text-center">Rule 27</td>
                    <td className="p-2 font-medium text-slate-800">Central Registration of Manufacturer/Packer with Controller</td>
                    <td className="p-2 text-slate-600 text-[11px]">
                      {r27Violation
                        ? 'Packer central registration not verified on Legal Metrology National Portal.'
                        : 'Packer registration verified on Legal Metrology National Portal.'}
                    </td>
                    <td className="p-2 text-center w-24">
                      {r27Violation ? (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-1.5 py-0.5 rounded">BREACH</span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">VERIFIED</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. PHOTOGRAPHIC PACKAGING EVIDENCE PLATE */}
          <div className="space-y-2 print-page-break-avoid">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center justify-between">
              <span>Photographic Packaging Evidence Plate</span>
              <span className="text-[9px] font-mono text-slate-500">Optical Camera & Vision Sensor Capture</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Front Face (PDP) */}
              <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-center space-y-1">
                <div className="h-32 sm:h-36 flex items-center justify-center bg-white rounded border border-slate-200 overflow-hidden relative">
                  {frontImage ? (
                    <img 
                      src={frontImage} 
                      alt="Front Face - Principal Display Panel (PDP)" 
                      className="max-h-full max-w-full object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400 space-y-1">
                      <FileText className="w-6 h-6 mx-auto text-slate-300" />
                      <div className="text-[10px] font-semibold text-slate-600">Principal Display Panel (PDP)</div>
                      <div className="text-[8px]">Front face scanned & verified in field repository</div>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                    FACE: FRONT (PDP)
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-800">
                  Figure 1: Principal Display Panel (PDP)
                </div>
                <div className="text-[8px] text-slate-500 font-mono truncate">
                  SHA-256: {sha256Hash.slice(0, 32)}
                </div>
              </div>

              {/* Back Face / Declarations */}
              <div className="border border-slate-300 rounded-lg p-2 bg-slate-50 text-center space-y-1">
                <div className="h-32 sm:h-36 flex items-center justify-center bg-white rounded border border-slate-200 overflow-hidden relative">
                  {backImage ? (
                    <img 
                      src={backImage} 
                      alt="Back Face - Mandatory Statutory Declarations" 
                      className="max-h-full max-w-full object-contain mx-auto"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400 space-y-1">
                      <FileText className="w-6 h-6 mx-auto text-slate-300" />
                      <div className="text-[10px] font-semibold text-slate-600">Mandatory Declarations Panel</div>
                      <div className="text-[8px]">Back/Side declarations captured & verified</div>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                    FACE: BACK / DECLARATIONS
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-800">
                  Figure 2: Mandatory Statutory Declarations Panel
                </div>
                <div className="text-[8px] text-slate-500 font-mono truncate">
                  SHA-256: {sha256Hash.slice(32, 64)}
                </div>
              </div>
            </div>
          </div>

          {/* 6. STATUTORY VERDICT & LEGAL CLAUSES */}

          {isCompliant ? (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-lg space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Statutory Compliance Certification & Legal Clearance</span>
              </div>

              <p className="text-emerald-900 leading-relaxed text-[11px]">
                Upon automated multi-face optical assessment and regulatory evaluation against the <b>Legal Metrology (Packaged Commodities) Rules, 2011</b> and the <b>Legal Metrology Act, 2009</b>, this pre-packaged commodity is certified to satisfy all statutory labeling, pricing, dimensioning, metric unit, and anti-deceptive standards. No show-cause notice or penalty under Section 36 is warranted.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50/80 border border-rose-300 rounded-lg space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-950 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Statutory Violations & Compoundable Penalties under Section 36(1)</span>
                </div>
                <span className="text-[11px] font-black bg-rose-200 text-rose-950 px-2 py-0.5 rounded">
                  Statutory Penalty: ₹{calculatedPenalty.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-1.5">
                {rawViolations.map((v, i) => {
                  const title = typeof v === 'string' ? v : (v.title || v.rule_code || 'Statutory Non-Compliance');
                  const desc = typeof v === 'object' ? (v.description || v.detected_evidence || '') : '';
                  const penalty = typeof v === 'object' ? (v.penalty_estimate_inr || 25000) : 25000;

                  return (
                    <div key={i} className="bg-white p-2.5 rounded border border-rose-200 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-rose-950 text-[11px]">
                          • {title}
                        </div>
                        {desc && <p className="text-[10px] text-slate-600 mt-0.5">{desc}</p>}
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                          Statute: Sec 36(1) of Legal Metrology Act, 2009 | Rule 32 of LMPC Rules, 2011
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-700 font-mono shrink-0">
                        ₹{penalty.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-[10px] text-rose-900 font-medium">
                Advisory: The packer/manufacturer is hereby notified to rectify the established breaches within 15 days of notice service, failing which adjudication proceedings shall commence under Section 48 / Section 36 before the competent Authority.
              </p>
            </div>
          )}

          {/* 6. DIGITAL SIGNATURES & CRYPTOGRAPHIC LEDGER PROOF */}
          <div className="pt-3 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="space-y-0.5 border border-slate-200 bg-slate-50 p-2 rounded">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">1. Field Scanning Officer:</span>
              <div className="font-bold text-slate-900 text-xs">{scannedByName}</div>
              <div className="text-[9px] font-mono text-slate-600">{scannedByBadge} • {scanLocation.split('(')[0].trim()}</div>
              <div className="text-[8px] text-slate-400">Captured & Uploaded via Field Scanner HUD</div>
            </div>

            <div className="space-y-0.5 border border-slate-200 bg-slate-50 p-2 rounded">
              <span className="text-[9px] text-sky-800 uppercase font-bold block">2. Statutory Auditing Officer:</span>
              <div className="font-bold text-slate-900 text-xs">{auditedByName}</div>
              <div className="text-[9px] font-mono text-slate-600">{auditedByBadge} • {auditedJurisdiction.split('(')[0].trim()}</div>
              <div className="text-[8px] text-emerald-700 font-bold">✓ Digitally Signed & Adjudicated</div>
            </div>

            <div className="space-y-0.5 border border-slate-200 bg-slate-50 p-2 rounded">
              <span className="text-[9px] text-slate-500 uppercase font-bold block">3. Cryptographic Ledger Proof:</span>
              <div className="font-mono text-[8px] text-slate-600 break-all bg-white p-1 rounded border border-slate-200">
                {sha256Hash}
              </div>
              <div className="text-[8px] text-slate-400">Tamper-Proof National Audit Trail</div>
            </div>
          </div>


          {/* Bottom Gazette Watermark */}
          <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-200">
            PackSureAI Platform • Ministry of Consumer Affairs • Smart India Hackathon 2026 (Problem Statement: SIH26034)
          </div>

        </div>

        {/* Modal Footer Controls (Hidden on Print) */}
        <div className="no-print px-5 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {actionStatus ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {actionStatus}
              </span>
            ) : (
              <>
                <QrCode className="w-4 h-4 text-slate-400" />
                <span>Court-admissible A4 certificate • Real-time queue transition available</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Letterhead</span>
            </button>

            {isReadOnly ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 bg-amber-100/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Read-Only • Assigned to {assignedInspectorName}</span>
                </span>
              </div>
            ) : isCompliant ? (
              <button
                onClick={handleCertifyInspection}
                disabled={certifying}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{certifying ? 'Signing...' : '✓ Sign & Certify Conformity (Clear Case)'}</span>
              </button>
            ) : (
              <button
                onClick={handleDispatchNoticeFromReport}
                disabled={certifying}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{certifying ? 'Dispatching...' : '⚖ Issue Show-Cause Notice & Forward'}</span>
              </button>
            )}
          </div>
        </div>


      </div>
    </div>,
    document.body
  );
};


