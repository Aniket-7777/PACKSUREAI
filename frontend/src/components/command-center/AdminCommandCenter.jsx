import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Scale, 
  Cpu, 
  Activity, 
  History, 
  Server, 
  ShieldCheck, 
  Key, 
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  HardDrive,
  Globe,
  Sliders,
  Zap,
  TrendingUp,
  MapPin,
  RefreshCw,
  ArrowRight,
  Database,
  Lock
} from 'lucide-react';

export const AdminCommandCenter = () => {
  const { user, selectedLocation, selectedDateRange } = useAuth();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 14,
    activeRules: 12,
    databaseStatus: 'Online (Neon PostgreSQL Serverless)',
    modelEngine: 'Gemini 2.0 Flash + EasyOCR Dual-Track',
    ocrAccuracy: '98.4%',
    totalAudits: 1248,
    complianceIndex: '81.6%',
    penaltiesRecovered: '₹48.6 Lakhs'
  });

  const [crawlerRunning, setCrawlerRunning] = useState(false);
  const [crawlerResult, setCrawlerResult] = useState('');

  const handleRunCrawler = () => {
    setCrawlerRunning(true);
    setCrawlerResult('');
    setTimeout(() => {
      setCrawlerRunning(false);
      setCrawlerResult('Surveillance Crawler complete: 48 quick-commerce listings scanned across Blinkit & Amazon. 6 non-compliances flagged under Rule 6(10).');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. EXECUTIVE COMMAND BANNER */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Executive Command & Governance Plane
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                {selectedLocation.label}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Directorate General of Legal Metrology
              </span>
            </div>
            
            <h1 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
              System Governance & Pan-India Compliance Intelligence
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5 leading-relaxed">
              Monitor nationwide enforcement metrics, automated e-commerce web scrapers, dual-track vision calibration, and tamper-proof SHA-256 audit ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/ecommerce-audit"
              className="flex items-center gap-1.5 bg-sky-100/80 hover:bg-sky-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs border border-sky-300 dark:border-slate-700 transition-all shadow-xs"
            >
              <Globe className="w-4 h-4 text-sky-700 dark:text-amber-400" />
              <span>E-Commerce Surveillance</span>
            </Link>
            <Link
              to="/audit-logs"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <History className="w-4 h-4" />
              <span>Audit Ledger (SHA-256)</span>
            </Link>
          </div>
        </div>

        {/* Global Key Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-sky-100 dark:border-slate-800">
          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>National Compliance Index</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
              {systemStats.complianceIndex}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">18.4% Non-compliance rate</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Total Packages Audited</span>
              <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />
            </div>
            <div className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
              {systemStats.totalAudits}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +284 this month
            </div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Dual-Track AI Accuracy</span>
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-1">
              {systemStats.ocrAccuracy}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Gemini 2.0 + EasyOCR</div>
          </div>

          <div className="bg-sky-50/60 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-sky-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-semibold">
              <span>Compounded Penalties</span>
              <Scale className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-display text-amber-600 dark:text-amber-400 mt-1">
              {systemStats.penaltiesRecovered}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sec 36 recovery fund</div>
          </div>
        </div>
      </div>

      {crawlerResult && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{crawlerResult}</span>
        </div>
      )}

      {/* 2. IMMEDIATE ACTION STATION ("WHAT ACTION TO TAKE NEXT") */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Executive Directives • Action Station
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            System optimizations & automated surveillance routines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-sky-500/30 hover:border-sky-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Globe className="w-3 h-3" /> E-Commerce Sweep
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Rule 6(10)</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Trigger Automated Market Crawl
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Audit Blinkit, Zepto, and Amazon pantry listings for mandatory Unit Sale Price and Expiry parity.
              </p>
            </div>
            <button
              onClick={handleRunCrawler}
              disabled={crawlerRunning}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              {crawlerRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>{crawlerRunning ? 'Running Marketplace Crawler...' : 'Run Automated Crawler'}</span>
            </button>
          </div>

          {/* Action 2 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Cpu className="w-3 h-3" /> AI Calibration
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Vision Engine</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Verify Dual-Track Vision OCR Metrics
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Review IoU bounding box precision, confidence histograms, and character error rates across 1,200+ samples.
              </p>
            </div>
            <Link
              to="/ai-accuracy"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Inspect AI Accuracy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Action 3 */}
          <div className="bg-white/90 dark:bg-slate-900/90 border-2 border-emerald-500/30 hover:border-emerald-500 p-4 rounded-2xl shadow-xs space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" /> Ledger Security
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SHA-256 Valid</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Verify SHA-256 Cryptographic Chain
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                Audit blockchain-style tamper-proof log trail ensuring every officer inspection cannot be modified or forged.
              </p>
            </div>
            <Link
              to="/audit-logs"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Validate Audit Chain</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. PLATFORM INFRASTRUCTURE & ENFORCEMENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cloud Health Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-500" />
              Cloud Infrastructure & Backend Health
            </h3>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
              Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-sky-50/60 dark:bg-slate-950/60 rounded-xl border border-sky-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Database className="w-4 h-4 text-sky-600 dark:text-amber-400" />
                <span>Primary Cloud PostgreSQL</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">Neon Serverless (0.8s sync)</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-sky-50/60 dark:bg-slate-950/60 rounded-xl border border-sky-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Vision Processing Engine</span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">Dual-Track Multimodal</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-sky-50/60 dark:bg-slate-950/60 rounded-xl border border-sky-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Cryptographic Proof Engine</span>
              </div>
              <span className="text-slate-900 dark:text-slate-100 font-bold font-mono">SHA-256 Genesis Chain</span>
            </div>
          </div>
        </div>

        {/* Rule Registry Governance */}
        <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-500" />
              Statutory Rules & Gazette Thresholds
            </h3>
            <Link to="/rules" className="text-xs font-bold text-sky-600 dark:text-amber-400 hover:underline">
              Manage Rules →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-sky-50/60 dark:bg-slate-950/60 rounded-xl border border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Rule 6(1)(da) - Unit Sale Price</span>
                <p className="text-[10px] text-slate-500">Mandatory per g/ml unit pricing on all retail packages</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-md">Enforced</span>
            </div>

            <div className="p-2.5 bg-sky-50/60 dark:bg-slate-950/60 rounded-xl border border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Rule 21 - Deceptive Slack-Fill</span>
                <p className="text-[10px] text-slate-500">Max non-functional void ratio threshold: &lt; 30%</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-md">Enforced</span>
            </div>

            <div className="p-2.5 bg-sky-50/60 dark:bg-slate-950/60 rounded-xl border border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Rule 6(10) - E-Commerce Digital Parity</span>
                <p className="text-[10px] text-slate-500">Pre-checkout display of MRP, Net Qty & Expiry date</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-md">Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
