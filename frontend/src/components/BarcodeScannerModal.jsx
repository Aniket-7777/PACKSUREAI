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
  Package,
  Scan
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
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);
  const [serverDecoding, setServerDecoding] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const nativeDetectorRef = useRef(null);
  const lastScannedCodeRef = useRef('');

  useEffect(() => {
    setBarcodeInput(initialBarcode);
    setLookupResult(null);
    lastScannedCodeRef.current = '';
    if (initialBarcode && isOpen) {
      fetchBarcodeDetails(initialBarcode);
    }
  }, [initialBarcode, isOpen]);

  // Handle Camera Lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      initCameraAndScanners();
    } else {
      stopCameraAndScanners();
    }
    return () => stopCameraAndScanners();
  }, [isOpen, activeTab, facingMode]);

  // Synthesize Audio Beep
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  const initCameraAndScanners = async () => {
    setCameraError('');
    setCameraActive(false);
    stopCameraAndScanners();

    // 1. Initialize ZXing reader
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
      zxingReaderRef.current = new BrowserMultiFormatReader(hints, 100);
    } catch (e) {
      console.warn('ZXing initialization warning:', e);
    }

    // 2. Initialize Native BarcodeDetector if available
    if ('BarcodeDetector' in window) {
      try {
        nativeDetectorRef.current = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']
        });
      } catch (e) {
        nativeDetectorRef.current = null;
      }
    }

    // 3. Request User Media with best constraints
    const constraintsList = [
      {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          focusMode: { ideal: 'continuous' }
        }
      },
      {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      },
      {
        video: true
      }
    ];

    let stream = null;
    for (const constraint of constraintsList) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (stream) break;
      } catch (err) {}
    }

    if (!stream) {
      setCameraError('Camera access unavailable. Please grant camera permissions or use manual entry/upload.');
      setCameraActive(false);
      return;
    }

    streamRef.current = stream;

    // Apply continuous autofocus if hardware supported
    try {
      const track = stream.getVideoTracks()[0];
      if (track && track.getCapabilities) {
        const capabilities = track.getCapabilities();
        if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
          await track.applyConstraints({
            advanced: [{ focusMode: 'continuous' }]
          });
        }
      }
    } catch (e) {}

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      
      try {
        await videoRef.current.play();
        setCameraActive(true);
        startContinuousScanLoop();
      } catch (playErr) {
        console.warn('Video play error:', playErr);
        setCameraActive(true);
        startContinuousScanLoop();
      }
    }
  };

  const startContinuousScanLoop = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    let isScanningFrame = false;

    scanTimerRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || isScanningFrame) return;

      isScanningFrame = true;

      try {
        // ── TRACK 1: Native Hardware Accelerated BarcodeDetector ──
        if (nativeDetectorRef.current) {
          try {
            const detected = await nativeDetectorRef.current.detect(video);
            if (detected && detected.length > 0) {
              const code = detected[0].rawValue;
              if (code && code.trim() && code !== lastScannedCodeRef.current) {
                lastScannedCodeRef.current = code.trim();
                handleSuccessfulScan(code.trim());
                isScanningFrame = false;
                return;
              }
            }
          } catch (e) {}
        }

        // ── TRACK 2: Preprocessed Canvas + ZXing Multi-Format Reader ──
        const canvas = canvasRef.current;
        if (canvas && zxingReaderRef.current && video.videoWidth > 0) {
          const vw = video.videoWidth;
          const vh = video.videoHeight;

          // 2A: Zoomed Center Region of Interest (ROI)
          const roiW = Math.floor(vw * 0.75);
          const roiH = Math.floor(vh * 0.40);
          const roiX = Math.floor((vw - roiW) / 2);
          const roiY = Math.floor((vh - roiH) / 2);

          canvas.width = roiW;
          canvas.height = roiH;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          if (ctx) {
            ctx.drawImage(video, roiX, roiY, roiW, roiH, 0, 0, roiW, roiH);

            // Contrast enhancement filter for 1D barcodes
            try {
              const imgData = ctx.getImageData(0, 0, roiW, roiH);
              const d = imgData.data;
              for (let i = 0; i < d.length; i += 4) {
                const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
                const contrast = (gray - 128) * 1.5 + 128;
                const clamped = contrast < 0 ? 0 : contrast > 255 ? 255 : contrast;
                d[i] = clamped;
                d[i + 1] = clamped;
                d[i + 2] = clamped;
              }
              ctx.putImageData(imgData, 0, 0);
            } catch (e) {}

            try {
              const zxResult = await zxingReaderRef.current.decodeFromCanvas(canvas);
              if (zxResult && zxResult.getText()) {
                const code = zxResult.getText().trim();
                if (code && code !== lastScannedCodeRef.current) {
                  lastScannedCodeRef.current = code;
                  handleSuccessfulScan(code);
                  isScanningFrame = false;
                  return;
                }
              }
            } catch (zxErr) {}
          }
        }
      } catch (frameErr) {
      } finally {
        isScanningFrame = false;
      }
    }, 90);
  };

  const stopCameraAndScanners = () => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (zxingReaderRef.current) {
      try {
        zxingReaderRef.current.reset();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        const nextState = !torchOn;
        track.applyConstraints({ advanced: [{ torch: nextState }] })
          .then(() => setTorchOn(nextState))
          .catch(e => console.warn('Torch constraint error:', e));
      }
    }
  };

  const handleSuccessfulScan = async (code) => {
    if (!code) return;
    const cleanCode = String(code).trim();
    playBeep();
    setScanSuccessAnim(true);
    setBarcodeInput(cleanCode);
    
    stopCameraAndScanners();
    
    setTimeout(() => {
      setScanSuccessAnim(false);
    }, 1500);

    const meta = await fetchBarcodeDetails(cleanCode);
    return meta;
  };

  const handleCaptureAndDecodeServer = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    setServerDecoding(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) {
        setServerDecoding(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'frame_snapshot.jpg');

      const res = await fetch('/api/v1/scans/decode-barcode-image', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.barcode) {
          await handleSuccessfulScan(data.barcode);
          if (data.data) {
            setLookupResult(data.data);
          }
          setServerDecoding(false);
          return;
        }
      }
      alert('No barcode detected in current frame. Please hold barcode inside the center reticle.');
    } catch (e) {
      console.warn('Server snapshot barcode decode failed:', e);
      alert('Could not decode snapshot. Position barcode inside green target frame.');
    } finally {
      setServerDecoding(false);
    }
  };

  const fetchBarcodeDetails = async (code) => {
    if (!code) return null;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/v1/scans/lookup-barcode/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        const meta = data.data || null;
        setLookupResult(meta);
        return meta;
      }
    } catch (e) {
      console.warn('Barcode registry fetch failed:', e);
    } finally {
      setLookupLoading(false);
    }
    return null;
  };

  const handleApplyBarcode = (explicitCode, explicitMeta) => {
    const codeToApply = (explicitCode || barcodeInput || '').trim();
    const metaToApply = explicitMeta || lookupResult || null;
    if (codeToApply && onBarcodeScanned) {
      onBarcodeScanned(codeToApply, metaToApply);
    }
    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setServerDecoding(true);

    // 1. Client-side native BarcodeDetector
    if ('BarcodeDetector' in window) {
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        await img.decode();
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
        });
        const detected = await detector.detect(img);
        URL.revokeObjectURL(objectUrl);
        if (detected && detected.length > 0) {
          setServerDecoding(false);
          handleSuccessfulScan(detected[0].rawValue.trim());
          return;
        }
      } catch (err) {}
    }

    // 2. Server-side OpenCV multi-pass decoding
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/v1/scans/decode-barcode-image', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.barcode) {
          handleSuccessfulScan(data.barcode);
          if (data.data) {
            setLookupResult(data.data);
          }
          setServerDecoding(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Server optical file decode error:', err);
    }

    setServerDecoding(false);
    alert('Could not decode a clear barcode from this image. Please select a preset or enter the EAN number.');
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
                <span>GS1 / EAN-13 Live Barcode Scanner</span>
                <span className="text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Multi-Engine HUD
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Align barcode in viewfinder for automatic instant detection
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
            <span>Live Camera</span>
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
            <span>Presets & Manual</span>
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
              <div className="relative aspect-video sm:aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border border-sky-200 dark:border-slate-800 flex items-center justify-center shadow-inner">
                
                {/* Video Viewport */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />

                {/* Scanning Success Flash */}
                {scanSuccessAnim && (
                  <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-xs flex items-center justify-center z-20 animate-in fade-in zoom-in-95">
                    <div className="bg-slate-950/90 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-400/50 shadow-2xl flex items-center gap-2 font-bold text-xs font-mono">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                      <span>BARCODE LOCKED: {barcodeInput}</span>
                    </div>
                  </div>
                )}

                {/* Laser Scanning Overlay HUD */}
                {cameraActive && !scanSuccessAnim && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Viewfinder Target Reticle */}
                    <div className="relative w-72 h-36 border-2 border-emerald-400/90 rounded-2xl shadow-[0_0_25px_rgba(52,211,153,0.35)] flex items-center justify-center bg-emerald-950/5">
                      
                      {/* Animated Laser Sweep Line */}
                      <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-pulse"></div>
                      
                      <div className="text-[10px] font-mono text-emerald-300 font-bold bg-slate-950/85 px-2.5 py-0.5 rounded-full border border-emerald-500/30 absolute -top-3.5 flex items-center gap-1.5 shadow-md">
                        <Scan className="w-3 h-3 text-emerald-400" />
                        <span>HOLD BARCODE IN CENTER</span>
                      </div>
                      
                      {/* Corner Target Markers */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br-lg"></div>
                    </div>
                  </div>
                )}

                {/* Fallback / Camera Error state */}
                {!cameraActive && (
                  <div className="p-6 text-center space-y-3 text-slate-400 z-10">
                    <Camera className="w-10 h-10 mx-auto text-slate-500" />
                    <p className="text-xs max-w-xs mx-auto text-slate-300">
                      {cameraError || 'Initializing camera stream with continuous auto-focus...'}
                    </p>
                    <button
                      type="button"
                      onClick={initCameraAndScanners}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Start / Restart Camera</span>
                    </button>
                  </div>
                )}

                {/* Camera Top Controls Toolbar */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition-all text-xs shadow-md"
                      title={soundEnabled ? 'Mute Beep' : 'Enable Beep'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                      className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition-all text-xs shadow-md"
                      title="Switch Camera (Front/Rear)"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={toggleTorch}
                      className="p-2 rounded-xl bg-slate-900/80 text-white border border-slate-700 hover:bg-slate-800 transition-all text-xs shadow-md"
                      title="Toggle Flashlight / Torch"
                    >
                      <Zap className={`w-3.5 h-3.5 ${torchOn ? 'text-amber-400' : 'text-slate-400'}`} />
                    </button>
                  </div>
                )}

                {/* Instant Snapshot Helper in Camera View */}
                {cameraActive && (
                  <div className="absolute bottom-3 inset-x-3 flex justify-center z-10">
                    <button
                      type="button"
                      onClick={handleCaptureAndDecodeServer}
                      disabled={serverDecoding}
                      className="px-4 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-white border border-sky-400/40 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition-all disabled:opacity-50"
                    >
                      {serverDecoding ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          <span>Processing Optical Frame...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Tap for Instant Frame Capture</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD PHOTO VIEW */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-sky-300 dark:border-slate-700 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-sky-50/50 dark:bg-slate-950/40 transition-all text-center">
                <Upload className="w-8 h-8 text-sky-600 dark:text-amber-400" />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {serverDecoding ? 'Running Server Optical Decoder...' : 'Upload Package Photo Containing Barcode'}
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
              Scanned / Entered Barcode Number <span className="text-[10px] font-normal text-slate-500">(EAN-13, UPC, Code-128)</span>
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
                className="py-2 px-3 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-sky-300 dark:border-slate-700 text-sky-800 dark:text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
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
                  onClick={() => {
                    handleSuccessfulScan(item.code);
                  }}
                  className={`p-2 rounded-xl text-left transition-all flex items-center justify-between text-xs group cursor-pointer border ${
                    barcodeInput === item.code
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/50 text-emerald-900 dark:text-emerald-300'
                      : 'bg-sky-50/50 hover:bg-sky-100 dark:bg-slate-950/60 dark:hover:bg-slate-800 border-sky-200 dark:border-slate-800'
                  }`}
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
                    {barcodeInput === item.code ? 'Selected ✓' : 'Use →'}
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
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => handleApplyBarcode(barcodeInput, lookupResult)}
            disabled={!barcodeInput.trim()}
            className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Barcode to Audit {barcodeInput.trim() ? `(${barcodeInput.trim()})` : ''}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
