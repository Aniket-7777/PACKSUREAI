import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Sparkles,
  Zap,
  ArrowRight,
  HelpCircle,
  Scale,
  DollarSign,
  Search,
  FileText,
  BadgeAlert
} from 'lucide-react';

export const CustomerCommandCenter = () => {
  const { user, setIsHelpModalOpen } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [grievanceSent, setGrievanceSent] = useState(false);

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
      if (useSample || !photo) {
        const res = await fetch('/api/v1/scans/2');
        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
        } else {
          // Fallback sample
          setScanResult({
            id: 2,
            brand_name: 'Dabur India Ltd.',
            product_name: '100% Pure Honey 500g',
            mrp_declared: 245.0,
            unit_sale_price: '₹0.49 per g',
            net_quantity_declared: '500 g',
            compliance_status: 'NON_COMPLIANT',
            violations: [
              'Rule 21: Deceptive Slack Fill (38% non-functional void space)',
              'Rule 6(1)(da): Missing Unit Sale Price on secondary panel'
            ],
            confidence_score: 94.2
          });
        }
      } else {
        const formData = new FormData();
        formData.append('back_image', photo);
        formData.append('category', 'Food & Grocery');

        const res = await fetch('/api/v1/scans/process-packaging', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
        }
      }
    } catch (e) {
      console.error('Error in citizen scan:', e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. CONSUMER PROTECTION COMMAND BANNER */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Citizen Consumer Protection & Fair Trade Command
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                National Consumer Helpline (NCH / INGRAM Integrated)
              </span>
            </div>
            
            <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
              Verify Packaged Goods, Fair MRP & Consumer Rights
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Instantly audit any packaged retail item for mandatory Unit Sale Price (USP), hidden weight reductions (shrinkflation), deceptive slack fill, and dual MRP price gouging.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/citizen-portal"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <Camera className="w-4 h-4" />
              <span>Open Smart Scanner</span>
            </Link>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="flex items-center gap-1.5 bg-sky-100/80 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-sky-300 dark:border-slate-700 transition-all shadow-xs"
            >
              <Scale className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
              <span>Consumer Rights Guide</span>
            </button>
          </div>
        </div>

        {/* Consumer Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-sky-100 dark:border-slate-800">
          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Mandatory Unit Sale Price
            </div>
            <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
              ₹ per g / ml
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Required on all retail packs</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Max Permissible Error
            </div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
              &lt; 1.5%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Under Schedule II rules</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Deceptive Slack-Fill Limit
            </div>
            <div className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
              Max 30%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Empty package void volume</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              NCH Toll-Free Support
            </div>
            <div className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
              1800-11-4000
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Direct Consumer Helpline</div>
          </div>
        </div>
      </div>

      {/* 2. IMMEDIATE ACTION STATION ("WHAT ACTION TO TAKE NEXT") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Consumer Action Station • What to Do Next
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Empower yourself with Legal Metrology verification
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-emerald-500/30 hover:border-emerald-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Camera className="w-3 h-3" /> Step 1: Scan Package
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Instant AI</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Snap or Upload Product Label
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Take a quick photo of MRP, Net Quantity, and Manufacturer address to check for compliance violations.
              </p>
            </div>
            <Link
              to="/citizen-portal"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Launch Camera Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Action 2 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <BadgeAlert className="w-3 h-3" /> Step 2: Lodge Grievance
              </span>
              <span className="text-[10px] text-slate-400 font-mono">INGRAM / NCH</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Report Illegal Overcharging & Dual MRP
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Found a retailer charging above MRP or sticker tampering? File an instant report directly to Consumer Affairs.
              </p>
            </div>
            <a
              href="https://consumerhelpline.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Lodge INGRAM Complaint</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Action 3 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-sky-500/30 hover:border-sky-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Step 3: Know Your Rights
              </span>
              <span className="text-[10px] text-slate-400 font-mono">LMPC 2011</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Mandatory Declarations Checklist
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Learn the 7 mandatory items that every manufacturer must print by law under Rule 6(1).
              </p>
            </div>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>View Rights Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. RAPID PACKAGE VERIFICATION WIDGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Quick Scanner */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-500" />
              Instant Fair MRP & Package Verification Box
            </h3>
            <span className="text-[10px] text-slate-500">Multimodal Vision Active</span>
          </div>

          <label className="relative overflow-hidden flex flex-col items-center justify-center h-44 border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl cursor-pointer bg-sky-50/50 dark:bg-slate-950/40 transition-all">
            {photoPreview && <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2 opacity-80" />}
            <div className="relative z-10 flex flex-col items-center text-center p-4">
              <Camera className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 bg-white/80 dark:bg-slate-950/80 px-3 py-1 rounded-lg">
                {photo ? photo.name : 'Take or Upload Product Photo (MRP & Label Panel)'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG, WebP, AVIF, HEIC</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </label>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleScan(false)}
              disabled={scanning || !photo}
              className="w-full sm:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Scanning Product Declarations...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Verify Uploaded Photo
                </>
              )}
            </button>

            <button
              onClick={() => handleScan(true)}
              disabled={scanning}
              className="w-full sm:w-auto px-4 py-2.5 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs border border-sky-300 dark:border-slate-700 transition-all"
            >
              Try Sample Audit
            </button>
          </div>

          {/* Scan Results Card */}
          {scanResult && (
            <div className="p-4 bg-sky-50/70 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{scanResult.product_name}</h4>
                  <p className="text-[11px] text-slate-500">{scanResult.brand_name}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  scanResult.compliance_status === 'COMPLIANT'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                }`}>
                  {scanResult.compliance_status === 'COMPLIANT' ? '100% Compliant' : 'Non-Compliance Detected'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Declared MRP</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">₹{scanResult.mrp_declared || '245.00'}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Unit Sale Price</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{scanResult.unit_sale_price || '₹0.49 / g'}</div>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Net Quantity</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{scanResult.net_quantity_declared || '500 g'}</div>
                </div>
              </div>

              {scanResult.violations?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Flagged Discrepancies:
                  </span>
                  <ul className="space-y-1 text-[11px] text-rose-700 dark:text-rose-300">
                    {scanResult.violations.map((v, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6-Point Consumer Checklist */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            What to Look for on Every Pack
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <span><b>MRP (Inclusive of All Taxes)</b>: Never pay above the printed price.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <span><b>Unit Sale Price (USP)</b>: Check ₹ per g/ml to spot hidden shrinkflation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <span><b>Net Quantity</b>: Standard SI metric units (g, kg, ml, L).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
              <span><b>Manufacturer Address</b>: Must include complete city & pin code.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">5</span>
              <span><b>Customer Care Details</b>: Name, phone, email for consumer redressal.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">6</span>
              <span><b>Manufacturing / Expiry Date</b>: Month & Year must be visible.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
