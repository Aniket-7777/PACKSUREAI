import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';

export const InspectorDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [queueRes, analyticsRes] = await Promise.all([
        fetch('/api/v1/inspections/priority-queue'),
        fetch('/api/v1/analytics/summary')
      ]);
      if (queueRes.ok) {
        const qData = await queueRes.json();
        setQueue(qData);
      }
      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredQueue = (Array.isArray(queue) ? queue : []).filter(item => {
    if (!item) return false;
    const matchesPriority = filterPriority === 'ALL' || item.priority_level === filterPriority;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesPriority;
    const pName = String(item.product_name || '').toLowerCase();
    const bName = String(item.brand_name || '').toLowerCase();
    const cNum = String(item.case_number || '').toLowerCase();
    const matchesSearch = pName.includes(q) || bName.includes(q) || cNum.includes(q);
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-200 dark:bg-amber-500/10 text-sky-800 dark:text-amber-400 border border-sky-300 dark:border-amber-500/30 uppercase tracking-wider">
              Enforcement Command Center
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">DoCA Legal Metrology Wing</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100 mt-1">
            Priority Risk Inspection Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            AI-prioritized surveillance targeting high-risk brands and non-compliant packaged commodities under Legal Metrology Rules, 2011.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/scan"
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md shadow-sky-600/20 dark:shadow-amber-500/20 transition-all"
          >
            <Scan className="w-4 h-4" />
            New Inspection
          </Link>
          <Link
            to="/review-queue"
            className="flex items-center gap-1.5 bg-sky-200/70 hover:bg-sky-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-sky-300 dark:border-slate-700 transition-all shadow-xs"
          >
            <ListFilter className="w-4 h-4 text-sky-700 dark:text-amber-400" />
            Review Queue
          </Link>
          <Link
            to="/products"
            className="flex items-center gap-1.5 bg-sky-200/70 hover:bg-sky-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-sky-300 dark:border-slate-700 transition-all shadow-xs"
          >
            <Package className="w-4 h-4 text-sky-700 dark:text-amber-400" />
            Search Products
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Scans Audited</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Scan className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-2">
            {analytics?.total_scans_conducted || 248}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +18% from last week
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Rate</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-2">
            {analytics?.national_average_compliance_rate || 78.4}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Target benchmark: &ge; 90%
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Statutory Violations</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-red-600 dark:text-red-400 mt-2">
            {analytics?.total_violations_flagged || 42}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
            Sec 36 Liability: ₹{analytics?.estimated_penalties_inr?.toLocaleString() || '10,50,000'}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Show-Cause Notices</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-2">
            {analytics?.legal_notices_dispatched || 19}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Active Hearings: 14 Cases
          </div>
        </div>
      </div>

      {/* Priority Queue Section */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Controls */}
        <div className="p-5 border-b border-sky-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-sky-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search case, product or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-sky-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-amber-500 w-64 shadow-2xs"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-1 bg-sky-200/60 dark:bg-slate-900 p-1 rounded-xl border border-sky-300 dark:border-slate-800">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    filterPriority === p
                      ? 'bg-sky-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing <b>{filteredQueue.length}</b> prioritized inspection targets
          </div>
        </div>

        {/* Priority Cases Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-sky-100/60 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-sky-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Case Ref</th>
                <th className="py-3 px-4">Commodity / Product</th>
                <th className="py-3 px-4">Brand / Manufacturer</th>
                <th className="py-3 px-4">Priority Risk Index</th>
                <th className="py-3 px-4">Compliance Score</th>
                <th className="py-3 px-4">Violations</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
              {filteredQueue.map(item => {
                const isHigh = item.priority_level === 'HIGH';
                const isMed = item.priority_level === 'MEDIUM';

                return (
                  <tr key={item.inspection_id} className="hover:bg-sky-100/30 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-sky-800 dark:text-amber-400 font-bold">
                      {item.case_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{item.product_name}</div>
                      <div className="text-[10px] text-slate-500">{item.category}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-300">
                      {item.brand_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isHigh 
                            ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30' 
                            : isMed 
                              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30' 
                              : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        }`}>
                          PRI: {item.priority_risk_index}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">{item.priority_level}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          item.compliance_score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : item.compliance_score >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.compliance_score}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.violations_count > 0 ? (
                        <span className="text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {item.violations_count} Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 0 (Compliant)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono font-bold bg-sky-100 dark:bg-slate-900 border border-sky-300 dark:border-slate-700 px-2 py-0.5 rounded text-sky-900 dark:text-slate-300">
                        {item.stage}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/scan?id=${item.scan_id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-amber-400 hover:text-sky-900 dark:hover:text-amber-300 hover:underline"
                      >
                        Inspect Evidence <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
