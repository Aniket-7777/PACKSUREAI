import React from 'react';
import { AlertCircle, CheckCircle, Scale, ShieldAlert, ArrowRight } from 'lucide-react';

export const ExplainabilityCard = ({ violation }) => {
  const isCritical = violation.severity === 'CRITICAL';
  const isHigh = violation.severity === 'HIGH';

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isCritical 
        ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20' 
        : isHigh
          ? 'bg-amber-950/20 border-amber-500/40 shadow-md'
          : 'bg-slate-900/40 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`p-1.5 rounded-lg mt-0.5 ${
            isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">{violation.rule_title}</h4>
            <div className="text-[11px] font-mono text-amber-400/90">{violation.rule_code}</div>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isCritical 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {violation.severity}
          </span>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Liability: <span className="font-bold text-red-400">₹{violation.penalty_estimate_inr?.toLocaleString() || '25,000'}</span>
          </div>
        </div>
      </div>

      {/* Structured Legal Evidence Chain */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Detected Evidence
          </div>
          <p className="mt-0.5 font-mono text-slate-200">{violation.detected_evidence}</p>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Expected Requirement
          </div>
          <p className="mt-0.5 text-slate-300">{violation.expected_requirement}</p>
        </div>
      </div>

      {/* Recommended Enforcement Action */}
      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-amber-300">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span><b>Recommended Action:</b> {violation.recommended_action}</span>
        </div>
        <span className="text-[10px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 shrink-0">
          Sec 36 LMA 2009
        </span>
      </div>
    </div>
  );
};
