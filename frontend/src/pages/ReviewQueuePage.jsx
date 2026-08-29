import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListFilter, 
  AlertTriangle, 
  Search, 
  Clock, 
  Filter, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles,
  HelpCircle,
  Camera
} from 'lucide-react';

export const ReviewQueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/inspections/priority-queue');
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
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesPriority && matchesCategory;
    const pName = String(item.product_name || '').toLowerCase();
    const bName = String(item.brand_name || '').toLowerCase();
    const cNum = String(item.case_number || '').toLowerCase();
    const matchesSearch = pName.includes(q) || bName.includes(q) || cNum.includes(q);
    return matchesPriority && matchesCategory && matchesSearch;
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
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, brand or case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 w-56 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-sky-200/60 dark:bg-slate-950 p-1 rounded-xl border border-sky-300 dark:border-slate-800 text-xs">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  filterPriority === p
                    ? 'bg-sky-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Food & Grocery">Food & Grocery</option>
            <option value="Dairy & Beverages">Dairy & Beverages</option>
            <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          <b>{filteredItems.length}</b> cases awaiting review
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
                <div className="pt-1 border-t border-sky-200/40 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Filed by:</span>
                  <span className="font-semibold text-sky-800 dark:text-amber-400">
                    {item.inspector_name || 'Insp. Vikram Singh'} <span className="font-mono text-slate-400">({item.inspector_badge || 'DOCA-INSP-104'})</span>
                  </span>
                </div>
              </div>
            </div>


            <Link
              to={`/scan?id=${item.scan_id}`}
              className="w-full py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              Open Interactive HITL Review <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
