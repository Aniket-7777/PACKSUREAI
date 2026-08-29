import React, { useState } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  TrendingUp, 
  Download, 
  BarChart3, 
  Layers, 
  FileCheck2, 
  RefreshCw, 
  Database,
  ShieldCheck,
  Percent
} from 'lucide-react';

export const AiAccuracyDashboardPage = () => {
  const [exportMsg, setExportMsg] = useState('');

  const handleExportDataset = () => {
    setExportMsg('Exported 142 verified human-in-the-loop packaging corrections as JSONL fine-tuning dataset.');
    setTimeout(() => setExportMsg(''), 4000);
  };

  const fieldAccuracies = [
    { field: 'Maximum Retail Price (MRP)', accuracy: '98.4%', status: 'Optimal', samples: '248 samples' },
    { field: 'Declared Net Quantity', accuracy: '96.2%', status: 'Optimal', samples: '248 samples' },
    { field: 'Month & Year of Manufacture', accuracy: '94.0%', status: 'Good', samples: '248 samples' },
    { field: 'Unit Sale Price (USP)', accuracy: '92.5%', status: 'Good', samples: '248 samples' },
    { field: 'Manufacturer Physical Address', accuracy: '91.8%', status: 'Good', samples: '248 samples' },
    { field: 'Consumer Care Helpline & Email', accuracy: '89.6%', status: 'Fair (Small font variance)', samples: '248 samples' },
    { field: 'Rule 7 Font Height', accuracy: 'Unassessed', status: 'Requires Physical Calibrated Scale', samples: 'Manual check required' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
              Model Calibration & Continuous Improvement
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Dual-Track Vision OCR Evaluation</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            AI Extraction Accuracy & Calibration Metrics
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Track character error rates, mathematical cross-validation consistency, and export verified HITL corrections for dataset curation.
          </p>
        </div>

        <button
          onClick={handleExportDataset}
          className="px-4 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Database className="w-4 h-4" />
          Export HITL Training Dataset (JSONL)
        </button>
      </div>

      {/* Export Alert */}
      {exportMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{exportMsg}</span>
        </div>
      )}

      {/* Accuracy KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Overall Character Accuracy</div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            94.8%
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Dual-Track Vision Calibration</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Human Correction Rate</div>
          <div className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
            5.2%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Resolved in HITL Review</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Math Check Consistency</div>
          <div className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
            97.1%
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">USP ≈ MRP / Net Qty Verified</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Barcode Corroboration Agreement</div>
          <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
            96.4%
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">GS1 Registry Alignment</div>
        </div>
      </div>

      {/* Field-by-Field Breakdown Table */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Percent className="w-4 h-4 text-sky-700 dark:text-amber-400" />
            Field-Specific Extraction Precision Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sky-100/60 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-sky-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Statutory Packaging Field</th>
                <th className="py-3 px-3">Exact-Match Accuracy</th>
                <th className="py-3 px-3">Calibration Status</th>
                <th className="py-3 px-3 text-right">Validation Dataset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
              {fieldAccuracies.map((f, i) => (
                <tr key={i} className="hover:bg-sky-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-200">{f.field}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{f.accuracy}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      f.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                      f.status === 'Good' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400' :
                      'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">{f.samples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
