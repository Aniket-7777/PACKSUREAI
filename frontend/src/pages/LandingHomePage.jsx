import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, JURISDICTIONS } from '../context/AuthContext';
import { 
  Scale, 
  ShieldCheck, 
  Search, 
  Sliders, 
  Camera, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  User, 
  Building2, 
  Sparkles, 
  Globe, 
  Shield, 
  Cpu, 
  History, 
  FileSpreadsheet,
  Award,
  Zap,
  Layers,
  HelpCircle,
  Eye
} from 'lucide-react';

export const LandingHomePage = () => {
  const { loginWithCustomDetails, user, theme } = useAuth();
  const navigate = useNavigate();

  // Active Role Tab for Login Station
  const [selectedRole, setSelectedRole] = useState('inspector');

  // Form Fields (Customizable by User)
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS[0].label);
  const [badgeNumber, setBadgeNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, show quick dashboard access banner
  const isAlreadyLoggedIn = Boolean(user);

  const roleConfigs = {
    inspector: {
      role: 'inspector',
      title: 'Field Metrology Inspector',
      tag: 'On-Field Enforcement',
      badge: '5-Step AI Audit',
      color: 'from-sky-600 to-indigo-600',
      border: 'border-sky-500',
      lightBg: 'bg-sky-500/10',
      textColor: 'text-sky-700 dark:text-sky-400',
      icon: Search,
      defaultName: 'Vikram Singh',
      defaultBadge: 'DOCA-INSP-104',
      department: 'Legal Metrology Enforcement Wing',
      desc: 'Conduct 5-step packaging audits, camera & barcode verification, spot non-compliance memos and field queue dispatch.',
      features: [
        '5-Step multi-face packaging capture (Front, Back, Side, Bottom)',
        'Dual-track Gemini 2.0 Flash Vision & Multi-pass local OCR',
        'Automatic calculation of Unit Sale Price (USP) & font height checks',
        'Spot Non-Compliance Memo generation under Rule 24'
      ]
    },
    reviewer: {
      role: 'reviewer',
      title: 'Legal Reviewer / Adjudication Officer',
      tag: 'Statutory Directorate',
      badge: 'Section 36 Notices',
      color: 'from-indigo-600 to-purple-600',
      border: 'border-indigo-500',
      lightBg: 'bg-indigo-500/10',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      icon: Scale,
      defaultName: 'Adv. Ananya Sharma',
      defaultBadge: 'DOCA-LEGAL-042',
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
      border: 'border-amber-500',
      lightBg: 'bg-amber-500/10',
      textColor: 'text-amber-700 dark:text-amber-400',
      icon: Sliders,
      defaultName: 'Dr. Rajesh Mehta',
      defaultBadge: 'DOCA-DIR-001',
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
      title: 'Consumer / Citizen Portal',
      tag: 'Consumer Protection',
      badge: 'Fair Trade Rights',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500',
      lightBg: 'bg-emerald-500/10',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      icon: ShieldCheck,
      defaultName: 'Priya Verma',
      defaultBadge: 'INGRAM-USR-8821',
      department: 'Consumer Redressal & Fair Trade Wing',
      desc: 'Instant package verification, fair price scanner, mandatory declaration checklist and INGRAM grievance filing.',
      features: [
        'Instant smartphone camera package scan for fair price & MRP check',
        'Missing declarations warning checklist (Net Qty, Expiry, Address)',
        'Direct 1-click INGRAM grievance redressal submission',
        'Consumer packaging rights education portal under LMPC 2011'
      ]
    }
  };

  const currentRoleConfig = roleConfigs[selectedRole] || roleConfigs.inspector;

  const handleDemoFill = (roleKey) => {
    const config = roleConfigs[roleKey];
    setSelectedRole(roleKey);
    setFullName(config.defaultName);
    setUsername(roleKey);
    setBadgeNumber(config.defaultBadge);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = fullName.trim();
    if (!trimmedName && !username.trim()) {
      setErrorMsg('Please enter your Name or Username to continue.');
      return;
    }

    setLoading(true);
    try {
      const loginPayload = {
        role: selectedRole,
        full_name: trimmedName || currentRoleConfig.defaultName,
        username: username.trim() || selectedRole,
        badge_number: badgeNumber.trim() || `DOCA-${selectedRole.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        jurisdiction: jurisdiction,
        department: currentRoleConfig.department
      };

      loginWithCustomDetails(loginPayload);
      navigate('/');
    } catch (err) {
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100/40 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* ── 1. HERO SECTION & NATIONAL MANDATE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          {/* Government of India Header Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 shadow-xs text-xs font-semibold text-sky-800 dark:text-sky-300">
            <Building2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Government of India • Ministry of Consumer Affairs, Food & Public Distribution</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-[11px] text-slate-500">SIH 2026 Problem Statement: SIH26034</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            METROLOGY-AI
            <span className="block text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent mt-1">
              Autonomous Packaging Compliance & Legal Metrology Enforcement Platform
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            AI-driven multimodal vision and legal intelligence platform automating audits under the 
            <b> Legal Metrology (Packaged Commodities) Rules, 2011</b> and <b>Section 36 of the Legal Metrology Act, 2009</b>.
          </p>

          {/* Quick Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-lg font-bold font-display text-sky-700 dark:text-sky-400">Rules 5 & 6</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Statutory Declarations</div>
            </div>
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-lg font-bold font-display text-indigo-700 dark:text-indigo-400">Gemini 2.0</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Dual-Track Vision OCR</div>
            </div>
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-lg font-bold font-display text-amber-600 dark:text-amber-400">Section 36</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Form I Legal Notices</div>
            </div>
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-sky-200/80 dark:border-slate-800 shadow-2xs">
              <div className="text-lg font-bold font-display text-emerald-600 dark:text-emerald-400">SHA-256</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Tamper-Proof Audit Trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ROLE-BASED LOGIN & WORKSPACE PORTAL ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="text-center space-y-1.5 mb-8">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20 uppercase tracking-wider">
              Enforcement & Public Access Station
            </span>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              Sign In to Your Operational Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your role below, enter your name and credentials, and proceed to your dedicated dashboard.
            </p>
          </div>

          {/* 4 Role Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {Object.values(roleConfigs).map((cfg) => {
              const Icon = cfg.icon;
              const isSelected = selectedRole === cfg.role;

              return (
                <button
                  key={cfg.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(cfg.role);
                    setErrorMsg('');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? `bg-white dark:bg-slate-950 ${cfg.border} ring-2 ring-sky-500/20 shadow-md`
                      : 'bg-sky-50/50 dark:bg-slate-950/40 border-sky-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cfg.color} text-white flex items-center justify-center font-bold shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.lightBg} ${cfg.textColor}`}>
                        {cfg.tag}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{cfg.title}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {cfg.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-sky-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-sky-700 dark:text-sky-400">
                      {isSelected ? '✓ Active Role' : 'Select'}
                    </span>
                    <span className="font-mono text-slate-400">{cfg.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Role Login Card */}
          <div className="bg-sky-50/70 dark:bg-slate-950/60 border border-sky-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* Left Column: Role Details & Quick Fill */}
              <div className="lg:w-5/12 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${currentRoleConfig.lightBg} ${currentRoleConfig.textColor} border border-current`}>
                      {currentRoleConfig.tag}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">•</span>
                    <span className="text-xs text-slate-500 font-medium">{currentRoleConfig.department}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
                    {currentRoleConfig.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {currentRoleConfig.desc}
                  </p>
                </div>

                {/* Key Capabilities Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-sky-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Workspace Capabilities
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {currentRoleConfig.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick 1-Click Demo Fill Button */}
                <div className="pt-3 border-t border-sky-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDemoFill(selectedRole)}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-slate-800 border border-sky-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant 1-Click Demo Fill ({currentRoleConfig.defaultName})</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Custom Login Form */}
              <div className="lg:w-7/12 w-full bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-sky-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Officer / User Credentials
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Type your own name to test the system under your personal identity.
                    </p>
                  </div>
                  <Lock className="w-4 h-4 text-sky-600 dark:text-amber-400" />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Aniket Kumar"
                          className="w-full pl-8 pr-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* Username / Officer ID */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Username / Officer ID
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={`e.g. ${selectedRole}`}
                        className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Jurisdiction */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Jurisdiction / State Circle
                      </label>
                      <select
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {JURISDICTIONS.map((j) => (
                          <option key={j.id} value={j.label}>
                            {j.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Badge Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Badge / Registration Number
                      </label>
                      <input
                        type="text"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder={`e.g. DOCA-${selectedRole.toUpperCase()}-2026`}
                        className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Security Passcode
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${currentRoleConfig.color} hover:opacity-95 hover:scale-[1.01]`}
                  >
                    <span>Sign In to {currentRoleConfig.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

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
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            METROLOGY-AI • Smart India Hackathon 2026
          </div>
          <div>
            Ministry of Consumer Affairs, Food & Public Distribution • Legal Metrology Act, 2009
          </div>
        </div>
      </footer>

    </div>
  );
};
