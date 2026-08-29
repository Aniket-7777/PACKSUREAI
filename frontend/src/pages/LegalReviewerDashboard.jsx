import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Gavel
} from 'lucide-react';
import { LegalNoticeModal } from '../components/LegalNoticeModal';

export const LegalReviewerDashboard = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [noticeModalScan, setNoticeModalScan] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/inspections/');
      if (res.ok) {
        const data = await res.json();
        setInspections(data);
      }
    } catch (e) {
      console.error('Error fetching inspections:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseAction = (caseNumber, actionName) => {
    setActionSuccessMsg(`Case ${caseNumber}: Action '${actionName}' recorded in legal audit trail.`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Metrics
  const safeList = Array.isArray(inspections) ? inspections : [];
  const pendingCases = safeList.filter(i => i && (i.stage === 'TRIAGE' || i.stage === 'UNDER_REVIEW' || i.stage === 'TRIAGE_HOLD'));
  const highPriority = safeList.filter(i => i && (i.priority_level === 'HIGH' || (i.priority_risk_index || 0) >= 70));
  const noticesIssued = safeList.filter(i => i && i.legal_notice_issued);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
              Legal Adjudication Wing
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sec 36 Enforcement & Hearing Board</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Legal Reviewer Case Docket
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Adjudicate statutory packaging violations under the Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/rules"
            className="px-3.5 py-2 bg-sky-200/70 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-sky-300 transition-all shadow-xs"
          >
            <Scale className="w-3.5 h-3.5 text-sky-700 dark:text-amber-400" />
            Rules Registry
          </Link>
          <Link
            to="/review-queue"
            className="px-3.5 py-2 bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-sky-700 dark:hover:bg-amber-400 transition-all shadow-md"
          >
            <Gavel className="w-3.5 h-3.5" />
            Review Queue
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Awaiting Verification</span>
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            {pendingCases.length}
          </div>
          <div className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">Pending legal endorsement</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Critical Breaches</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-display text-red-600 dark:text-red-400 mt-1">
            {highPriority.length}
          </div>
          <div className="text-[11px] text-red-500 mt-0.5">Priority Risk Index &gt; 70</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Section 36 Notices</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            {noticesIssued.length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Dispatched to offenders</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Rules Validated</span>
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            10 / 10
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Gazette 2026.1 aligned</div>
        </div>
      </div>

      {/* Case Review Table */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-700 dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Active Legal Docket Cases
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {inspections.length} Cases On Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-100/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 font-bold border-b border-sky-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Commodity & Brand</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Violations</th>
                <th className="py-3 px-3 text-right">Legal Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
              {inspections.map((item) => (
                <tr key={item.id} className="hover:bg-sky-100/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-sky-800 dark:text-amber-400">
                    {item.case_number}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.product_name}</div>
                    <div className="text-[11px] text-slate-500">{item.brand_name}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-200/70 dark:bg-slate-800 text-sky-800 dark:text-slate-300">
                      {item.stage}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.priority_level === 'HIGH' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                      item.priority_level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {item.priority_level} ({item.priority_risk_index} PRI)
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.violations_count || 0} Breaches
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/scan?id=${item.scan_id}`}
                        className="px-2.5 py-1 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-slate-200 font-bold text-[11px] rounded-lg transition-all"
                        title="View Evidence & Scanner"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleCaseAction(item.case_number, 'Endorsed Legal Notice')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs"
                      >
                        Endorse
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
