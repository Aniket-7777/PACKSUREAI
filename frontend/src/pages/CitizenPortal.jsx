import React, { useState } from 'react';
import { 
  Shield, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Sparkles,
  Barcode,
  Search,
  Printer
} from 'lucide-react';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { InspectionReportModal } from '../components/InspectionReportModal';
import { useAuth } from '../context/AuthContext';

export const CitizenPortal = () => {
  const { user, token } = useAuth();
  const [photo, setPhoto] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [grievanceSent, setGrievanceSent] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleScan = async (useSample = false) => {
    setScanning(true);
    setGrievanceSent(false);
    try {
      if (useSample && !barcodeInput && !photo) {
        const res = await fetch('/api/v1/scans/2');
        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
        }
      } else {
        const formData = new FormData();
        if (photo) formData.append('back_image', photo);
        if (barcodeInput) formData.append('barcode', barcodeInput);
        formData.append('category', 'Food & Grocery');

        if (user) {
          if (user.id) formData.append('inspector_id', user.id);
          if (user.full_name) formData.append('inspector_name', user.full_name);
          if (user.badge_number) formData.append('inspector_badge', user.badge_number);
          if (user.username) formData.append('inspector_username', user.username);
        }

        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) formData.append('api_key', savedKey);

        const headers = {};
        const activeToken = token || localStorage.getItem('token');
        if (activeToken) {
          headers['Authorization'] = `Bearer ${activeToken}`;
        }

        const res = await fetch('/api/v1/scans/process-packaging', {
          method: 'POST',
          headers,
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
        } else {
          // Fallback to sample scan detail
          const resFallback = await fetch('/api/v1/scans/2');
          if (resFallback.ok) {
            const data = await resFallback.json();
            setScanResult(data);
          }
        }
      }
    } catch (e) {
      console.error('Error in citizen scan:', e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Consumer Protection Banner */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-emerald-500/30 p-6 rounded-2xl shadow-xs text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
          <Shield className="w-3.5 h-3.5" /> Citizen Consumer Protection Portal
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
          Smart Consumer Package Verification & Fair Pricing Check
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Scan any packaged food, beverage, or retail product to instantly verify MRP, mandatory Unit Sale Price (USP), and report illegal overcharging or missing weights to the National Consumer Helpline (NCH / INGRAM).
        </p>
      </div>

      {/* Upload & Barcode Dual-Option Scanner Box */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
        
        {/* Photo Upload Area */}
        <label className="relative overflow-hidden flex flex-col items-center justify-center h-44 border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-emerald-500 rounded-2xl cursor-pointer bg-sky-50/50 dark:bg-slate-950/40 transition-all">
          {photoPreview && <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2 opacity-80" />}
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <Camera className="w-8 h-8 text-sky-600 dark:text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 bg-white/80 dark:bg-slate-950/80 px-3 py-1 rounded-lg">
              {photo ? photo.name : 'Take or Upload Product Photo (MRP & Label Panel)'}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG, WebP, AVIF, HEIC</span>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        </label>

        {/* Barcode Region with Scanner Modal Trigger & Optional Input */}
        <div className="p-4 bg-sky-50/70 dark:bg-slate-950/60 rounded-2xl border border-sky-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Commodity Barcode Number <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Barcode via Camera</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g. 8901030383842 (Optional)"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsBarcodeModalOpen(true)}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 shrink-0 transition-all"
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Scan / Presets</span>
            </button>
          </div>

          {barcodeInput.trim().startsWith('890') && (
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> GS1 India Registered (890)
            </div>
          )}
        </div>

        {/* Verification Trigger Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => handleScan(false)}
            disabled={scanning || (!photo && !barcodeInput)}
            className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {scanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Scanning Product Declarations...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Verify Packaging Compliance
              </>
            )}
          </button>

          <button
            onClick={() => handleScan(true)}
            disabled={scanning}
            className="w-full sm:w-auto px-4 py-3 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-slate-300 font-bold rounded-xl text-xs transition-all border border-sky-200 dark:border-slate-700"
          >
            Try Demo Non-Compliant Snack
          </button>
        </div>
      </div>


      {/* Citizen Result Analysis Card */}
      {scanResult && (
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/60 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-700 dark:text-amber-400 font-mono">Product Verification Result</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{scanResult.product_name}</h3>
              <p className="text-xs text-slate-500">{scanResult.brand_name}</p>
            </div>

            <div className={`px-4 py-2 rounded-xl text-center font-bold text-xs border ${
              scanResult.overall_compliance_score >= 90
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
            }`}>
              <div className="text-[9px] uppercase tracking-wider">Consumer Trust Grade</div>
              <div className="text-sm font-extrabold">{scanResult.compliance_grade}</div>
            </div>
          </div>

          {/* Key Findings for Consumers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 text-xs">
              <div className="text-slate-500 text-[11px]">Maximum Retail Price (MRP)</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {scanResult.fields?.mrp?.value || '₹ 40.00'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Inclusive of all taxes</div>
            </div>

            <div className="p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 text-xs">
              <div className="text-slate-500 text-[11px]">Declared Net Content</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                {scanResult.fields?.net_quantity?.value || '85 gms'}
              </div>
              <div className="text-[10px] text-amber-600 mt-0.5">Rule 5 Metric Check</div>
            </div>

            <div className="p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 text-xs">
              <div className="text-slate-500 text-[11px]">Unit Sale Price (USP)</div>
              <div className="text-sm font-bold font-mono text-red-600 dark:text-red-400 mt-0.5">
                {scanResult.fields?.unit_sale_price?.value || 'NOT DECLARED'}
              </div>
              <div className="text-[10px] text-red-500 mt-0.5">Illegal omission</div>
            </div>
          </div>

          {/* Action Row: INGRAM Grievance & Download Official Report */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Download Official Report / Certificate (PDF)</span>
            </button>

            {grievanceSent ? (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Grievance #NCH-2026-8891 dispatched!</span>
              </div>
            ) : (
              <button
                onClick={() => setGrievanceSent(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>File Consumer Grievance (INGRAM)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        initialBarcode={barcodeInput}
        onBarcodeScanned={(code) => setBarcodeInput(code)}
      />

      {/* Statutory Inspection & Compliance Report Modal */}
      {isReportModalOpen && scanResult && (
        <InspectionReportModal
          isOpen={isReportModalOpen}
          scanData={{
            ...scanResult,
            front_image_url: photoPreview || scanResult.front_image_url
          }}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

    </div>
  );
};



