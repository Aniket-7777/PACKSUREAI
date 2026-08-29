import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  HardDrive
} from 'lucide-react';

export const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 4,
    activeRules: 10,
    databaseStatus: 'Online (Neon Cloud PostgreSQL)',
    modelEngine: 'Gemini 2.0 Flash + EasyOCR Dual-Track',
    ocrAccuracy: '94.8%',
    totalAudits: 14
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg">
              System Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Platform Governance & Infrastructure</span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            System Administrator Control Plane
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Monitor cloud database health, AI extraction calibration, user access rights, and statutory rule registries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/ai-accuracy"
            className="px-3.5 py-2 bg-sky-200/70 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-sky-300 transition-all shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-700 dark:text-amber-400" />
            AI Accuracy
          </Link>
          <Link
            to="/audit-logs"
            className="px-3.5 py-2 bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-sky-700 dark:hover:bg-amber-400 transition-all shadow-md"
          >
            <History className="w-3.5 h-3.5" />
            Audit Ledger
          </Link>
        </div>
      </div>

      {/* System Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Database Backend</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 mt-1 truncate">
            PostgreSQL (Cloud)
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Neon Serverless Active
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>AI Calibration Index</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            {systemStats.ocrAccuracy}
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">Dual-Track Vision OCR</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Enforcement Officers</span>
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            {systemStats.totalUsers} Active
          </div>
          <div className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5">Role-Based Access Control</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>LMPC Rules Registry</span>
            <Scale className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            {systemStats.activeRules} Active
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">Gazette 2026.1 Versioned</div>
        </div>
      </div>

      {/* Role Management & Infrastructure Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management Table */}
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-700 dark:text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Authorized Personnel Directory
              </h2>
            </div>
            <span className="text-xs text-slate-400">4 Registered</span>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Dr. Rajesh Sharma', role: 'Admin', badge: 'DOCA-ADM-001', dept: 'DoCA Directorate' },
              { name: 'Vikram Singh', role: 'Inspector', badge: 'DOCA-INSP-104', dept: 'Enforcement Wing' },
              { name: 'Adv. Meera Iyer', role: 'Reviewer', badge: 'DOCA-REV-022', dept: 'Legal Affairs' },
              { name: 'Ananya Verma', role: 'Citizen', badge: 'CITIZEN-AUTH', dept: 'Consumer Portal' }
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-sky-100/40 dark:bg-slate-950/40 border border-sky-200/60 dark:border-slate-800 rounded-xl text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{u.badge} • {u.dept}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-200 dark:bg-slate-800 text-sky-800 dark:text-amber-400 uppercase">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Settings & AI Model Controls */}
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                AI Vision & OCR Engine Settings
              </h2>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">
              Dual-Track Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-sky-100/40 dark:bg-slate-950/40 border border-sky-200/60 dark:border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Multimodal Vision Engine</div>
              <p className="text-[11px] text-slate-500">Google Gemini 2.0 Flash (Zero-shot structured JSON)</p>
            </div>

            <div className="p-3 bg-sky-100/40 dark:bg-slate-950/40 border border-sky-200/60 dark:border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Offline Fallback OCR</div>
              <p className="text-[11px] text-slate-500">EasyOCR CRAFT + PyTesseract with field-isolated parsers</p>
            </div>

            <div className="p-3 bg-sky-100/40 dark:bg-slate-950/40 border border-sky-200/60 dark:border-slate-800 rounded-xl space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">Confidence Calibration Standard</div>
              <p className="text-[11px] text-slate-500">Multi-factor: Optical Quality + Syntax + Math Cross-Check</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
