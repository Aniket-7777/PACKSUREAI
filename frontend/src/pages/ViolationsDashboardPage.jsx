import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  ShieldAlert,
  TrendingDown,
  Building2,
  Scale,
  BarChart3,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export const ViolationsDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [offenders, setOffenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveData();
  }, []);

  const fetchLiveData = async () => {
    setLoading(true);
    try {
      const [sumRes, offRes] = await Promise.all([
        fetch('/api/v1/analytics/summary'),
        fetch('/api/v1/analytics/repeat-offenders'),
      ]);
      if (sumRes.ok) setSummary(await sumRes.json());
      if (offRes.ok) setOffenders(await offRes.json());
    } catch (e) {
      console.error('Analytics fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Derive per-violation stats from summary
  const topViolations = summary?.top_violation_types || [];
  const totalFlagged = summary?.total_violations_flagged || 0;
  const totalScans = summary?.total_scans_conducted || 0;
  const avgCompliance = summary?.national_average_compliance_rate || 0;
  const estimatedPenalty = summary?.estimated_penalties_inr || 0;
  const noticesIssued = summary?.legal_notices_dispatched || 0;

  // Compute per-rule percentage share and estimated penalty
  const totalViolCount = topViolations.reduce((acc, v) => acc + (v.count || 0), 0) || 1;
  const violationsWithMeta = topViolations.map((v) => {
    const share = Math.round((v.count / totalViolCount) * 100);
    // Estimate: assume avg ₹22,500 compoundable per violation
    const penaltyEst = v.count * 22500;
    return { ...v, share, penaltyEst };
  });

  // Risk badge colour
  const riskColor = (risk) => {
    if (!risk) return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    const r = risk.toUpperCase();
    if (r.startsWith('HIGH')) return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    if (r.startsWith('MEDIUM')) return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  };

  const fmtINR = (n) =>
    '₹ ' + Number(n).toLocaleString('en-IN');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded-lg">
              Statutory Non-Compliance Intelligence
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">LMPC Enforcement Analytics</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            National Packaging Violations Dashboard
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Breakdown of deceptive pricing, shrinkflation tactics, undeclared metric units, and Section 36 penalties across brands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveData}
            disabled={loading}
            className="p-2 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-sky-800 dark:text-slate-300 rounded-xl transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/reports"
            className="px-4 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Export Violations Summary
          </Link>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products Scanned', value: totalScans, color: 'text-sky-700 dark:text-sky-400', icon: <BarChart3 className="w-4 h-4" /> },
          { label: 'Total Violations Flagged', value: totalFlagged, color: 'text-red-600 dark:text-red-400', icon: <ShieldAlert className="w-4 h-4" /> },
          { label: 'Notices Dispatched', value: noticesIssued, color: 'text-amber-600 dark:text-amber-400', icon: <FileText className="w-4 h-4" /> },
          { label: 'Avg Compliance Rate', value: `${avgCompliance}%`, color: avgCompliance >= 80 ? 'text-emerald-600' : 'text-red-500', icon: <CheckCircle2 className="w-4 h-4" /> },
        ].map((kpi, i) => (
          <div key={i} className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${kpi.color}`}>
              {kpi.icon} {kpi.label}
            </div>
            <div className={`text-2xl font-bold font-display mt-1 ${kpi.color}`}>{loading ? '—' : kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Breach Types */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-700 dark:text-amber-400" />
              Most Prevalent Statutory Breaches
            </h2>
            <span className="text-xs text-slate-500 font-mono">{loading ? '...' : `${totalFlagged} Total Flagged`}</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400 text-xs animate-pulse">Loading live violation data…</div>
          ) : violationsWithMeta.length === 0 ? (
            <div className="py-10 text-center text-emerald-600 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              No violations recorded yet. Keep scanning!
            </div>
          ) : (
            <div className="space-y-3">
              {violationsWithMeta.map((v, i) => (
                <div key={i} className="p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="truncate max-w-[320px]">{v.title || v.rule}</span>
                    <span className="font-mono text-red-600 dark:text-red-400 shrink-0 ml-2">
                      {v.count} Cases ({v.share}%)
                    </span>
                  </div>
                  <div className="w-full bg-sky-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: `${v.share}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Compoundable Penalty Clause:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{fmtINR(v.penaltyEst)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total estimated penalty footer */}
          {!loading && totalFlagged > 0 && (
            <div className="flex items-center justify-between px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs">
              <span className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Total Estimated Section 36 Penalty (All Cases):
              </span>
              <span className="font-bold font-mono text-red-700 dark:text-red-400 text-sm">{fmtINR(estimatedPenalty)}</span>
            </div>
          )}
        </div>

        {/* Right: Repeat Offenders */}
        <div className="lg:col-span-5 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-500" />
              Top Repeat Offender Brands
            </h2>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400 text-xs animate-pulse">Loading brand risk data…</div>
          ) : offenders.length === 0 ? (
            <div className="py-10 text-center text-emerald-600 text-xs">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
              No repeat offenders detected yet.
            </div>
          ) : (
            <div className="space-y-3">
              {offenders.map((b, i) => (
                <div key={i} className="p-3.5 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span className="truncate max-w-[180px]">{b.brand}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold font-mono shrink-0 ml-2 ${riskColor(b.risk)}`}>
                      {b.risk}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Flagged Violations: <b>{b.violations} cases</b></span>
                    <span>Last Notice: <b>{b.lastNotice}</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 font-medium">
            💡 <b>Automated Triage Note:</b> Brands with recidivism ≥ 3 violations are automatically escalated into the Priority Risk Queue for mandatory physical field raids.
          </div>
        </div>
      </div>
    </div>
  );
};
