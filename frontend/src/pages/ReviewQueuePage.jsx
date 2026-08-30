import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListFilter, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Scale, 
  Clock, 
  ShieldAlert,
  Camera,
  Printer,
  Hash,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  X
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { InspectionReportModal } from '../components/InspectionReportModal';

export const ReviewQueuePage = () => {
  const { selectedLocation, selectedDateRange } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterRiskIndex, setFilterRiskIndex] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [filterCaseId, setFilterCaseId] = useState('');
  const [sortBy, setSortBy] = useState('risk_desc'); // 'risk_desc' | 'risk_asc' | 'case_asc' | 'case_desc'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportItem, setSelectedReportItem] = useState(null);

  useEffect(() => {
    fetchQueue();
  }, [selectedLocation, selectedDateRange]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const locId = selectedLocation?.label || selectedLocation?.id || '';
      const dateId = selectedDateRange?.id || 'all';
      const res = await fetch(`/api/v1/inspections/priority-queue?location=${encodeURIComponent(locId)}&date_range=${encodeURIComponent(dateId)}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }

    } catch (e) {
      console.error('Error loading review queue:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = (Array.isArray(queue) ? queue : []).filter(item => {
    if (!item) return false;
    const matchesPriority = filterPriority === 'ALL' || item.priority_level === filterPriority;
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    
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

    return matchesPriority && matchesCategory && matchesRisk && matchesCaseId && matchesSearch;
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg">
              Human-in-the-Loop (HITL) Queue
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Priority Triaged Inspections</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Inspection Review Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Items requiring officer verification due to low confidence, conflicting declarations, or image quality warnings.
          </p>
        </div>

        <Link
          to="/scan"
          className="px-4 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Camera className="w-4 h-4" />
          New Inspection Scan
        </Link>
      </div>

      {/* Queue Filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 w-56 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="Food & Grocery">Food & Grocery</option>
              <option value="Dairy & Beverages">Dairy & Beverages</option>
              <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            <b>{filteredItems.length}</b> case{filteredItems.length !== 1 ? 's' : ''} awaiting review
          </div>
        </div>

        {/* Dedicated Filter & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-sky-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter by Case ID */}
            <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
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
            <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
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
            <div className="flex items-center gap-1 bg-sky-200/60 dark:bg-slate-950 p-0.5 rounded-xl border border-sky-300 dark:border-slate-800 text-xs">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    filterPriority === p
                      ? 'bg-sky-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {p === 'ALL' ? 'All Priority' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 shadow-2xs">
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
            {(filterRiskIndex !== 'ALL' || filterCaseId !== '' || filterPriority !== 'ALL' || filterCategory !== 'ALL' || searchQuery !== '') && (
              <button
                onClick={() => {
                  setFilterRiskIndex('ALL');
                  setFilterCaseId('');
                  setFilterPriority('ALL');
                  setFilterCategory('ALL');
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
      </div>

      {/* Triaged Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.inspection_id} className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-400 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-800 dark:text-amber-400">{item.case_number}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  item.priority_level === 'HIGH' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                  item.priority_level === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}>
                  PRI: {item.priority_risk_index} ({item.priority_level})
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2">{item.product_name}</h3>
              <p className="text-xs text-slate-500">{item.brand_name} • {item.category}</p>

              <div className="mt-3 p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Compliance Score:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{item.compliance_score}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Flagged Breaches:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{item.violations_count} Breaches</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Triage Stage:</span>
                  <span className="font-mono font-bold text-sky-700 dark:text-slate-300">{item.stage}</span>
                </div>
                <div className="pt-1.5 border-t border-sky-200/40 dark:border-slate-800/80 space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">📸 Field Scan:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.scanned_by_name || 'Insp. Priya Sharma'} <span className="font-mono text-slate-400">({item.scanned_by_badge || 'DOCA-INSP-302'})</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      {item.stage === 'CERTIFIED_COMPLIANT' || item.stage === 'NOTICE_ISSUED' || item.stage === 'CLOSED'
                        ? '⚖️ Audited By:'
                        : '⚖️ Assigned Officer:'}
                    </span>
                    <span className="font-semibold text-sky-800 dark:text-amber-400">
                      {item.inspector_name || 'Aniket Kumar'} <span className="font-mono text-slate-400">({item.inspector_badge || 'DOCA-INSP-2026'})</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>



            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportItem(item)}
                className="px-3 py-2 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-900 dark:text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                title="Export Statutory PDF Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>

              <Link
                to={`/scan?id=${item.scan_id || item.id}`}
                className="flex-1 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <span>HITL Review</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Statutory Inspection & Compliance Report Modal */}
      {selectedReportItem && (
        <InspectionReportModal
          isOpen={Boolean(selectedReportItem)}
          caseItem={selectedReportItem}
          onClose={() => setSelectedReportItem(null)}
          onCaseUpdated={() => {
            fetchQueue();
          }}
        />
      )}
    </div>
  );
};


