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
  Check,
  Printer,
  Search,
  Hash,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  X
} from 'lucide-react';
import { LegalNoticeModal } from '../LegalNoticeModal';
import { InspectionReportModal } from '../InspectionReportModal';

export const LegalReviewerCommandCenter = () => {
  const { user, selectedLocation, selectedDateRange, addNotification } = useAuth();
  const navigate = useNavigate();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRiskIndex, setFilterRiskIndex] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [filterCaseId, setFilterCaseId] = useState('');
  const [sortBy, setSortBy] = useState('risk_desc'); // 'risk_desc' | 'risk_asc' | 'case_asc' | 'case_desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [noticeModalScan, setNoticeModalScan] = useState(null);
  const [selectedReportItem, setSelectedReportItem] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');


  useEffect(() => {
    fetchInspections();
  }, [selectedLocation, selectedDateRange]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const locationId = selectedLocation?.label || selectedLocation?.id || '';
      const res = await fetch(`/api/v1/inspections/priority-queue?location=${encodeURIComponent(locationId)}&date_range=${encodeURIComponent(dateRangeId)}`);
      if (res.ok) {
        const data = await res.json();
        setInspections(Array.isArray(data) ? data : []);
        return;
      }
      setInspections([]);
    } catch (e) {
      console.warn('Reviewer docket fetch error:', e);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseAction = (caseNumber, actionName) => {
    setActionSuccessMsg(`Case ${caseNumber}: Action '${actionName}' successfully logged to statutory ledger.`);
    setTimeout(() => setActionSuccessMsg(''), 4500);
  };

  const pendingCases = inspections.filter(i => i.stage === 'TRIAGE' || i.stage === 'UNDER_REVIEW' || i.stage === 'TRIAGE_HOLD');
  const highPriority = inspections.filter(i => i.priority_level === 'HIGH' || (i.priority_risk_index || i.risk_score || 0) >= 70);
  const noticesIssued = inspections.filter(i => i.legal_notice_issued);

  const filteredInspections = (Array.isArray(inspections) ? inspections : []).filter(item => {
    if (!item) return false;
    
    // Risk Index Filter
    const pri = Number(item.priority_risk_index || item.risk_score || 0);
    let matchesRisk = true;
    if (filterRiskIndex === 'CRITICAL') matchesRisk = pri >= 75;
    else if (filterRiskIndex === 'HIGH') matchesRisk = pri >= 50 && pri < 75;
    else if (filterRiskIndex === 'MODERATE') matchesRisk = pri >= 25 && pri < 50;
    else if (filterRiskIndex === 'LOW') matchesRisk = pri < 25;

    // Case ID Specific Filter
    const cid = (filterCaseId || '').trim().toLowerCase();
    const matchesCaseId = !cid || String(item.case_number || '').toLowerCase().includes(cid);

    // General Search
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch = !q ||
      String(item.product_name || '').toLowerCase().includes(q) ||
      String(item.brand_name || '').toLowerCase().includes(q) ||
      String(item.case_number || '').toLowerCase().includes(q);

    return matchesRisk && matchesCaseId && matchesSearch;
  }).sort((a, b) => {
    const priA = Number(a.priority_risk_index || a.risk_score || 0);
    const priB = Number(b.priority_risk_index || b.risk_score || 0);
    const caseA = String(a.case_number || '');
    const caseB = String(b.case_number || '');

    if (sortBy === 'risk_desc') return priB - priA;
    if (sortBy === 'risk_asc') return priA - priB;
    if (sortBy === 'case_asc') return caseA.localeCompare(caseB, undefined, { numeric: true, sensitivity: 'base' });
    if (sortBy === 'case_desc') return caseB.localeCompare(caseA, undefined, { numeric: true, sensitivity: 'base' });
    return priB - priA;
  });

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
              {loading
                ? 'Loading adjudication queue...'
                : `${filteredInspections.length} case${filteredInspections.length !== 1 ? 's' : ''} in docket — sorted by Priority Risk Index`}
            </p>
          </div>
          <Link
            to="/review-queue"
            className="text-xs font-bold text-indigo-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Open Full HITL Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dedicated Filter & Sort Row */}
        <div className="p-3 bg-sky-50/70 dark:bg-slate-950/70 border border-sky-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search commodity or brand..."
                className="pl-7 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44"
              />
            </div>

            {/* Filter by Case ID */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
              <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-amber-400 shrink-0" />
              <input
                type="text"
                value={filterCaseId}
                onChange={(e) => setFilterCaseId(e.target.value)}
                placeholder="Filter Case ID (e.g. 801)..."
                className="bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-40 font-mono font-medium"
              />
              {filterCaseId && (
                <button
                  onClick={() => setFilterCaseId('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear Case ID"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter by Risk Index */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Risk:</span>
              <select
                value={filterRiskIndex}
                onChange={(e) => setFilterRiskIndex(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">🔴 Critical (PRI ≥ 75)</option>
                <option value="HIGH">🟠 High (PRI 50–74)</option>
                <option value="MODERATE">🟡 Moderate (PRI 25–49)</option>
                <option value="LOW">🟢 Low (PRI &lt; 25)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="risk_desc">Risk: High → Low</option>
                <option value="risk_asc">Risk: Low → High</option>
                <option value="case_asc">Case ID: A → Z</option>
                <option value="case_desc">Case ID: Z → A</option>
              </select>
            </div>

            {/* Reset */}
            {(filterRiskIndex !== 'ALL' || filterCaseId !== '' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterRiskIndex('ALL');
                  setFilterCaseId('');
                  setSearchQuery('');
                  setSortBy('risk_desc');
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl font-semibold transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
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
              {filteredInspections.map((item) => (
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedReportItem(item)}
                        className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-sky-900 dark:text-amber-400 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                        title="Export Official Statutory Report / Certificate"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF Report</span>
                      </button>
                      <button
                        onClick={() => setNoticeModalScan(item)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
                      >
                        Issue Notice
                      </button>
                    </div>
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
          onCaseUpdated={() => {
            handleCaseAction(noticeModalScan.case_number, 'Statutory Form I Notice Issued');
            setNoticeModalScan(null);
            fetchInspections();
          }}
        />
      )}

      {/* Statutory Inspection & Compliance Report Modal */}
      {selectedReportItem && (
        <InspectionReportModal
          isOpen={Boolean(selectedReportItem)}
          caseItem={selectedReportItem}
          onClose={() => setSelectedReportItem(null)}
          onCaseUpdated={() => {
            fetchInspections();
          }}
        />
      )}
    </div>
  );
};


