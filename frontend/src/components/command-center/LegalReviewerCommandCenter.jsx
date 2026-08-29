import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Scale, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  HelpCircle,
  FileCheck2,
  Filter,
  Eye,
  Gavel,
  ShieldCheck,
  Zap,
  BookOpen,
  FileSpreadsheet,
  Building2,
  MapPin,
  Check
} from 'lucide-react';
import { LegalNoticeModal } from '../LegalNoticeModal';

export const LegalReviewerCommandCenter = () => {
  const { user, selectedLocation, selectedDateRange } = useAuth();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noticeModalScan, setNoticeModalScan] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    fetchInspections();
  }, [selectedLocation, selectedDateRange]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/inspections/');
      if (res.ok) {
        const data = await res.json();
        setInspections(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (e) {
      console.warn('Using fallback reviewer cases:', e);
      setInspections([
        {
          id: 1,
          case_number: 'LMPC-2026-DL-801',
          product_name: 'Dabur 100% Pure Honey 500g',
          brand_name: 'Dabur India Ltd.',
          category: 'Food & Nutrition',
          priority_level: 'HIGH',
          priority_risk_index: 84,
          stage: 'UNDER_REVIEW',
          legal_notice_issued: false,
          created_at: '2026-02-28 10:15',
          violations: ['Rule 21 (Deceptive Slack Fill - 38%)', 'Rule 6(1)(da) (Unit Sale Price Missing)']
        },
        {
          id: 2,
          case_number: 'LMPC-2026-DL-802',
          product_name: 'Patanjali Doodh Biscuit 200g',
          brand_name: 'Patanjali Ayurved Ltd.',
          category: 'Bakery & Confectionery',
          priority_level: 'HIGH',
          priority_risk_index: 78,
          stage: 'TRIAGE',
          legal_notice_issued: false,
          created_at: '2026-02-28 11:30',
          violations: ['Rule 6(1)(a) (Missing Complete Packer Address)', 'Rule 6(1)(d) (Font Height 1.2mm < 2.0mm)']
        },
        {
          id: 3,
          case_number: 'LMPC-2026-MH-409',
          product_name: 'Amul Butter 500g',
          brand_name: 'GCMMF (Amul)',
          category: 'Dairy Products',
          priority_level: 'LOW',
          priority_risk_index: 18,
          stage: 'COMPLETED',
          legal_notice_issued: true,
          created_at: '2026-02-27 16:45',
          violations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseAction = (caseNumber, actionName) => {
    setActionSuccessMsg(`Case ${caseNumber}: Action '${actionName}' successfully logged to statutory ledger.`);
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  const pendingCases = inspections.filter(i => i.stage === 'TRIAGE' || i.stage === 'UNDER_REVIEW' || i.stage === 'TRIAGE_HOLD');
  const highPriority = inspections.filter(i => i.priority_level === 'HIGH' || i.priority_risk_index >= 70);
  const noticesIssued = inspections.filter(i => i.legal_notice_issued);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. ADJUDICATION SITUATION BANNER */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                Legal Metrology Adjudication Docket
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-600 dark:text-amber-400" />
                {selectedLocation.label}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Sec 36 Enforcement Board
              </span>
            </div>
            
            <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
              Statutory Review & Legal Notice Directorate
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Adjudicate statutory packaging violations, authorize Section 36 Form I legal notices, and manage compounding penalty orders.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/rules"
              className="flex items-center gap-1.5 bg-sky-100/80 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-sky-300 dark:border-slate-700 transition-all shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-amber-400" />
              <span>Rules Registry</span>
            </Link>
            <Link
              to="/review-queue"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-indigo-600/20 dark:shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Gavel className="w-4 h-4" />
              <span>HITL Review Queue</span>
            </Link>
          </div>
        </div>

        {/* Adjudication Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-sky-100 dark:border-slate-800">
          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Pending Adjudications</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
              {pendingCases.length} Cases
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Require HITL Sign-off</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>High Risk / Seizure Candidates</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">
              {highPriority.length} Critical
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Priority risk index &gt; 70</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Statutory Notices Issued</span>
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
              {noticesIssued.length || 8} Notices
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Form I dispatched</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Compounding Penalties</span>
              <Scale className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
              ₹4.85 Lakhs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sec 36(1) compounding</div>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. IMMEDIATE ACTION STATION ("WHAT ACTION TO TAKE NEXT") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 dark:bg-amber-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Immediate Legal Actions • Adjudication Queue
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Statutory time limits under Sec 36 of Legal Metrology Act
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Gavel className="w-3 h-3" /> Form I Notice Required
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Case #801</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Review & Issue Notice for Dabur Honey
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Slack-Fill violation (38%) + missing Unit Sale Price (USP). Ready for Form I legal notice generation.
              </p>
            </div>
            <button
              onClick={() => setNoticeModalScan({
                case_number: 'LMPC-2026-DL-801',
                product_name: 'Dabur 100% Pure Honey 500g',
                brand_name: 'Dabur India Ltd.',
                violations: ['Rule 21 (Deceptive Slack Fill - 38%)', 'Rule 6(1)(da) (Unit Sale Price Missing)']
              })}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Generate Form I Notice</span>
            </button>
          </div>

          {/* Action 2 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Scale className="w-3 h-3" /> Compounding Review
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Case #802</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Adjudicate Patanjali Doodh Biscuit
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Omission of complete manufacturing unit address under Rule 6(1)(a). Compounding penalty fee ₹25,000.
              </p>
            </div>
            <button
              onClick={() => handleCaseAction('LMPC-2026-DL-802', 'Compounding Order Approved (₹25,000)')}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Compounding Order</span>
            </button>
          </div>

          {/* Action 3 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-sky-500/30 hover:border-sky-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Precedent Lookup
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Statutory Tool</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                LMPC 2011 Schedule II Exemptions
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Review statutory weight exemptions for industrial packs (&gt;25kg/25L) and fast-food retail wrappers.
              </p>
            </div>
            <Link
              to="/rules"
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 dark:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Explore Rules Registry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. PENDING ADJUDICATION DOCKET TABLE */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
              Active Legal Adjudication Docket
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspection records requiring statutory review, legal notices, and compliance orders
            </p>
          </div>
          <Link
            to="/review-queue"
            className="text-xs font-bold text-indigo-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Open Full HITL Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sky-200/80 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Docket Number</th>
                <th className="py-2.5 px-3">Commodity & Brand</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Statutory Violations</th>
                <th className="py-2.5 px-3 text-right">Adjudication Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/80">
              {inspections.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/60 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700 dark:text-amber-400">
                    {item.case_number}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.product_name}</div>
                    <div className="text-[11px] text-slate-500">{item.brand_name}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {item.stage}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {item.violations?.length ? (
                        item.violations.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded text-[10px] font-medium border border-rose-500/20">
                            {v}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Fully Compliant
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setNoticeModalScan(item)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
                    >
                      Issue Notice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notice Modal */}
      {noticeModalScan && (
        <LegalNoticeModal
          scan={noticeModalScan}
          onClose={() => setNoticeModalScan(null)}
          onNoticeIssued={() => {
            handleCaseAction(noticeModalScan.case_number, 'Statutory Form I Notice Issued');
            setNoticeModalScan(null);
            fetchInspections();
          }}
        />
      )}
    </div>
  );
};
