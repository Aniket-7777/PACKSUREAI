import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { 
  Scale, 
  ShieldCheck, 
  Search, 
  Sliders, 
  Camera, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  User, 
  Building2, 
  Sparkles, 
  FileSpreadsheet,
  Zap,
  Shield,
  Layers,
  LogIn,
  UserPlus
} from 'lucide-react';

export const LandingHomePage = () => {
  const { user, setIsFeedbackModalOpen, setIsSettingsModalOpen } = useAuth();
  const navigate = useNavigate();

  // Dialog Box (AuthModal) state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState('inspector');
  const [modalMode, setModalMode] = useState('signin'); // 'signin' | 'signup'

  const openAuthDialog = (role = 'inspector', mode = 'signin') => {
    setModalRole(role);
    setModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const isAlreadyLoggedIn = Boolean(user);

  const roleConfigs = {
    inspector: {
      role: 'inspector',
      title: 'Field Metrology Inspector',
      tag: 'On-Field Enforcement',
      badge: '5-Step AI Audit',
      color: 'from-sky-600 to-indigo-600',
      border: 'border-sky-300 dark:border-sky-800 hover:border-sky-500',
      lightBg: 'bg-sky-500/10',
      textColor: 'text-sky-700 dark:text-sky-400',
      icon: Search,
      department: 'Legal Metrology Enforcement Wing',
      desc: 'Conduct 5-step packaging audits, live camera & barcode verification, spot non-compliance memos and field queue dispatch.',
      features: [
        '5-Step multi-face packaging capture (Front, Back, Side, Bottom)',
        'Dual-track Gemini Multimodal Vision & OCR verification',
        'Automatic Unit Sale Price (USP) & font height validation',
        'Spot Non-Compliance Memo generation under Rule 24'
      ]
    },
    reviewer: {
      role: 'reviewer',
      title: 'Legal Reviewer / Adjudication Officer',
      tag: 'Statutory Directorate',
      badge: 'Section 36 Notices',
      color: 'from-indigo-600 to-purple-600',
      border: 'border-indigo-300 dark:border-indigo-800 hover:border-indigo-500',
      lightBg: 'bg-indigo-500/10',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      icon: Scale,
      department: 'Statutory Review & Notice Directorate',
      desc: 'Human-in-the-loop (HITL) evidence validation, compounding orders, and court-admissible Section 36 show-cause notices.',
      features: [
        'HITL review queue with visual bounding boxes & confidence calibration',
        'Ministry of Consumer Affairs Form I legal notice generator',
        'Compounding slip calculator for 1st vs 2nd offenses',
        'Statutory exemption validation (Rule 26 institutional / export exemptions)'
      ]
    },
    admin: {
      role: 'admin',
      title: 'System Administrator & Director',
      tag: 'Pan-India Operations',
      badge: 'Governance & AI Config',
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-300 dark:border-amber-800 hover:border-amber-500',
      lightBg: 'bg-amber-500/10',
      textColor: 'text-amber-700 dark:text-amber-400',
      icon: Sliders,
      department: 'National Compliance & AI Governance',
      desc: 'E-commerce marketplace crawler, LMPC rules configuration, AI model calibration and SHA-256 tamper-proof audit trails.',
      features: [
        'Automated e-commerce surveillance crawler under Rule 6(10)',
        'Central statutory rules registry with penalty threshold manager',
        'AI vision accuracy benchmarks & false-positive metrics',
        'Cryptographic immutable audit log ledger'
      ]
    },
    customer: {
      role: 'customer',
      title: 'Consumer & Citizen Portal',
      tag: 'Consumer Protection',
      badge: 'Fair Trade Rights',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-300 dark:border-emerald-800 hover:border-emerald-500',
      lightBg: 'bg-emerald-500/10',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      icon: ShieldCheck,
      department: 'Consumer Redressal & Fair Trade Wing',
      desc: 'Instant smartphone package verification, fair price scanner, mandatory declaration checklist and INGRAM grievance filing.',
      features: [
        'Instant smartphone camera package scan for fair price & MRP check',
        'Missing declarations warning checklist (Net Qty, Expiry, Address)',
        'Direct 1-click INGRAM grievance redressal submission',
        'Consumer packaging rights education portal under LMPC 2011'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* ── 1. HERO SECTION & NATIONAL MANDATE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          {/* Government of India Header Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 shadow-xs text-xs font-semibold text-sky-800 dark:text-sky-300">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Government of India • Ministry of Consumer Affairs, Food & Public Distribution</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-500">SIH 2026 Problem Statement: SIH26034</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            PackSure<span className="text-sky-600 dark:text-amber-400">AI</span>
            <span className="block text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent mt-1">
              Autonomous Packaging Compliance & Legal Metrology Enforcement Platform
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            AI-driven multimodal vision and legal intelligence platform automating audits under the 
            <b> Legal Metrology (Packaged Commodities) Rules, 2011</b> and <b>Section 36 of the Legal Metrology Act, 2009</b>.
          </p>

          {/* Quick CTA Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            {isAlreadyLoggedIn ? (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Return to Active Dashboard ({user.full_name})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthDialog('inspector', 'signin')}
                  className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Workspace</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthDialog('inspector', 'signup')}
                  className="px-6 py-3 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm rounded-2xl border border-sky-300 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus className="w-4 h-4 text-sky-600 dark:text-amber-400" />
                  <span>Register Officer Profile</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. ROLE-BASED OPERATIONAL WORKSPACE STATIONS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 uppercase tracking-wider">
              Enforcement & Access Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100">
              Select Your Operational Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Click on any role station below to open the secure sign-in dialog and access your dedicated legal metrology dashboard.
            </p>
          </div>

          {/* 4 Interactive Role Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.values(roleConfigs).map((cfg) => {
              const Icon = cfg.icon;

              return (
                <div
                  key={cfg.role}
                  className={`bg-white/90 dark:bg-slate-900/90 border ${cfg.border} rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${cfg.color} text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.lightBg} ${cfg.textColor} border border-current`}>
                        {cfg.tag}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                      {cfg.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {cfg.department}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                      {cfg.desc}
                    </p>

                    {/* Capabilities Checklist */}
                    <div className="space-y-1.5 mt-4 pt-3 border-t border-sky-100 dark:border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Core Capabilities:
                      </span>
                      {cfg.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-sky-100 dark:border-slate-800/80 space-y-2">
                    <button
                      type="button"
                      onClick={() => openAuthDialog(cfg.role, 'signin')}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 bg-gradient-to-r ${cfg.color} hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In as {cfg.role.toUpperCase()}</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <button
                        type="button"
                        onClick={() => openAuthDialog(cfg.role, 'signup')}
                        className="text-slate-500 hover:text-sky-700 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
                      >
                        + Register New Profile
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">{cfg.badge}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SEPARATE INTERACTIVE DIALOG BOX (AUTH MODAL) ── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={modalRole}
        initialMode={modalMode}
      />

      {/* ── 3. CORE PLATFORM ARCHITECTURE & CAPABILITIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-amber-400">
            Engineered for SIH Problem Statement SIH26034
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            Statutory AI Architecture & Workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 5-Step Scan */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              5-Step Multi-Face Ingestion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardizes raw images (AVIF/HEIC/WebP to RGB JPEG), runs Laplacian blur and glare quality checks, and performs dual-track vision OCR.
            </p>
          </div>

          {/* Card 2: LMPC Rule Engine */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              LMPC Rules 2011 Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforces Rules 5, 6, 7, 9, 21, and 24. Validates Unit Sale Price (USP), Net Quantity units, MRP formatting, and statutory manufacturer details.
            </p>
          </div>

          {/* Card 3: Section 36 Automation */}
          <div className="bg-white/80 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Section 36 Legal Notice PDF
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Auto-generates court-admissible Form I Show-Cause Notices under Section 36 of the Legal Metrology Act, 2009 with statutory compounding calculations.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. FOOTER NOTE ── */}
      <footer className="border-t border-sky-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
            <span>PackSureAI • Smart India Hackathon 2026</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-500 font-normal">Department of Consumer Affairs</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>⚙️ Platform Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="text-slate-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>💬 Send Feedback</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};
