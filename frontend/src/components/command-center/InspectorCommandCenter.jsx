import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Scan, 
  TrendingUp, 
  FileText, 
  Scale, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  Layers,
  ChevronRight,
  ListFilter,
  Package,
  MapPin,
  Sparkles,
  ArrowRight,
  Camera,
  Activity,
  AlertOctagon,
  Eye,
  Check,
  Zap,
  Target,
  FileSpreadsheet,
  RefreshCw,
  Building2,
  Calendar,
  Barcode,
  Printer,
  Lock,
  Hash,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  X
} from 'lucide-react';
import { BarcodeScannerModal } from '../BarcodeScannerModal';
import { InspectionReportModal } from '../InspectionReportModal';
import { LegalNoticeModal } from '../LegalNoticeModal';

export const InspectorCommandCenter = () => {
  const { user, selectedLocation, selectedDateRange } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterRiskIndex, setFilterRiskIndex] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [filterCaseId, setFilterCaseId] = useState('');
  const [sortBy, setSortBy] = useState('risk_desc'); // 'risk_desc' | 'risk_asc' | 'case_asc' | 'case_desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickBarcode, setQuickBarcode] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState(null);
  const [selectedNoticeItem, setSelectedNoticeItem] = useState(null);
  const [memoSuccess, setMemoSuccess] = useState('');
  const [completedCaseIds, setCompletedCaseIds] = useState(new Set());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedLocation, selectedDateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const locationId = selectedLocation?.label || selectedLocation?.id || '';
      const dateRangeId = selectedDateRange?.id || 'all';
      const [queueRes, analyticsRes] = await Promise.all([
        fetch(`/api/v1/inspections/priority-queue?location=${encodeURIComponent(locationId)}&date_range=${encodeURIComponent(dateRangeId)}`),
        fetch(`/api/v1/analytics/summary?location=${encodeURIComponent(locationId)}&date_range=${encodeURIComponent(dateRangeId)}`),
      ]);

      if (queueRes.ok) {
        const qData = await queueRes.json();
        // Ensure every item has a safe `violations` array and an `id`
        const normalized = (Array.isArray(qData) ? qData : []).map((item) => ({
          ...item,
          id: item.id || item.inspection_id || item.scan_id,
          violations: Array.isArray(item.violations) ? item.violations : [],
          product_name: item.product_name || 'Unknown Product',
          brand_name: item.brand_name || 'Unknown Brand',
          case_number: item.case_number || `CASE-${item.id}`,
          priority_level: item.priority_level || 'MEDIUM',
          priority_risk_index: item.priority_risk_index || 50,
          category: item.category || 'Packaged Commodities',
        }));
        setQueue(normalized);
      } else {
        setQueue([]);
      }

      if (analyticsRes.ok) {
        setAnalytics(await analyticsRes.json());
      }
    } catch (e) {
      console.warn('Dashboard fetch error, showing empty queue:', e);
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseUpdated = (caseNo, newStage) => {
    setCompletedCaseIds(prev => new Set([...prev, caseNo]));
    setQueue(prevQueue => prevQueue.map(item => 
      (item.case_number === caseNo || String(item.id) === String(caseNo)) 
        ? { ...item, stage: newStage, legal_notice_issued: newStage === 'NOTICE_ISSUED' } 
        : item
    ));
    setMemoSuccess(`Case ${caseNo} successfully transitioned to ${newStage}. Action station updated in real-time.`);
    setTimeout(() => setMemoSuccess(''), 4500);
    fetchDashboardData();
  };

  const handleBarcodeScanned = (code, lookupResult) => {
    setQuickBarcode(code);
    setIsBarcodeModalOpen(false);
    
    // Check if this product or barcode exists in the live queue
    const matchedQueueItem = queue.find(item => 
      (item.barcode && String(item.barcode).trim() === String(code).trim()) ||
      (lookupResult?.product && String(item.product_name || '').toLowerCase().includes(String(lookupResult.product).toLowerCase()))
    );

    if (matchedQueueItem) {
      setSelectedReportItem(matchedQueueItem);
    } else {
      navigate(`/scan?barcode=${encodeURIComponent(code)}`);
    }
  };

  const handleQuickLookup = (e) => {
    e.preventDefault();
    const code = quickBarcode.trim();
    if (!code) return;

    const matchedQueueItem = queue.find(item => 
      (item.barcode && String(item.barcode).trim() === String(code).trim()) ||
      String(item.case_number || '').toLowerCase() === String(code).toLowerCase()
    );

    if (matchedQueueItem) {
      setSelectedReportItem(matchedQueueItem);
    } else {
      navigate(`/scan?barcode=${encodeURIComponent(code)}`);
    }
  };

  const handleIssueSpotMemo = (caseItem) => {
    setSelectedNoticeItem(caseItem);
  };

  // Live actionable pending queue (excludes already certified or notice-dispatched cases)
  const pendingQueue = queue.filter(item => 
    item.stage !== 'CERTIFIED_COMPLIANT' && 
    item.stage !== 'CLOSED' && 
    item.stage !== 'NOTICE_ISSUED' && 
    !completedCaseIds.has(item.case_number) &&
    !completedCaseIds.has(item.id)
  );

  // Completed / Audited cases
  const completedQueue = queue.filter(item => 
    item.stage === 'CERTIFIED_COMPLIANT' || 
    item.stage === 'CLOSED' || 
    item.stage === 'NOTICE_ISSUED' || 
    completedCaseIds.has(item.case_number) ||
    completedCaseIds.has(item.id)
  );

  const filteredQueue = (Array.isArray(queue) ? queue : []).filter(item => {
    if (!item) return false;
    const matchesPriority = filterPriority === 'ALL' || item.priority_level === filterPriority;
    
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

    return matchesPriority && matchesRisk && matchesCaseId && matchesSearch;
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


  const totalScans = analytics?.total_scans_conducted ?? queue.length;
  const totalViolations = analytics?.total_violations_flagged ?? queue.reduce((s, i) => s + (i.violations_count || 0), 0);
  const avgCompliance = analytics?.national_average_compliance_rate ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. OPERATIONAL SITUATION COMMAND BANNER */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-200 dark:bg-amber-500/10 text-sky-800 dark:text-amber-400 border border-sky-300 dark:border-amber-500/30 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Field Enforcement Command Center
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-600 dark:text-amber-400" />
                {selectedLocation?.label || 'All Jurisdictions'}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {selectedDateRange?.label || 'All Time'}
              </span>
            </div>
            
            <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
              Live Field Compliance & Surveillance Radar
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Real-time packaging intelligence and risk-prioritized audits under the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>

          {/* Quick Trigger Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-sky-800 dark:text-slate-300 rounded-xl transition-all"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/scan"
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-sky-600/20 dark:shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Scan className="w-4 h-4" />
              <span>Launch 5-Step Scan</span>
            </Link>
            <Link
              to="/review-queue"
              className="flex items-center gap-1.5 bg-sky-100/80 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-sky-300 dark:border-slate-700 transition-all shadow-xs"
            >
              <ListFilter className="w-4 h-4 text-sky-700 dark:text-amber-400" />
              <span>Field Review Queue</span>
            </Link>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon — pulled from live DB */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-sky-100 dark:border-slate-800">
          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Total Scans ({selectedLocation?.label?.split(' ')[0] || 'All'})</span>
              <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
              {loading ? '—' : totalScans} Packs
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Since deployment</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Violations Flagged</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
              {loading ? '—' : totalViolations} Non-Compliances
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{filteredQueue.filter(i => i.stage === 'TRIAGE_HOLD').length} pending triage</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Active Cases in Queue</span>
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-bold font-display text-rose-600 dark:text-rose-400 mt-1">
              {loading ? '—' : queue.length} Cases
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{queue.filter(i => i.priority_level === 'HIGH').length} HIGH priority</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Avg Compliance Rate</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className={`text-xl font-bold font-display mt-1 ${avgCompliance >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {loading ? '—' : avgCompliance !== null ? `${avgCompliance}%` : 'N/A'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all scanned SKUs</div>
          </div>
        </div>
      </div>

      {memoSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{memoSuccess}</span>
        </div>
      )}

      {/* 2. IMMEDIATE ACTION STATION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Immediate Action Station • Priority Directives
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Automated recommendations based on live risk surveillance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Card 1: Priority 1 - Field Audit */}
          {(() => {
            // Find highest risk case from pendingQueue, or first pending case
            const topCase = pendingQueue.find(i => i.violations_count > 0 || i.priority_risk_index >= 30) || pendingQueue[0];
            const isCompliant = topCase && (topCase.violations_count === 0 || topCase.compliance_status === 'COMPLIANT');

            return (
              <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-rose-500/30 hover:border-rose-500 dark:border-rose-500/20 dark:hover:border-rose-500/50 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Priority 1: Field Audit
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {topCase ? `PRI ${topCase.priority_risk_index}` : (completedQueue.length > 0 ? `${completedQueue.length} Cleared` : 'Radar Active')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {topCase ? `Audit: ${topCase.product_name}` : `All Field Items Cleared (${completedQueue.length} Audited)`}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {topCase
                      ? (!isCompliant 
                          ? `Case ${topCase.case_number} — ${topCase.violations_count} statutory breach(es) flagged for ${topCase.brand_name}.`
                          : `Case ${topCase.case_number} — 100.0% LMPC Conformity. Ready for officer sign-off.`)
                      : 'All priority cases in current circle have been inspected and certified. Ready for new live sweep.'}
                  </p>
                  {topCase && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span>📸 Scan: {topCase.scanned_by_name || 'Insp. Priya Sharma'}</span>
                      <span className="text-sky-700 dark:text-amber-400 font-bold">
                        {topCase.stage === 'CERTIFIED_COMPLIANT' || topCase.stage === 'NOTICE_ISSUED' || topCase.stage === 'CLOSED'
                          ? `⚖️ Auditor: ${topCase.inspector_name || 'Aniket Kumar'}`
                          : `⚖️ Assigned: ${topCase.inspector_name || 'Aniket Kumar'} (Pending)`}
                      </span>
                    </div>
                  )}
                </div>
                {topCase ? (
                  <button
                    onClick={() => setSelectedReportItem(topCase)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isCompliant ? 'Sign & Certify Conformity' : 'Open Inspection Dossier'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    to="/scan"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Launch New Scan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })()}

          {/* Action Card 2: Priority 2 - Statutory Spot Notice */}
          {(() => {
            // Find case that actually has breaches/violations from pending queue
            const breachCase = pendingQueue.find(i => i.violations_count > 0 || (Array.isArray(i.violations) && i.violations.length > 0));

            return (
              <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-500 dark:border-amber-500/20 dark:hover:border-amber-500/50 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Priority 2: Spot Memo
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {breachCase ? `PRI ${breachCase.priority_risk_index}` : 'Zero Breaches'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {breachCase ? `Issue Notice: ${breachCase.brand_name}` : 'Adjudication: Zero Outstanding Breaches'}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {breachCase
                      ? `${breachCase.product_name} — ${breachCase.violations_count || breachCase.violations.length} breach(es) flagged under Section 36(1).`
                      : 'All audited packages in current circle comply with LMPC Rules 2011. No pending Section 36 notices.'}
                  </p>
                  {breachCase && (
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span>📸 Origin: {breachCase.scanned_by_name || 'Insp. Priya Sharma'}</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">🏛️ {breachCase.scan_location || 'Field Circle'}</span>
                    </div>
                  )}
                </div>

                {breachCase ? (
                  <button
                    onClick={() => handleIssueSpotMemo(breachCase)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Issue Spot Show-Cause Notice</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (queue[0]) setSelectedReportItem(queue[0]);
                      else navigate('/reports');
                    }}
                    className="w-full py-2 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 dark:hover:bg-slate-700 text-sky-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>View Circle Clearance Dossier</span>
                  </button>
                )}
              </div>
            );
          })()}


          {/* Action Card 3: Rapid Barcode & EAN Verification */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-sky-500/30 hover:border-sky-500 dark:border-sky-500/20 dark:hover:border-sky-500/50 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Target className="w-3 h-3" /> Priority 3: Market Sweep
              </span>
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="text-[10px] font-bold text-sky-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>Camera HUD</span>
              </button>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Rapid Barcode / EAN Verification
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Scan or enter EAN-13 barcode to instantly open that product's compliance audit report.
              </p>
            </div>
            <form onSubmit={handleQuickLookup} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Barcode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickBarcode}
                  onChange={(e) => setQuickBarcode(e.target.value)}
                  placeholder="Enter EAN-13 (Optional)..."
                  className="w-full pl-8 pr-2 py-1.5 bg-sky-50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="px-2.5 py-1.5 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-amber-400 font-bold rounded-xl text-xs border border-sky-300 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                title="Scan barcode with camera"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan</span>
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Query
              </button>
            </form>
          </div>


        </div>
      </div>

      {/* 3. PRIORITY RISK INSPECTION QUEUE */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
              Live Priority Risk Inspection Queue
              {selectedLocation?.id && selectedLocation.id !== 'all' && (
                <span className="ml-2 text-xs font-normal text-sky-600 dark:text-amber-400">
                  — {selectedLocation.label}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {loading
                ? 'Loading live cases from database...'
                : `${filteredQueue.length} case${filteredQueue.length !== 1 ? 's' : ''} in queue — sorted by Priority Risk Index`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, product..."
                className="pl-8 pr-3 py-1.5 bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Dedicated Filter & Sort Control Bar */}
        <div className="p-3 bg-sky-50/70 dark:bg-slate-950/70 border border-sky-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter by Case ID */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
              <Hash className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400 shrink-0" />
              <input
                type="text"
                value={filterCaseId}
                onChange={(e) => setFilterCaseId(e.target.value)}
                placeholder="Filter by Case ID (e.g. 801, LMPC)..."
                className="bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-48 font-mono font-medium"
              />
              {filterCaseId && (
                <button
                  onClick={() => setFilterCaseId('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Clear Case ID filter"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter by Risk Index Range */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Risk Index:</span>
              <select
                value={filterRiskIndex}
                onChange={(e) => setFilterRiskIndex(e.target.value)}
                className="bg-transparent font-semibold text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Risk Levels (0–100 PRI)</option>
                <option value="CRITICAL">🔴 Critical Risk (PRI ≥ 75)</option>
                <option value="HIGH">🟠 High Risk (PRI 50–74)</option>
                <option value="MODERATE">🟡 Moderate Risk (PRI 25–49)</option>
                <option value="LOW">🟢 Low Risk (PRI &lt; 25)</option>
              </select>
            </div>

            {/* Priority Level Buttons */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 p-0.5 rounded-xl text-xs">
              {['ALL', 'HIGH', 'MEDIUM'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    filterPriority === p
                      ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {p === 'ALL' ? 'All Priority' : p}
                </button>
              ))}
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
                <option value="risk_desc">Risk Index: High → Low</option>
                <option value="risk_asc">Risk Index: Low → High</option>
                <option value="case_asc">Case ID: Ascending (A-Z)</option>
                <option value="case_desc">Case ID: Descending (Z-A)</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(filterRiskIndex !== 'ALL' || filterCaseId !== '' || filterPriority !== 'ALL' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterRiskIndex('ALL');
                  setFilterCaseId('');
                  setFilterPriority('ALL');
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

        {/* Inspection Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sky-200/80 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Product / Brand</th>
                <th className="py-2.5 px-3">Chain of Custody (Scanner → Auditor)</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Risk Index</th>
                <th className="py-2.5 px-3">Flagged Statutory Non-Compliances</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 animate-pulse">
                    Loading live inspection data…
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-slate-400 text-xs">
                      {queue.length === 0
                        ? 'No inspections in database yet. Scan a product to begin.'
                        : 'No cases match your current filter.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => {
                  const isHigh = item.priority_level === 'HIGH' || item.priority_risk_index >= 70;
                  const violations = Array.isArray(item.violations) ? item.violations : [];
                  const isCrossAudit = Boolean(item.scanned_by_name && item.inspector_name && item.scanned_by_name !== item.inspector_name);
                  const isAudited = item.stage === 'CERTIFIED_COMPLIANT' || item.stage === 'NOTICE_ISSUED' || item.stage === 'CLOSED';
                  const isAdmin = user?.role === 'admin' || user?.role === 'reviewer' || user?.role === 'superadmin';
                  const isAssigned = Boolean(
                    !item.inspector_name ||
                    (user?.id && item.inspector_id && String(user.id) === String(item.inspector_id)) ||
                    (user?.badge_number && item.inspector_badge && user.badge_number.toLowerCase() === item.inspector_badge.toLowerCase()) ||
                    (user?.full_name && item.inspector_name && user.full_name.toLowerCase().trim() === item.inspector_name.toLowerCase().trim()) ||
                    (user?.username && item.inspector_name && item.inspector_name.toLowerCase().includes(user.username.toLowerCase()))
                  );
                  const isItemReadOnly = !isAdmin && !isAssigned;

                  return (
                    <tr key={item.id || item.case_number} className="hover:bg-sky-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sky-700 dark:text-amber-400">
                        <div>{item.case_number}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {item.stage === 'CERTIFIED_COMPLIANT' ? (
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-bold rounded flex items-center gap-0.5">
                              ✓ Cleared
                            </span>
                          ) : item.stage === 'NOTICE_ISSUED' ? (
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[9px] font-bold rounded flex items-center gap-0.5">
                              ⚖ Notice Sent
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[9px] font-bold rounded flex items-center gap-0.5">
                              ⚡ Pending Audit
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.product_name}</div>
                        <div className="text-[11px] text-slate-500">{item.brand_name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded shrink-0">
                              📸 Scan:
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                              {item.scanned_by_name || 'Insp. Priya Sharma'}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              ({item.scanned_by_badge || 'DOCA-INSP-302'})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-[9px] font-bold text-sky-700 dark:text-amber-400 bg-sky-50 dark:bg-amber-500/10 px-1 py-0.2 rounded shrink-0">
                              {isAudited ? '⚖️ Audited By:' : '⚖️ Assigned:'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                              {item.inspector_name || user?.full_name || 'Aniket Kumar'}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              ({item.inspector_badge || user?.badge_number || 'DOCA-INSP-2026'})
                            </span>
                            {!isAudited && (
                              <span className={`text-[8px] font-medium px-1 py-0.2 rounded flex items-center gap-0.5 ${
                                isItemReadOnly 
                                  ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-300/60 dark:border-rose-700/60'
                                  : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 dark:border-amber-700/60'
                              }`}>
                                {isItemReadOnly && <Lock className="w-2.5 h-2.5 shrink-0" />}
                                <span>{isItemReadOnly ? 'Locked' : 'Pending'}</span>
                              </span>
                            )}
                            {isCrossAudit && (
                              <span className="text-[8px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1 rounded">
                                Peer
                              </span>
                            )}
                          </div>
                        </div>
                      </td>


                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHigh
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {item.priority_risk_index}/100
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {violations.length > 0
                            ? violations.slice(0, 2).map((v, i) => (
                                <span key={i} className="px-2 py-0.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 rounded text-[10px] font-medium">
                                  {v}
                                </span>
                              ))
                            : (
                                <span className="text-[10px] text-slate-400 italic">
                                  {item.violations_count > 0 ? `${item.violations_count} violation(s)` : 'No violations'}
                                </span>
                              )}
                          {violations.length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px]">
                              +{violations.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReportItem(item)}
                            className="p-1.5 rounded-lg bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-amber-400 transition-colors cursor-pointer"
                            title="Export Official Statutory PDF Report"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedReportItem(item)}
                            className={`px-2.5 py-1 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
                              isItemReadOnly
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                                : 'bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950'
                            }`}
                          >
                            {isItemReadOnly && <Lock className="w-2.5 h-2.5 shrink-0" />}
                            <span>{isItemReadOnly ? 'View (Read-Only)' : 'Inspect'}</span>
                          </button>
                          <Link
                            to="/review-queue"
                            className="p-1 rounded-lg hover:bg-sky-200 dark:hover:bg-slate-700 text-slate-500"
                            title="View Full Docket"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Optical Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        initialBarcode={quickBarcode}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {/* Statutory Inspection & Compliance Report Modal */}
      {selectedReportItem && (
        <InspectionReportModal
          isOpen={Boolean(selectedReportItem)}
          caseItem={selectedReportItem}
          scanData={selectedReportItem}
          onClose={() => setSelectedReportItem(null)}
          onCaseUpdated={handleCaseUpdated}
        />
      )}

      {/* Legal Notice Show-Cause Modal */}
      {selectedNoticeItem && (
        <LegalNoticeModal
          isOpen={Boolean(selectedNoticeItem)}
          scan={selectedNoticeItem}
          scanId={selectedNoticeItem.id || selectedNoticeItem.scan_id}
          caseNumber={selectedNoticeItem.case_number}
          brandName={selectedNoticeItem.brand_name}
          productName={selectedNoticeItem.product_name}
          violations={selectedNoticeItem.violations}
          onClose={() => setSelectedNoticeItem(null)}
          onCaseUpdated={handleCaseUpdated}
        />
      )}

    </div>
  );
};



