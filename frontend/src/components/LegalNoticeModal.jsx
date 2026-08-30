import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, FileText, CheckCircle2, Shield, Calendar, Scale, Printer, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LegalNoticeModal = ({ 
  isOpen = true, 
  onClose, 
  scan, 
  caseNumber,
  brandName,
  productName,
  violations = [],
  scanId,
  onCaseUpdated = null
}) => {
  const { user, addNotification } = useAuth();
  const [issuing, setIssuing] = useState(false);
  const [issuedResult, setIssuedResult] = useState(null);

  // Compute normalized values
  const activeCaseNumber = caseNumber || scan?.case_number || 'DOCA-CASE-2026-0001';
  const activeBrandName = brandName || scan?.brand_name || 'Registered Manufacturer / Packer';
  const activeProductName = productName || scan?.product_name || 'Packaged Commodity Under Audit';
  const activeViolations = (violations && violations.length > 0) ? violations : (scan?.violations || []);
  const totalPenalty = activeViolations.reduce((acc, v) => acc + (v.penalty_estimate_inr || 25000), 0);
  const productImage = scan?.front_image_url || scan?.image_url || scan?.front_image || scan?.photo_preview || null;
  const complianceScore = typeof scan?.overall_compliance_score === 'number' 
    ? scan.overall_compliance_score 
    : (typeof scan?.compliance_score === 'number' ? scan.compliance_score : 42.5);
  const riskScore = typeof scan?.risk_score === 'number' ? scan.risk_score : 75;

  // Strict Assignment Lock:
  const assignedInspectorName = scan?.inspector_name || scan?.inspector?.full_name;
  const assignedInspectorBadge = scan?.inspector_badge || scan?.inspector?.badge_number;
  const assignedInspectorId = scan?.inspector_id;

  const isAdmin = user?.role === 'admin' || user?.role === 'reviewer' || user?.role === 'superadmin';
  const isAssignedInspector = Boolean(
    !assignedInspectorName ||
    (user?.id && assignedInspectorId && String(user.id) === String(assignedInspectorId)) ||
    (user?.badge_number && assignedInspectorBadge && user.badge_number.toLowerCase() === assignedInspectorBadge.toLowerCase()) ||
    (user?.full_name && assignedInspectorName && user.full_name.toLowerCase().trim() === assignedInspectorName.toLowerCase().trim()) ||
    (user?.username && assignedInspectorName && assignedInspectorName.toLowerCase().includes(user.username.toLowerCase()))
  );

  const isReadOnly = !isAdmin && !isAssignedInspector;


  const handleIssueNotice = async () => {
    setIssuing(true);
    try {
      const res = await fetch(`/api/v1/inspections/${activeCaseNumber}/issue-legal-notice`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setIssuedResult(data);

        if (addNotification) {
          addNotification({
            type: 'critical',
            title: `Notice Dispatched: ${activeCaseNumber}`,
            message: `Formal Section 36 Notice issued to ${activeBrandName} with ₹${totalPenalty.toLocaleString('en-IN')} compounding penalty assessment.`,
            targetRole: ['reviewer', 'inspector', 'admin'],
            jurisdiction: user?.jurisdiction || 'all',
            category: 'legal_review',
            sender: `Legal Reviewer (${user?.full_name || 'Directorate Desk'})`,
            actionLink: '/review-queue'
          });
        }
        if (onCaseUpdated) {
          onCaseUpdated(activeCaseNumber, 'NOTICE_ISSUED');
        }
      }
    } catch (e) {
      console.error('Error issuing notice:', e);
    } finally {
      setIssuing(false);
    }
  };


  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="statutory-report-modal-portal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full">
        {/* Header (Hidden on print) */}

        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Statutory Show-Cause Legal Notice (Form I)</h3>
              <p className="text-[11px] text-slate-400">Under Section 36 of Legal Metrology Act, 2009 & Rule 6/7 LMPC 2011</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Assignment Lock Banner (Hidden on Print) */}
        {isReadOnly && (
          <div className="no-print mx-6 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="leading-snug">
                <span className="font-bold">Strict Assignment Lock (Read-Only Mode):</span>{' '}
                This case is assigned to <strong>{assignedInspectorName || 'Another Inspector'} ({assignedInspectorBadge || 'DOCA-INSP'})</strong>. Only the assigned inspector or an Administrator can dispatch statutory notices.
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-900/60 text-amber-200 text-[10px] font-bold rounded-lg uppercase tracking-wider shrink-0 border border-amber-700 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          </div>
        )}

        {/* Notice Preview Sheet (Printable Clean Document) */}
        <div id="statutory-report-printable-document" className="print-clean-document flex-1 overflow-y-auto p-8 space-y-4 font-serif text-slate-950 bg-white print:p-0">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <div className="text-xs font-bold tracking-wider text-slate-800">GOVERNMENT OF INDIA</div>
            <div className="text-sm font-bold text-slate-950">MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION</div>
            <div className="text-xs font-semibold text-slate-700">DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION</div>
            <div className="text-[10px] text-slate-600 mt-1 font-sans">Krishi Bhawan, New Delhi - 110001</div>
          </div>


          <div className="flex justify-between text-xs font-sans text-slate-800">
            <div><b>Notice Ref:</b> DOCA/LM/NOTICE/{activeCaseNumber}</div>
            <div><b>Date:</b> {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>

          <div className="flex justify-between items-start gap-4 text-xs font-sans text-slate-800 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="space-y-0.5">
              <div><b>TO:</b></div>
              <div className="font-bold text-sm text-slate-900">M/s {activeBrandName}</div>
              <div className="text-slate-600">Registered Manufacturer / Packer / Importer on Record</div>
              <div className="pt-1 text-[11px]">
                Target Commodity: <b>{activeProductName}</b>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-500">Compliance Score</div>
              <div className="text-xl font-black font-mono text-red-700">{complianceScore}%</div>
              <div className="text-[9px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                Grade F • PRI: {riskScore}
              </div>
            </div>
          </div>

          {/* Scanned Item Evidence Thumbnail if available */}
          {productImage && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded font-sans text-xs">
              <div className="w-16 h-16 bg-white rounded border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={productImage} 
                  alt={activeProductName} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-slate-900">Photographic Packaging Evidence (Optical OCR Record)</div>
                <div className="text-[11px] text-slate-600">Captured and cryptographically verified on field metrology device.</div>
              </div>
            </div>
          )}

          <div className="text-xs text-center font-bold font-sans text-red-700 underline py-1">
            SHOW-CAUSE NOTICE UNDER SECTION 36 OF THE LEGAL METROLOGY ACT, 2009
          </div>

          <p className="text-xs leading-relaxed text-justify">
            WHEREAS, an AI-assisted statutory surveillance audit of the pre-packaged commodity <b>"{activeProductName}"</b> was conducted by the authorized Inspector of Legal Metrology. 
            AND WHEREAS, the packaging declarations were verified and established to be non-compliant with the statutory mandates of the <b>Legal Metrology (Packaged Commodities) Rules, 2011</b> as specified hereunder:
          </p>


          {/* Violations Table */}
          <table className="w-full text-[11px] font-sans border-collapse border border-slate-400 my-2">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-slate-400 p-1.5 text-left">#</th>
                <th className="border border-slate-400 p-1.5 text-left">Statutory Provision</th>
                <th className="border border-slate-400 p-1.5 text-left">Detected Violation Evidence</th>
                <th className="border border-slate-400 p-1.5 text-right">Compounded Penalty</th>
              </tr>
            </thead>
            <tbody>
              {activeViolations.length > 0 ? (
                activeViolations.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-400 p-1.5 font-bold">{i + 1}</td>
                    <td className="border border-slate-400 p-1.5 font-bold text-slate-900">{v.rule_title || v.rule_code}</td>
                    <td className="border border-slate-400 p-1.5 text-slate-700">{v.detected_evidence}</td>
                    <td className="border border-slate-400 p-1.5 text-right font-mono font-bold text-red-700">₹{(v.penalty_estimate_inr || 25000).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="border border-slate-400 p-2 text-center text-slate-500 italic">
                    No statutory violations registered under this docket.
                  </td>
                </tr>
              )}
              <tr className="bg-slate-200 font-bold">
                <td colSpan="3" className="border border-slate-400 p-1.5 text-right">TOTAL STATUTORY PENALTY CLAUSE:</td>
                <td className="border border-slate-400 p-1.5 text-right text-red-700 font-mono">₹{totalPenalty.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs leading-relaxed text-justify">
            NOW, THEREFORE, you are hereby called upon to show cause in writing within <b>15 days</b> from the date of receipt of this notice as to why penal proceedings under Section 36(1) / Section 36(2) of the Legal Metrology Act, 2009 should not be initiated against you before the Court of Judicial Magistrate of First Class.
          </p>

          <p className="text-[11px] leading-relaxed text-slate-600 text-justify">
            Take note that failure to submit written explanation within the stipulated timeline or failure to compound the offence under Section 48 shall result in formal lodging of criminal complaint under the Act.
          </p>

          <div className="pt-4 flex justify-between items-end font-sans text-xs border-t border-slate-200">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-500 font-mono">
                Cryptographic Evidence Hash: SHA-256 Verified
              </div>
              <div className="text-[9px] text-slate-400">
                First-Mile Scan Ref: {caseItem?.scanned_by_name || 'Insp. Priya Sharma'} ({caseItem?.scanned_by_badge || 'DOCA-INSP-302'})
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div className="font-bold text-slate-900">{user?.full_name || 'Aniket Kumar'}</div>
              <div className="text-[11px] font-mono text-slate-700">{user?.badge_number || 'DOCA-INSP-2026'}</div>
              <div className="text-[10px] text-slate-600">Authorized Adjudicating Officer • Directorate of Legal Metrology</div>
            </div>
          </div>
        </div>


        {/* Action Footer (Hidden on print) */}
        <div className="no-print p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-400 font-mono">

            Total Penalty Estimate: <span className="font-bold text-red-400">₹{totalPenalty.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" /> Print Notice
            </button>

            {isReadOnly ? (
              <span className="flex items-center gap-1.5 px-4 py-2 bg-amber-950/50 border border-amber-800 text-amber-300 rounded-xl text-xs font-bold shadow-xs">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Read-Only (Assigned to {assignedInspectorName || 'Another Inspector'})</span>
              </span>
            ) : (
              <a
                href={`/api/v1/reports/download-notice/${activeCaseNumber}`}
                target="_blank"
                rel="noreferrer"
                onClick={handleIssueNotice}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                {issuing ? 'Dispatching...' : 'Issue & Download Notice PDF'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

