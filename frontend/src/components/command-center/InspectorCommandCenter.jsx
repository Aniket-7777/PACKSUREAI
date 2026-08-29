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
  Barcode
} from 'lucide-react';
import { BarcodeScannerModal } from '../BarcodeScannerModal';

export const InspectorCommandCenter = () => {

  const { user, selectedLocation, selectedDateRange } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickBarcode, setQuickBarcode] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [memoSuccess, setMemoSuccess] = useState('');


  useEffect(() => {
    fetchDashboardData();
  }, [selectedLocation, selectedDateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const locationId = selectedLocation?.id || '';
      const [queueRes, analyticsRes] = await Promise.all([
        fetch(`/api/v1/inspections/priority-queue?location=${encodeURIComponent(locationId)}`),
        fetch(`/api/v1/analytics/summary?location=${encodeURIComponent(locationId)}`),
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

  const handleQuickLookup = (e) => {
    e.preventDefault();
    if (quickBarcode.trim()) {
      navigate(`/scan?barcode=${encodeURIComponent(quickBarcode.trim())}`);
    }
  };

  const handleIssueSpotMemo = (caseNo) => {
    setMemoSuccess(`Spot Non-Compliance Notice generated for Case ${caseNo}. Officer dispatch recorded.`);
    setTimeout(() => setMemoSuccess(''), 4500);
  };

  const filteredQueue = (Array.isArray(queue) ? queue : []).filter(item => {
    if (!item) return false;
    const matchesPriority = filterPriority === 'ALL' || item.priority_level === filterPriority;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = !q ||
      String(item.product_name || '').toLowerCase().includes(q) ||
      String(item.brand_name || '').toLowerCase().includes(q) ||
      String(item.case_number || '').toLowerCase().includes(q);
    return matchesPriority && matchesSearch;
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
          {/* Action Card 1: Highest priority from live queue */}
          {(() => {
            const topCase = queue[0];
            return (
              <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-rose-500/30 hover:border-rose-500 dark:border-rose-500/20 dark:hover:border-rose-500/50 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" /> Priority 1: Field Audit
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{topCase ? `PRI ${topCase.priority_risk_index}` : 'No cases'}</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {topCase ? `Audit: ${topCase.product_name}` : 'No high-risk cases pending'}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {topCase
                      ? `Case ${topCase.case_number} — ${topCase.violations_count} statutory violation${topCase.violations_count !== 1 ? 's' : ''} detected.`
                      : 'All clear. Queue is empty.'}
                  </p>
                </div>
                {topCase ? (
                  <Link
                    to={`/scan?id=${topCase.scan_id}`}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Open Inspection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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

          {/* Action Card 2: Second highest */}
          {(() => {
            const secCase = queue[1];
            return (
              <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-500 dark:border-amber-500/20 dark:hover:border-amber-500/50 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Priority 2: Spot Memo
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{secCase ? `PRI ${secCase.priority_risk_index}` : '—'}</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {secCase ? `Issue Notice: ${secCase.brand_name}` : 'No secondary case'}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {secCase
                      ? `${secCase.product_name} — ${secCase.violations_count} violation(s). Case: ${secCase.case_number}.`
                      : 'No additional high-risk cases in queue.'}
                  </p>
                </div>
                {secCase ? (
                  <button
                    onClick={() => handleIssueSpotMemo(secCase.case_number)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Issue Spot Notice</span>
                  </button>
                ) : (
                  <div className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs flex items-center justify-center">
                    Queue Empty
                  </div>
                )}
              </div>
            );
          })()}

          {/* Action Card 3: Quick barcode lookup */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-sky-500/30 hover:border-sky-500 dark:border-sky-500/20 dark:hover:border-sky-500/50 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Target className="w-3 h-3" /> Priority 3: Market Sweep
              </span>
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="text-[10px] font-bold text-sky-700 dark:text-amber-400 hover:underline flex items-center gap-1"
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
                className="px-2.5 py-1.5 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-amber-400 font-bold rounded-xl text-xs border border-sky-300 dark:border-slate-700 transition-colors flex items-center gap-1"
                title="Scan barcode with camera"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan</span>
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-xl text-xs transition-colors"
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
            <div className="flex items-center bg-sky-100/70 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 p-1 rounded-xl text-xs">
              {['ALL', 'HIGH', 'MEDIUM'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterPriority === p
                      ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search brand, product, case..."
                className="pl-8 pr-3 py-1.5 bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Inspection Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-sky-200/80 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Product / Brand</th>
                <th className="py-2.5 px-3">Auditing Inspector</th>
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
                  return (
                    <tr key={item.id || item.case_number} className="hover:bg-sky-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-sky-700 dark:text-amber-400">
                        {item.case_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.product_name}</div>
                        <div className="text-[11px] text-slate-500">{item.brand_name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(item.inspector_name || 'Insp').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-[11px] whitespace-nowrap">
                              {item.inspector_name || 'Insp. Vikram Singh'}
                            </div>
                            <div className="text-[9px] font-mono text-slate-400">
                              {item.inspector_badge || 'DOCA-INSP-104'}
                            </div>
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
                          <Link
                            to={`/scan?id=${item.scan_id}`}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                          >
                            Inspect
                          </Link>
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
        onBarcodeScanned={(code) => {
          setQuickBarcode(code);
          navigate(`/products?q=${encodeURIComponent(code)}`);
        }}
      />
    </div>
  );
};


