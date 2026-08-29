import React, { useState } from 'react';
import { useAuth, ROLES_META } from '../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  Search, 
  Scale, 
  Sliders, 
  UserCheck, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  User,
  Building2,
  HelpCircle
} from 'lucide-react';

export const LoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, switchRole, user } = useAuth();
  const [activeTab, setActiveTab] = useState('personas'); // 'personas' | 'custom'
  const [selectedRole, setSelectedRole] = useState(user?.role || 'inspector');
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;


  const handlePersonaLogin = async (roleKey) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(roleKey);
    } catch (e) {
      setErrorMsg('Failed to authenticate persona');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customUsername) {
      setErrorMsg('Please enter a username or select a role');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await login(customUsername, customPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed');
    }
    setLoading(false);
  };

  const roleCards = [
    {
      key: 'inspector',
      title: 'Field Metrology Inspector',
      icon: Search,
      badge: 'Surveillance & 5-Step Scan',
      color: 'border-sky-500/30 hover:border-sky-500 bg-sky-500/5 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400',
      tag: 'On-Field Enforcement',
      desc: 'Conduct 5-step packaging audits, barcode/OCR verification, spot memos & priority queue.'
    },
    {
      key: 'reviewer',
      title: 'Legal Reviewer / Adjudication Officer',
      icon: Scale,
      badge: 'HITL Adjudication & Notices',
      color: 'border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      tag: 'Legal Metrology Act Sec 36',
      desc: 'Adjudicate statutory packaging violations, generate Form I notices & approve compounding orders.'
    },
    {
      key: 'admin',
      title: 'System Administrator & Director',
      icon: Sliders,
      badge: 'Platform Governance & AI Config',
      color: 'border-amber-500/30 hover:border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
      tag: 'Pan-India Operations',
      desc: 'E-commerce crawler, LMPC rules configuration, AI model calibration & SHA-256 audit ledger.'
    },
    {
      key: 'customer',
      title: 'Consumer / Citizen Portal',
      icon: ShieldCheck,
      badge: 'Fair Trade & Verification',
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      tag: 'INGRAM Redressal',
      desc: 'Instant MRP/USP packaging verification, fair price scanner & online grievance submission.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-white/90 dark:bg-slate-950/90 px-6 py-5 border-b border-sky-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Scale className="w-5 h-5 text-sky-700 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-slate-100">
                  PackSure<span className="text-sky-600 dark:text-amber-400">AI</span>
                </h3>
                <span className="text-[10px] font-bold bg-sky-200 dark:bg-amber-500/10 text-sky-800 dark:text-amber-400 px-2 py-0.5 rounded-full border border-sky-300 dark:border-amber-500/20">
                  Select Role & Access
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department of Consumer Affairs • Legal Metrology Enforcement System
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-sky-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Tab Switcher */}
          <div className="flex items-center justify-center p-1 bg-white/70 dark:bg-slate-950/60 border border-sky-200 dark:border-slate-800 rounded-2xl max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('personas')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'personas'
                  ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              1-Click Persona Access (4 Roles)
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'custom'
                  ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Custom Credentials
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'personas' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {roleCards.map((rc) => {
                const Icon = rc.icon;
                const isCurrent = user?.role === rc.key;
                const meta = ROLES_META[rc.key];


                return (
                  <button
                    key={rc.key}
                    type="button"
                    onClick={() => handlePersonaLogin(rc.key)}
                    disabled={loading}
                    className={`text-left p-4 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                      isCurrent
                        ? 'border-sky-600 dark:border-amber-400 bg-sky-100/70 dark:bg-amber-500/10 ring-2 ring-sky-500/20 dark:ring-amber-500/20'
                        : rc.color
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-current flex items-center justify-center shadow-xs">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                              {rc.tag}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-amber-400 transition-colors">
                              {rc.title}
                            </h4>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {rc.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-sky-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {meta?.full_name}
                      </span>
                      <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-slate-700 dark:text-slate-300">
                        Select Workspace <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Officer Username / Badge ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="e.g. inspector, reviewer, admin, customer"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Security Passcode / Token
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter security passcode..."
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-sky-100/60 dark:bg-slate-950/80 px-6 py-3 border-t border-sky-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />
            LMPC Rules 2011 & Legal Metrology Act 2009 Enforcement
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Auth Service v2.4
          </span>
        </div>
      </div>
    </div>
  );
};
