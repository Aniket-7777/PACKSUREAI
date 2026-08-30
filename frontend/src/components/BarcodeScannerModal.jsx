import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, 
  Camera, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Zap, 
  Upload, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Package
} from 'lucide-react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

const SAMPLE_INDIAN_BARCODES = [
  { code: '8901030992147', name: "Haldiram's Lite Mixture (85g)", brand: "Haldiram's", cat: 'Snacks & Namkeen' },
  { code: '8901030383842', name: 'Tata Salt Vacuum Evaporated (1 kg)', brand: 'Tata Consumer', cat: 'Food & Grocery' },
  { code: '8901491101837', name: 'Maggi 2-Minute Masala Noodles (70g)', brand: 'Nestle India', cat: 'Instant Foods' },
  { code: '8901262010053', name: 'Amul Pasteurised Butter (500g)', brand: 'Amul Dairy', cat: 'Dairy & Spreads' },
  { code: '8901063012016', name: 'Britannia Good Day Butter Cookies (100g)', brand: 'Britannia', cat: 'Bakery & Biscuits' },
  { code: '8902579100124', name: 'Dabur 100% Pure Squeezy Honey (250g)', brand: 'Dabur India', cat: 'Food & Grocery' },
  { code: '8901030678237', name: 'Lipton Clear & Green Pure Light Tea (25 Bags)', brand: 'Lipton / Unilever', cat: 'Beverages' }
];

export const BarcodeScannerModal = ({ isOpen, onClose, onBarcodeScanned, initialBarcode = '' }) => {
  const [barcodeInput, setBarcodeInput] = useState(initialBarcode);
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual' | 'upload'
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    setBarcodeInput(initialBarcode);
    setLookupResult(null);
    if (initialBarcode && isOpen) {
      fetchBarcodeDetails(initialBarcode);
    }
  }, [initialBarcode, isOpen]);

  // Handle Camera Lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startZXingScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [isOpen, activeTab, facingMode]);

  // Synthesize Audio Beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // AudioContext might be blocked before user gesture
    }
  };

  const startZXingScanner = async () => {
    setCameraError('');
    setCameraActive(false);
    stopScanner();

    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const codeReader = new BrowserMultiFormatReader(hints, 300);
      codeReaderRef.current = codeReader;

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      if (videoRef.current) {
        setIsDecoding(true);
        codeReader.decodeFromConstraints(constraints, videoRef.current, (result, err) => {
          if (result) {
            const scannedText = result.getText();
            if (scannedText && scannedText.trim()) {
              handleSuccessfulScan(scannedText.trim());
            }
          }
        }).then(() => {
          setCameraActive(true);
          // Grab stream for torch support
          if (videoRef.current && videoRef.current.srcObject) {
            streamRef.current = videoRef.current.srcObject;
          }
        }).catch((err) => {
          console.warn('ZXing Camera Access Failed, fallback to native getUserMedia:', err);
          startNativeFallback();
        });
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      startNativeFallback();
    }
  };

  const startNativeFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        startNativeBarcodeLoop();
      }
    } catch (e) {
      setCameraError('Camera access unavailable or permission denied. You can manually enter or select a test barcode below.');
      setCameraActive(false);
    }
  };

  const startNativeBarcodeLoop = () => {
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
        });
        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                handleSuccessfulScan(barcodes[0].rawValue);
              }
            } catch (err) {}
          }
        }, 300);
      } catch (e) {}
    }
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {}
      codeReaderRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsDecoding(false);
  };

  const toggleTorch = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        const nextState = !torchOn;
        track.applyConstraints({ advanced: [{ torch: nextState }] })
          .then(() => setTorchOn(nextState))
          .catch(e => console.warn('Torch not supported:', e));
      }
    }
  };

  const handleSuccessfulScan = async (code) => {
    playBeep();
    setBarcodeInput(code);
    stopScanner();
    await fetchBarcodeDetails(code);
  };

  const fetchBarcodeDetails = async (code) => {
    if (!code) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/v1/scans/lookup-barcode/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResult(data.data || null);
      }
    } catch (e) {
      console.warn('Barcode registry fetch failed:', e);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleApplyBarcode = () => {
    if (onBarcodeScanned) {
      onBarcodeScanned(barcodeInput.trim(), lookupResult);
    }
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const codeReader = new BrowserMultiFormatReader();
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await codeReader.decodeFromImageElement(img);
            if (result && result.getText()) {
              handleSuccessfulScan(result.getText().trim());
              return;
            }
          } catch (zxingErr) {
            // If ZXing didn't catch, try native BarcodeDetector if available
            if ('BarcodeDetector' in window) {
              try {
                const detector = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'code_128', 'qr_code'] });
                const detected = await detector.detect(img);
                if (detected && detected.length > 0) {
                  handleSuccessfulScan(detected[0].rawValue);
                  return;
                }
              } catch (err) {}
            }
            alert('Could not decode a clear barcode in this photo. Please enter the EAN number manually or choose a preset.');
          }
        };
        img.src = event.target.result;
      } catch (err) {
        console.warn('Upload decode error:', err);
      }
    };
    reader.readAsDataURL(file);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between bg-sky-50/70 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>GS1 / EAN-13 Barcode Scanner</span>
                <span className="text-[9px] font-extrabold bg-sky-100 dark:bg-amber-500/10 text-sky-800 dark:text-amber-400 border border-sky-200 dark:border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                  Optical HUD
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan commodity packaging barcode or enter 13-digit EAN code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Camera Scanner / Manual Input / Image Upload) */}
        <div className="flex border-b border-sky-100 dark:border-slate-800 bg-sky-50/30 dark:bg-slate-950/40 p-1.5 gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-amber-400 shadow-xs font-bold border border-sky-200 dark:border-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-amber-400 shadow-xs font-bold border border-sky-200 dark:border-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Manual & Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-sky-700 dark:text-amber-400 shadow-xs font-bold border border-sky-200 dark:border-slate-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: LIVE CAMERA VIEW */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-video sm:aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-sky-200 dark:border-slate-800 flex items-center justify-center">
                
                {/* Video Viewport */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* Laser Scanning Overlay HUD */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Viewfinder Reticle */}
                    <div className="relative w-64 h-36 border-2 border-emerald-400/90 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center">
                      {/* Red Laser Sweep Line */}
                      <div className="absolute w-full h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></div>
                      <div className="text-[10px] font-mono text-emerald-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded-full absolute -top-3">
                        ALIGN BARCODE IN FRAME
                      </div>
                      
                      {/* Corner Target Markers */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br"></div>
                    </div>
                  </div>
                )}

                {/* Fallback / Camera Error state */}
                {!cameraActive && (
                  <div className="p-6 text-center space-y-2 text-slate-400">
                    <Camera className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="text-xs">{cameraError || 'Initializing Camera Feed...'}</p>
                    <button
                      type="button"
                      onClick={startZXingScanner}
                      className="px-3 py-1 bg-sky-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Try Again
                    </button>

                  </div>
                )}

                {/* Camera Top Controls Toolbar */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition-all text-xs"
                    title={soundEnabled ? 'Mute Beep' : 'Enable Beep'}
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                    className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition-all text-xs"
                    title="Flip Camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleTorch}
                    className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition-all text-xs"
                    title="Toggle Flashlight"
                  >
                    <Zap className={`w-3.5 h-3.5 ${torchOn ? 'text-amber-400' : 'text-slate-400'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD PHOTO VIEW */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-sky-50/50 dark:bg-slate-950/40 transition-all text-center">
                <Upload className="w-8 h-8 text-sky-600 dark:text-amber-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Upload Package Photo Containing Barcode
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports JPEG, PNG, WebP, AVIF, HEIC packaging snapshots
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* SHARED INPUT: Manual Input & Registry Status */}
          <div className="space-y-2 pt-2 border-t border-sky-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Scanned / Entered Barcode Number <span className="text-[10px] font-normal text-slate-500">(Optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => {
                    setBarcodeInput(e.target.value);
                    setLookupResult(null);
                  }}
                  placeholder="e.g. 8901030383842"
                  className="w-full pl-9 pr-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={() => fetchBarcodeDetails(barcodeInput.trim())}
                disabled={lookupLoading || !barcodeInput.trim()}
                className="py-2 px-3 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-sky-300 dark:border-slate-700 text-sky-800 dark:text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{lookupLoading ? 'Querying...' : 'Verify GS1'}</span>
              </button>
            </div>

            {/* GS1 India Indicator */}
            {barcodeInput.trim().startsWith('890') && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verified GS1 India Prefix (890) • Registered National Commodity</span>
              </div>
            )}
          </div>

          {/* Quick 1-Click FMCG Presets */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              1-Click Standard FMCG Barcode Presets
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SAMPLE_INDIAN_BARCODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSuccessfulScan(item.code)}
                  className="p-2 rounded-xl text-left bg-sky-50/50 hover:bg-sky-100 dark:bg-slate-950/60 dark:hover:bg-slate-800 border border-sky-200 dark:border-slate-800 transition-all flex items-center justify-between text-xs group"
                >
                  <div className="overflow-hidden">
                    <div className="font-bold text-[11px] text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-amber-400">
                      {item.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {item.code}
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-600 dark:text-amber-400 font-bold ml-1 shrink-0">
                    Use →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Registry Lookup Result Card */}
          {lookupResult && (
            <div className="p-3 bg-white dark:bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-1.5 text-xs animate-in fade-in duration-100 shadow-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GS1 Registry Matched
                </span>
                <span className="font-mono text-[10px] text-slate-400 uppercase">
                  Source: {lookupResult.source || 'OpenFoodFacts'}
                </span>
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {lookupResult.product || lookupResult.brand}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div>Brand: <b>{lookupResult.brand || 'N/A'}</b></div>
                <div>Net Qty: <b>{lookupResult.net_quantity || 'N/A'}</b></div>
                <div className="col-span-2 truncate">Origin: <b>{lookupResult.country_of_origin || 'Made in India'}</b></div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-sky-100 dark:border-slate-800 flex items-center justify-between bg-sky-50/40 dark:bg-slate-950/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApplyBarcode}
            disabled={!barcodeInput.trim()}
            className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Barcode to Audit</span>
          </button>
        </div>

      </div>
    </div>
  );
};
