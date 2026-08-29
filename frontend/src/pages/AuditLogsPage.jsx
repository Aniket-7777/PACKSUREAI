import React, { useState, useEffect } from 'react';
import { Activity, Shield, Clock, Search, Filter, History } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/audit/');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded uppercase">
            Security & Governance
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-600 dark:text-slate-400">Departmental Audit Trail</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
          Tamper-Proof Enforcement Actions Ledger
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Every scan creation, inspector manual verification (HITL), rule edit, and statutory legal notice dispatch is cryptographically logged with user identity and timestamps.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-sky-100/60 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-sky-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Officer / User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Audit Summary & Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-sky-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    {l.username}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-200/70 dark:bg-slate-800 text-sky-800 dark:text-amber-400 uppercase">
                      {l.user_role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-800 dark:text-sky-400">
                    {l.action_type}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {l.entity_type} #{l.entity_id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {l.change_summary}
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
