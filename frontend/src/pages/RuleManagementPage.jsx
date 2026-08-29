import React, { useState, useEffect } from 'react';
import { Scale, Plus, Edit, CheckCircle2, ShieldAlert, Calendar, FileText, X, Check, AlertTriangle, Building2, Gavel } from 'lucide-react';

export const RuleManagementPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    rule_code: '',
    rule_title: '',
    version: '2026.1',
    effective_from: '2026-01-01',
    applicable_categories: 'ALL',
    requirement_summary: '',
    penalty_clause: 'Section 36 of Legal Metrology Act, 2009 (₹25,000 fine)',
    severity_level: 'HIGH',
    is_active: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/rules/');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error('Error fetching rules:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setFormData({
      rule_code: `LMPC_R${rules.length + 1}_NEW`,
      rule_title: '',
      version: '2026.1',
      effective_from: '2026-01-01',
      applicable_categories: 'ALL',
      requirement_summary: '',
      penalty_clause: 'Section 36 of Legal Metrology Act, 2009 (₹25,000 fine)',
      severity_level: 'HIGH',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      rule_code: rule.rule_code,
      rule_title: rule.rule_title,
      version: rule.version,
      effective_from: rule.effective_from,
      applicable_categories: rule.applicable_categories,
      requirement_summary: rule.requirement_summary,
      penalty_clause: rule.penalty_clause,
      severity_level: rule.severity_level,
      is_active: rule.is_active
    });
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/rules/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchRules();
      }
    } catch (e) {
      console.error('Error saving rule:', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase">
              Statutory Division
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400">Gazette Temporal Version Control</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Legal Metrology Rules Registry (LMPC 2011)
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure temporal validity dates, statutory penalty clauses, and official category exemptions (Rule 26, Rule 3).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add / Amend Rule
        </button>
      </div>

      {/* Prominent Legal Validation Status Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs">
        <Gavel className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-bold">Legal Review Status & Statutory Gate:</h4>
          <p className="leading-relaxed">
            "Automated AI detection results are preliminary and require authorized legal reviewer endorsement before formal Section 36 Show-Cause notices are dispatched."
          </p>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-sky-100/60 dark:bg-slate-950/80 text-slate-700 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-sky-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Rule Code</th>
                <th className="py-3 px-4">Statutory Provision</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Section Penalty Clause</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
              {rules.map((r) => (
                <tr key={r.id || r.rule_code} className="hover:bg-sky-100/30 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sky-800 dark:text-amber-400">
                    {r.rule_code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{r.rule_title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{r.requirement_summary}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    v{r.version}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {r.effective_from}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      r.severity_level === 'CRITICAL' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                      r.severity_level === 'HIGH' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                    }`}>
                      {r.severity_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {r.penalty_clause}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 hover:bg-sky-200 dark:hover:bg-slate-800 rounded-lg text-sky-700 dark:text-slate-400 transition-colors"
                      title="Edit Rule"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-700 dark:text-amber-400" />
                {editingRule ? 'Amend Statutory Rule' : 'Add New Legal Rule Codification'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Rule Code</label>
                <input
                  type="text"
                  value={formData.rule_code}
                  onChange={(e) => setFormData({...formData, rule_code: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Rule Title</label>
                <input
                  type="text"
                  value={formData.rule_title}
                  onChange={(e) => setFormData({...formData, rule_title: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Requirement Summary</label>
                <textarea
                  rows="3"
                  value={formData.requirement_summary}
                  onChange={(e) => setFormData({...formData, requirement_summary: e.target.value})}
                  className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData({...formData, effective_from: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Severity</label>
                  <select
                    value={formData.severity_level}
                    onChange={(e) => setFormData({...formData, severity_level: e.target.value})}
                    className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-sky-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Save Codification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
