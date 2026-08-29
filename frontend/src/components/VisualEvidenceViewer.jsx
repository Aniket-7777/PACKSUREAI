import React, { useState } from 'react';
import { Layers, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';

export const VisualEvidenceViewer = ({ 
  frontImage, 
  backImage, 
  fields = [], 
  violations = [], 
  onSelectField, 
  selectedFieldKey 
}) => {
  const [activeFace, setActiveFace] = useState('back');
  const [zoomLevel, setZoomLevel] = useState(1);

  const currentImage = activeFace === 'front' ? frontImage : backImage;

  // Filter fields belonging to current active face
  const faceFields = fields.filter(f => {
    const fFace = f.bbox?.face || 'back';
    return fFace === activeFace;
  });

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col h-full">
      {/* Header & Face Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Visual Evidence Locker
          </span>
        </div>

        {/* Face Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveFace('front')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeFace === 'front'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Front Face (PDP)
          </button>
          <button
            onClick={() => setActiveFace('back')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activeFace === 'back'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Back Face (Declarations)
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.15))}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas / Image Display with Bounding Boxes */}
      <div className="relative flex-1 min-h-[420px] bg-slate-900/60 rounded-xl mt-3 flex items-center justify-center overflow-auto border border-slate-800/80 p-4">
        <div 
          className="relative transition-transform duration-200 select-none flex items-center justify-center max-w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Main Packaging Container */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-950 flex items-center justify-center">
            {currentImage && (currentImage.startsWith('/uploads/') || currentImage.startsWith('blob:') || currentImage.startsWith('http')) ? (
              <img 
                src={currentImage} 
                alt="Packaging Face Scan" 
                className="max-h-[500px] w-auto object-contain block select-none"
              />
            ) : (
              <div className="w-[340px] h-[440px] flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                <ImageIcon className="w-10 h-10 text-slate-600" />
                <p className="text-xs">No image uploaded for this face</p>
              </div>
            )}

            {/* Bounding Box Overlays */}
            {faceFields.map(f => {
              if (!f.bbox) return null;
              const isSelected = selectedFieldKey === f.field_key;
              const hasViolation = violations.some(v => v.rule_code.includes(f.field_key.toUpperCase()) || (v.detected_evidence && v.detected_evidence.includes(f.extracted_value)));
              const isHitl = f.requires_human_verification && !f.is_verified_by_human;

              let borderClass = "border-emerald-400 bg-emerald-500/15 text-emerald-200";
              if (hasViolation) {
                borderClass = "border-red-500 bg-red-500/25 text-red-200 ring-2 ring-red-500/40 animate-pulse";
              } else if (isHitl) {
                borderClass = "border-amber-400 bg-amber-400/20 text-amber-200 ring-2 ring-amber-400/40";
              }

              return (
                <div
                  key={f.id || f.field_key}
                  onClick={() => onSelectField && onSelectField(f.field_key)}
                  className={`absolute border-2 rounded cursor-pointer transition-all ${borderClass} ${
                    isSelected ? 'ring-4 ring-amber-400 z-30 scale-105' : 'hover:scale-105 z-20'
                  }`}
                  style={{
                    left: `${f.bbox.x}%`,
                    top: `${f.bbox.y}%`,
                    width: `${f.bbox.w}%`,
                    height: `${f.bbox.h}%`
                  }}
                  title={`${f.field_label}: ${f.extracted_value || 'Missing'}`}
                >
                  <span className="absolute -top-4 left-0 px-1.5 py-0.2 bg-slate-950/90 border border-slate-700 rounded text-[9px] font-bold whitespace-nowrap shadow-lg">
                    {f.field_label.split(' ')[0]} ({Math.round(f.confidence * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400"></span>
            <span>Compliant Field</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-300"></span>
            <span>HITL Review Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-500 border border-red-400"></span>
            <span>Statutory Violation</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Click any box to inspect & edit in HITL panel</span>
      </div>
    </div>
  );
};
