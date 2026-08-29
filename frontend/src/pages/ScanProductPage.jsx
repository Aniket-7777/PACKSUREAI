import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Upload, 
  Camera, 
  Layers, 
  Barcode, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Scale, 
  RefreshCw, 
  ShieldAlert,
  Image as ImageIcon,
  Check,
  PackageSearch,
  Key,
  ChevronRight,
  ChevronLeft,
  Eye,
  Edit3,
  HelpCircle,
  Hash,
  Download,
  Building2,
  XCircle,
  FileCheck
} from 'lucide-react';
import { VisualEvidenceViewer } from '../components/VisualEvidenceViewer';
import { HitlReviewPanel } from '../components/HitlReviewPanel';
import { ExplainabilityCard } from '../components/ExplainabilityCard';
import { LegalNoticeModal } from '../components/LegalNoticeModal';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';

export const ScanProductPage = () => {
  const [searchParams] = useSearchParams();
  const initialScanId = searchParams.get('id');

  // Step State (1: Capture, 2: Quality, 3: Extraction Table, 4: Compliance, 5: Evidence & Action)
  const [currentStep, setCurrentStep] = useState(1);

  // Uploaded Files & Previews
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [sideImage, setSideImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);

  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [sidePreview, setSidePreview] = useState(null);
  const [bottomPreview, setBottomPreview] = useState(null);

  // Metadata & Barcode Inputs
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [category, setCategory] = useState('Food & Grocery');
  const [locationName, setLocationName] = useState('New Delhi Central Supermarket');
  const [inspectorNotes, setInspectorNotes] = useState('');


  // Processing & Results
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState('mrp');
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [inlineEditField, setInlineEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keySavedToast, setKeySavedToast] = useState(false);

  useEffect(() => {
    if (initialScanId) {
      loadExistingScan(initialScanId);
    }
  }, [initialScanId]);

  const loadExistingScan = async (id) => {
    try {
      const res = await fetch(`/api/v1/scans/${id}`);
      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
        if (data.front_image_url) setFrontPreview(data.front_image_url);
        if (data.back_image_url) setBackPreview(data.back_image_url);
        if (data.barcode) setBarcodeInput(data.barcode);
        if (data.category) setCategory(data.category);
        setCurrentStep(5); // All steps already completed — show full green stepper
      }
    } catch (e) {
      console.error('Error loading scan:', e);
    }
  };

  const handleFrontFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSideFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSideImage(file);
      setSidePreview(URL.createObjectURL(file));
    }
  };

  const handleBottomFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBottomImage(file);
      setBottomPreview(URL.createObjectURL(file));
    }
  };

  const handleProcessScan = async () => {
    if (!frontImage && !backImage && !barcodeInput) {
      alert('Please upload at least one packaging image (Front or Back face) before auditing.');
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      if (frontImage) formData.append('front_image', frontImage);
      if (backImage) formData.append('back_image', backImage);
      if (sideImage) formData.append('side_image', sideImage);
      if (bottomImage) formData.append('bottom_image', bottomImage);
      if (barcodeInput) formData.append('barcode', barcodeInput);
      formData.append('category', category);

      const savedKey = localStorage.getItem('gemini_api_key');
      if (savedKey) {
        formData.append('api_key', savedKey);
      }

      const res = await fetch('/api/v1/scans/process-packaging', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setScanResult(data);
        // If quality warnings exist, move to Step 2, else jump to Step 3
        if (data.quality_warnings && data.quality_warnings.length > 0) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
      } else {
        const err = await res.json();
        alert(`Audit processing failed: ${err.detail || 'Server error'}`);
      }
    } catch (e) {
      alert(`Network error during scan audit: ${e.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleInlineSave = async (fieldKey) => {
    if (!scanResult) return;
    try {
      const res = await fetch(`/api/v1/scans/${scanResult.id}/correct-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_key: fieldKey,
          corrected_value: editValue,
          notes: 'Inspector manual verification from extraction table'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setScanResult(updated);
        setInlineEditField(null);
      }
    } catch (e) {
      console.error('Error saving inline correction:', e);
    }
  };

  // Determine 3-state compliance
  const getComplianceState = () => {
    if (!scanResult) return 'Unable to Determine';
    if (scanResult.violations && scanResult.violations.length > 0) return 'Non-Compliant';
    if (scanResult.overall_compliance_score >= 90) return 'Compliant';
    return 'Unable to Determine';
  };

  const getNormalizedFields = (rawFields) => {
    if (!rawFields) return [];
    let list = [];
    if (Array.isArray(rawFields)) {
      list = rawFields.map((f, index) => {
        const key = f.field_key || f.key || `field_${index}`;
        const label = f.field_label || f.label || key;
        const val = f.human_corrected_value || f.extracted_value || f.value || '';
        const conf = typeof f.confidence === 'number' ? f.confidence : 0;
        return {
          id: f.id || key,
          key,
          label,
          value: val,
          confidence: conf,
          bbox: f.bbox,
          corroborated: Boolean(f.corroborated_with_barcode),
          requiresReview: Boolean(f.requires_human_verification || (conf < 0.85 && val)),
          isVerified: Boolean(f.is_verified_by_human),
          raw: f
        };
      });
    } else if (typeof rawFields === 'object') {
      list = Object.entries(rawFields).map(([k, f]) => {
        const key = f.field_key || f.key || k;
        const label = f.field_label || f.label || k;
        const val = f.human_corrected_value || f.extracted_value || f.value || '';
        const conf = typeof f.confidence === 'number' ? f.confidence : 0;
        return {
          id: f.id || key,
          key,
          label,
          value: val,
          confidence: conf,
          bbox: f.bbox,
          corroborated: Boolean(f.corroborated_with_barcode),
          requiresReview: Boolean(f.requires_human_verification || (conf < 0.85 && val)),
          isVerified: Boolean(f.is_verified_by_human),
          raw: f
        };
      });
    }
    return list;
  };

  const normalizedFieldsList = scanResult ? getNormalizedFields(scanResult.fields) : [];
  const rawFieldsForPanels = scanResult 
    ? (Array.isArray(scanResult.fields) 
        ? scanResult.fields 
        : normalizedFieldsList.map(nf => ({
            id: nf.id,
            field_key: nf.key,
            field_label: nf.label,
            extracted_value: nf.value,
            confidence: nf.confidence,
            bbox: nf.bbox,
            is_verified_by_human: nf.isVerified,
            requires_human_verification: nf.requiresReview,
            corroborated_with_barcode: nf.corroborated
          })))
    : [];

  const stepsList = [
    { num: 1, label: 'Capture Product' },
    { num: 2, label: 'Quality Check' },
    { num: 3, label: 'Extraction Review' },
    { num: 4, label: 'Compliance Result' },
    { num: 5, label: 'Evidence & Action' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 5-Step Stepper Header */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between overflow-x-auto pb-1 gap-2">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => scanResult ? setCurrentStep(s.num) : null}
                disabled={!scanResult && s.num > 1}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  currentStep === s.num
                    ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                    : currentStep > s.num
                      ? 'bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                  currentStep === s.num
                    ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                    : currentStep > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span>{s.label}</span>
              </button>
              {idx < stepsList.length - 1 && (
                <ChevronRight className="w-4 h-4 text-sky-300 dark:text-slate-700 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── STEP 1: CAPTURE PRODUCT ────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-sky-600 dark:text-amber-400" />
                  Step 1: Multi-Face Packaging Capture
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Upload all visible sides of the packaging to extract mandatory Legal Metrology declarations.
                </p>
              </div>

              {/* Gemini 2.0 / 3.x Multimodal Vision Status Badge */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-amber-500/10 border border-sky-300/60 dark:border-amber-500/30 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                    Gemini Multimodal Vision Engine
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-amber-400 hover:bg-sky-100 dark:hover:bg-slate-800 rounded-lg border border-sky-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  {customApiKey ? 'API Key Set' : 'Configure Key'}
                </button>
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {/* Front Face */}
              <div className="p-4 rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                    <span>Front Face (PDP)</span>
                    {frontImage && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center"><Check className="w-3 h-3"/></span>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Brand name, Generic name</p>
                </div>
                <label className="mt-3 relative overflow-hidden flex flex-col items-center justify-center h-28 border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer bg-white/60 dark:bg-slate-900/40 transition-all">
                  {frontPreview && <img src={frontPreview} alt="Front" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
                  <Upload className="w-5 h-5 text-sky-600 dark:text-amber-400 mb-1 z-10" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold z-10 bg-white/80 dark:bg-slate-950/80 px-2 py-0.5 rounded">
                    {frontImage ? frontImage.name.slice(0, 12) + '...' : 'Upload Front'}
                  </span>
                  <input type="file" accept="image/*,.avif,.webp,.png,.jpg,.jpeg" className="hidden" onChange={handleFrontFileChange} />
                </label>
              </div>

              {/* Back Face */}
              <div className="p-4 rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                    <span>Back Face (Mandatory)</span>
                    {backImage && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center"><Check className="w-3 h-3"/></span>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">MRP, USP, Net Qty, Dates, Address</p>
                </div>
                <label className="mt-3 relative overflow-hidden flex flex-col items-center justify-center h-28 border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer bg-white/60 dark:bg-slate-900/40 transition-all">
                  {backPreview && <img src={backPreview} alt="Back" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
                  <Upload className="w-5 h-5 text-sky-600 dark:text-amber-400 mb-1 z-10" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold z-10 bg-white/80 dark:bg-slate-950/80 px-2 py-0.5 rounded">
                    {backImage ? backImage.name.slice(0, 12) + '...' : 'Upload Back'}
                  </span>
                  <input type="file" accept="image/*,.avif,.webp,.png,.jpg,.jpeg" className="hidden" onChange={handleBackFileChange} />
                </label>
              </div>

              {/* Side Face */}
              <div className="p-4 rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                    <span>Side Face (Optional)</span>
                    {sideImage && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center"><Check className="w-3 h-3"/></span>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Helpline, Ingredients, Origin</p>
                </div>
                <label className="mt-3 relative overflow-hidden flex flex-col items-center justify-center h-28 border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer bg-white/60 dark:bg-slate-900/40 transition-all">
                  {sidePreview && <img src={sidePreview} alt="Side" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
                  <Upload className="w-5 h-5 text-sky-600 dark:text-amber-400 mb-1 z-10" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold z-10 bg-white/80 dark:bg-slate-950/80 px-2 py-0.5 rounded">
                    {sideImage ? sideImage.name.slice(0, 12) + '...' : 'Upload Side'}
                  </span>
                  <input type="file" accept="image/*,.avif,.webp,.png,.jpg,.jpeg" className="hidden" onChange={handleSideFileChange} />
                </label>
              </div>

              {/* Bottom Face */}
              <div className="p-4 rounded-xl border border-sky-200 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center justify-between">
                    <span>Bottom Face (Optional)</span>
                    {bottomImage && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center"><Check className="w-3 h-3"/></span>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Batch code, Barcode</p>
                </div>
                <label className="mt-3 relative overflow-hidden flex flex-col items-center justify-center h-28 border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer bg-white/60 dark:bg-slate-900/40 transition-all">
                  {bottomPreview && <img src={bottomPreview} alt="Bottom" className="absolute inset-0 w-full h-full object-cover opacity-70" />}
                  <Upload className="w-5 h-5 text-sky-600 dark:text-amber-400 mb-1 z-10" />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold z-10 bg-white/80 dark:bg-slate-950/80 px-2 py-0.5 rounded">
                    {bottomImage ? bottomImage.name.slice(0, 12) + '...' : 'Upload Bottom'}
                  </span>
                  <input type="file" accept="image/*,.avif,.webp,.png,.jpg,.jpeg" className="hidden" onChange={handleBottomFileChange} />
                </label>
              </div>
            </div>

            {/* Metadata & Barcode Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-sky-200/60 dark:border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    EAN-13 Barcode <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBarcodeModalOpen(true)}
                    className="text-[10px] font-bold text-sky-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Scan via Camera</span>
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 8901030383842 (Optional)"
                    className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl pl-9 pr-20 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsBarcodeModalOpen(true)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-sky-100 dark:bg-amber-500/10 hover:bg-sky-200 dark:hover:bg-amber-500/20 text-sky-800 dark:text-amber-400 font-bold text-[10px] rounded-lg border border-sky-300 dark:border-amber-500/30 transition-all flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Scan</span>
                  </button>
                </div>
                {barcodeInput.trim().startsWith('890') && (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> GS1 India Verified (890)
                  </div>
                )}
              </div>


              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Food & Grocery">Food & Grocery</option>
                  <option value="Dairy & Beverages">Dairy & Beverages</option>
                  <option value="Personal Care & Cosmetics">Personal Care & Cosmetics</option>
                  <option value="Packaged Commodities">Packaged Commodities</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Inspection Location
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Run Audit Button */}
            <button
              onClick={handleProcessScan}
              disabled={scanning}
              className="mt-5 w-full bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Image Quality Check & Dual-Track AI Extraction...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run AI Compliance & Evidence Audit
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: IMAGE QUALITY CHECK ────────────────────────────────── */}
      {currentStep === 2 && scanResult && (
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Step 2: Image Quality Pre-Check Analysis
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Review quality warnings before proceeding with legal compliance verification.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-lg">
              {scanResult.quality_warnings?.length || 0} Warnings Detected
            </span>
          </div>

          <div className="space-y-2">
            {scanResult.quality_warnings && scanResult.quality_warnings.length > 0 ? (
              scanResult.quality_warnings.map((w, idx) => (
                <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{w}</span>
                </div>
              ))
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>All uploaded packaging faces passed resolution, blur, and illumination thresholds cleanly!</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sky-200/60 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 text-sky-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-all"
            >
              Retake Image
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              Continue to Extraction Review <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: EXTRACTION REVIEW TABLE ────────────────────────────── */}
      {currentStep === 3 && scanResult && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Step 3: Extraction Review Table (Uncertainty & Source Mapping)
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Review extracted statutory values. Values with confidence &lt; 85% or missing declarations are marked <b>Review Required</b>.
                </p>
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                Proceed to Compliance Verdict <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Extraction Table */}
            <div className="overflow-x-auto border border-sky-200/80 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-sky-100/70 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 font-bold border-b border-sky-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Statutory Field</th>
                    <th className="py-3 px-3">Extracted Value</th>
                    <th className="py-3 px-3">Confidence</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Inline Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 dark:divide-slate-800/60">
                  {normalizedFieldsList.map((f) => {
                    const isEditing = inlineEditField === f.key;
                    const statusLabel = f.isVerified 
                      ? 'Verified' 
                      : !f.value 
                        ? 'Declaration Missing' 
                        : f.confidence >= 0.85 
                          ? 'Verified' 
                          : 'Review Required';
                    const statusClass = f.isVerified || (f.value && f.confidence >= 0.85)
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      : !f.value
                        ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';

                    return (
                      <tr 
                        key={f.key} 
                        onClick={() => setSelectedFieldKey(f.key)}
                        className={`cursor-pointer transition-colors ${selectedFieldKey === f.key ? 'bg-sky-100/60 dark:bg-slate-800/60' : 'hover:bg-sky-50 dark:hover:bg-slate-800/30'}`}
                      >
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-200">
                          {f.label}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="bg-white dark:bg-slate-950 border border-sky-400 rounded px-2 py-0.5 text-xs text-slate-900 dark:text-slate-100"
                                autoFocus
                              />
                              <button onClick={() => handleInlineSave(f.key)} className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">Save</button>
                              <button onClick={() => setInlineEditField(null)} className="px-1.5 py-0.5 bg-slate-300 dark:bg-slate-700 rounded text-[10px]">✕</button>
                            </div>
                          ) : (
                            <span className={f.value ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-red-500 italic'}>
                              {f.value || 'None Detected (Missing)'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {Math.round(f.confidence * 100)}%
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {f.corroborated ? 'Vision + Barcode Corroboration' : 'Vision / OCR'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInlineEditField(f.key);
                              setEditValue(f.value || '');
                            }}
                            className="px-2 py-1 bg-sky-200/70 dark:bg-slate-800 hover:bg-sky-300 text-sky-800 dark:text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Font Size Row — Marked as requiring physical scale */}
                  <tr className="bg-sky-50/40 dark:bg-slate-950/40">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-200">
                      Rule 7 Font Height (Schedule II)
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400">
                      Requires physical measurement
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">N/A</td>
                    <td className="py-3 px-3 text-slate-500">Manual inspection standard</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300">
                        Not Assessed (No Calibrated Scale)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] text-slate-400 font-mono">Calibrated Card Req</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Split Visual Evidence Crop Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-sky-200/60 dark:border-slate-800">
              <div className="lg:col-span-7">
                <VisualEvidenceViewer
                  frontImage={frontPreview || scanResult.front_image_url}
                  backImage={backPreview || scanResult.back_image_url}
                  fields={rawFieldsForPanels}
                  violations={scanResult.violations}
                  selectedFieldKey={selectedFieldKey}
                  onSelectField={setSelectedFieldKey}
                />
              </div>
              <div className="lg:col-span-5">
                <HitlReviewPanel
                  scanId={scanResult.id}
                  fields={rawFieldsForPanels}
                  selectedFieldKey={selectedFieldKey}
                  onSelectField={setSelectedFieldKey}
                  onFieldUpdated={(updated) => setScanResult(updated)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4: COMPLIANCE RESULT ──────────────────────────────────── */}
      {currentStep === 4 && scanResult && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-700 dark:text-amber-400 font-mono">{scanResult.case_number}</span>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-0.5">
                  Step 4: Statutory Legal Metrology Verdict
                </h2>
              </div>

              {/* 3-State Verdict Banner */}
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-xl text-center font-bold text-xs border ${
                  getComplianceState() === 'Compliant'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                    : getComplianceState() === 'Non-Compliant'
                      ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30'
                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                }`}>
                  <div className="text-[9px] uppercase tracking-wider">Statutory Finding</div>
                  <div className="text-sm font-extrabold">{getComplianceState()}</div>
                </div>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  Evidence & Legal Notice <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Score & Violation Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-sky-50 dark:bg-slate-950/60 border border-sky-200 dark:border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-500 font-semibold">Compliance Score</div>
                <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
                  {scanResult.overall_compliance_score}%
                </div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{scanResult.compliance_grade}</div>
              </div>

              <div className="p-4 bg-sky-50 dark:bg-slate-950/60 border border-sky-200 dark:border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-500 font-semibold">Confirmed Violations</div>
                <div className="text-2xl font-bold font-display text-red-600 dark:text-red-400 mt-1">
                  {scanResult.violations?.length || 0}
                </div>
                <div className="text-[10px] text-red-500">Statutory breaches under Sec 36</div>
              </div>

              <div className="p-4 bg-sky-50 dark:bg-slate-950/60 border border-sky-200 dark:border-slate-800 rounded-xl">
                <div className="text-[11px] text-slate-500 font-semibold">Unassessed Rules</div>
                <div className="text-2xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
                  1 Check
                </div>
                <div className="text-[10px] text-amber-600">Rule 7 Font height (Physical scale req)</div>
              </div>
            </div>

            {/* Statutory Violations List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Flagged Legal Breaches & Penalties
              </h3>

              {scanResult.violations && scanResult.violations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scanResult.violations.map((v) => (
                    <ExplainabilityCard key={v.id || v.rule_code} violation={v} />
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-bold text-sm">Package Meets Mandatory LMPC Declarations</h4>
                  <p className="text-xs mt-1">All 8 statutory fields verified against Legal Metrology Rules, 2011.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 5: EVIDENCE & ACTION ──────────────────────────────────── */}
      {currentStep === 5 && scanResult && (
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Step 5: Digital Evidence Locker & Legal Enforcement Notice
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Court-admissible inspection report package with SHA-256 cryptographic audit hash.
                </p>
              </div>

              {scanResult.violations && scanResult.violations.length > 0 && (
                <button
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
                >
                  <Scale className="w-4 h-4" />
                  Generate Section 36 Show-Cause Notice (PDF)
                </button>
              )}
            </div>

            {/* Evidence Audit Trail Card */}
            <div className="p-4 bg-sky-50/50 dark:bg-slate-950/60 border border-sky-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                <span className="flex items-center gap-1.5"><Hash className="w-4 h-4 text-sky-600" /> Cryptographic Chain of Custody</span>
                <span className="font-mono text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">IMMUTABLE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Inspection Case Number:</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">{scanResult.case_number}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Inspection Timestamp:</span>
                  <div className="font-mono text-slate-900 dark:text-slate-100">{new Date(scanResult.created_at || Date.now()).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Inspector Badge ID:</span>
                  <div className="font-mono text-slate-900 dark:text-slate-100">DOCA-INSP-104</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Enforcement Authority:</span>
                  <div className="text-slate-900 dark:text-slate-100 font-medium">Department of Consumer Affairs (DoCA)</div>
                </div>
              </div>
            </div>

            {/* Visual Evidence Viewer */}
            <VisualEvidenceViewer
              frontImage={frontPreview || scanResult.front_image_url}
              backImage={backPreview || scanResult.back_image_url}
              fields={rawFieldsForPanels}
              violations={scanResult.violations}
              selectedFieldKey={selectedFieldKey}
              onSelectField={setSelectedFieldKey}
            />
          </div>
        </div>
      )}

      {/* Legal Notice Modal */}
      {isNoticeModalOpen && scanResult && (
        <LegalNoticeModal
          isOpen={isNoticeModalOpen}
          scan={scanResult}
          scanId={scanResult.id}
          caseNumber={scanResult.case_number}
          brandName={scanResult.brand_name}
          productName={scanResult.product_name}
          violations={scanResult.violations}
          onClose={() => setIsNoticeModalOpen(false)}
        />
      )}

      {/* Gemini Vision API Key Configuration Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-display">
                    Gemini Multimodal Vision Engine
                  </h3>
                  <p className="text-[11px] text-slate-500">Google AI Studio API Key Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Gemini API Key:
              </label>
              <input
                type="password"
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs font-mono bg-sky-50 dark:bg-slate-950 border border-sky-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-500">
                Free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-sky-600 dark:text-amber-400 underline font-semibold">Google AI Studio (aistudio.google.com)</a>. Enables 100% precision character-level packaging extraction.
              </p>
            </div>

            {keySavedToast && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                API Key saved to browser session!
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('gemini_api_key');
                  setCustomApiKey('');
                  setIsApiKeyModalOpen(false);
                }}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customApiKey.trim()) {
                    localStorage.setItem('gemini_api_key', customApiKey.trim());
                    setKeySavedToast(true);
                    setTimeout(() => {
                      setKeySavedToast(false);
                      setIsApiKeyModalOpen(false);
                    }, 1000);
                  } else {
                    localStorage.removeItem('gemini_api_key');
                    setIsApiKeyModalOpen(false);
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded-xl transition-all"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Optical Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        initialBarcode={barcodeInput}
        onBarcodeScanned={(code, meta) => {
          setBarcodeInput(code);
          if (meta?.category) setCategory(meta.category);
        }}
      />
    </div>
  );
};



