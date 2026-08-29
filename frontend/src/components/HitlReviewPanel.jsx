import React, { useState } from 'react';
import { Check, Edit3, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const HitlReviewPanel = ({ 
  scanId, 
  fields = [], 
  onFieldUpdated, 
  selectedFieldKey,
  onSelectField 
}) => {
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = (field) => {
    setEditingKey(field.field_key);
    setEditValue(field.human_corrected_value || field.extracted_value || '');
  };

  const handleSaveCorrection = async (fieldKey) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/scans/${scanId}/correct-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_key: fieldKey,
          corrected_value: editValue,
          notes: 'Verified and corrected by Inspector'
        })
      });
      if (res.ok) {
        const updatedScan = await res.json();
        setEditingKey(null);
        if (onFieldUpdated) onFieldUpdated(updatedScan);
      }
    } catch (e) {
      console.error('Error saving field correction:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Human-in-the-Loop (HITL) Verification
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {fields.filter(f => f.is_verified_by_human).length}/{fields.length} Verified
        </span>
      </div>

      <p className="text-[11px] text-slate-400 mt-2">
        Fields with confidence &lt; 85% or OCR noise (e.g. <code className="text-amber-300">₹12O</code>) are flagged. Review and correct below to ensure legally defensible evidence.
      </p>

      {/* Fields List */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 max-h-[480px]">
        {fields.map(field => {
          const isSelected = selectedFieldKey === field.field_key;
          const isEditing = editingKey === field.field_key;
          const isLowConf = field.requires_human_verification && !field.is_verified_by_human;
          const confPercent = Math.round(field.confidence * 100);

          return (
            <div
              key={field.id || field.field_key}
              onClick={() => onSelectField && onSelectField(field.field_key)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/20' 
                  : isLowConf
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{field.field_label}</span>
                  {isLowConf && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                      <AlertTriangle className="w-2.5 h-2.5" /> Review Required
                    </span>
                  )}
                  {field.is_verified_by_human && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                      <ShieldCheck className="w-2.5 h-2.5" /> Human Verified
                    </span>
                  )}
                </div>

                {/* Confidence Meter */}
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        confPercent >= 85 ? 'bg-emerald-500' : confPercent >= 60 ? 'bg-amber-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${confPercent}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${
                    confPercent >= 85 ? 'text-emerald-400' : confPercent >= 60 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {confPercent}%
                  </span>
                </div>
              </div>

              {/* Value / Edit Form */}
              <div className="mt-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter verified correct text..."
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingKey(null); }}
                        className="px-2.5 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveCorrection(field.field_key); }}
                        disabled={saving}
                        className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded text-[11px] font-bold transition-all disabled:opacity-50"
                      >
                        {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Confirm & Re-evaluate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 group">
                    <div className="text-xs font-mono text-slate-300 break-all">
                      {field.human_corrected_value ? (
                        <span className="text-emerald-300 font-semibold">{field.human_corrected_value}</span>
                      ) : field.extracted_value ? (
                        field.extracted_value
                      ) : (
                        <span className="text-red-400 italic">Declaration Missing</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStartEdit(field); }}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700 opacity-80 group-hover:opacity-100 transition-all text-[10px] flex items-center gap-1"
                      title="Edit / Correct value"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
