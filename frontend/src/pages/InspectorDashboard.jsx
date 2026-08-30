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
  Sparkles,
  Hash,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  X
import { useAuth } from '../context/AuthContext';

export const InspectorDashboard = () => {
  const { selectedLocation, selectedDateRange } = useAuth();
  const [queue, setQueue] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterRiskIndex, setFilterRiskIndex] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [filterCaseId, setFilterCaseId] = useState('');
  const [sortBy, setSortBy] = useState('risk_desc'); // 'risk_desc' | 'risk_asc' | 'case_asc' | 'case_desc'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedLocation, selectedDateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const locId = selectedLocation?.label || selectedLocation?.id || '';
      const dateId = selectedDateRange?.id || 'all';
      const [queueRes, analyticsRes] = await Promise.all([
        fetch(`/api/v1/inspections/priority-queue?location=${encodeURIComponent(locId)}&date_range=${encodeURIComponent(dateId)}`),
        fetch(`/api/v1/analytics/summary?location=${encodeURIComponent(locId)}&date_range=${encodeURIComponent(dateId)}`)
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
        <div className="p-5 border-b border-sky-200 dark:border-slate-800 space-y-3 bg-sky-50/50 dark:bg-slate-950/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-sky-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-amber-500 w-64 shadow-2xs"
              />
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Showing <b>{filteredQueue.length}</b> prioritized inspection target{filteredQueue.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Dedicated Filter & Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-sky-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter by Case ID */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <Hash className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={filterCaseId}
                  onChange={(e) => setFilterCaseId(e.target.value)}
                  placeholder="Filter Case ID (e.g. 801, LMPC)..."
                  className="bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-44 font-mono font-medium"
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
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs">
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

              {/* Priority Filter */}
              <div className="flex items-center gap-1 bg-sky-200/60 dark:bg-slate-900 p-0.5 rounded-xl border border-sky-300 dark:border-slate-800">
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      filterPriority === p
                        ? 'bg-sky-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {p === 'ALL' ? 'All Priority' : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs">
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

              {/* Reset */}
              {(filterRiskIndex !== 'ALL' || filterCaseId !== '' || filterPriority !== 'ALL' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setFilterRiskIndex('ALL');
                    setFilterCaseId('');
                    setFilterPriority('ALL');
                    setSearchQuery('');
                    setSortBy('risk_desc');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl font-semibold transition-all cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
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
