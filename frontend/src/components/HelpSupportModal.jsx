import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  HelpCircle, 
  PhoneCall, 
  FileText, 
  Scale, 
  Keyboard, 
  ExternalLink, 
  ShieldCheck, 
  BookOpen, 
  AlertTriangle,
  Mail,
  Building2
} from 'lucide-react';

export const HelpSupportModal = () => {
  const { isHelpModalOpen, setIsHelpModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'hotline' | 'shortcuts' | 'faq'

  if (!isHelpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-white/90 dark:bg-slate-950/90 px-6 py-4 border-b border-sky-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 dark:bg-amber-500/10 text-sky-700 dark:text-amber-400 border border-sky-500/20 dark:border-amber-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100">
                Help & Metrology Support Center
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                LMPC 2011 Rules Guidance, Hotline Directory & Platform Support
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="p-1.5 rounded-xl hover:bg-sky-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-sky-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rules'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            LMPC Rule Handbook
          </button>
          <button
            onClick={() => setActiveTab('hotline')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'hotline'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Emergency Hotline
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'shortcuts'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Command Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'faq'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Operational FAQs
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-2xl">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-amber-400" />
                  Mandatory Declarations Checklist (Rule 6(1), LMPC 2011)
                </h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(a):</span>
                    <span>Name and complete address of the manufacturer, packer, or importer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(b):</span>
                    <span>Common or generic name of the commodity contained inside package.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(c):</span>
                    <span>Net quantity in standard SI metric units (g, kg, ml, L, m, or count).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(d):</span>
                    <span>Month & Year of manufacture, packing, or import (and Expiry date for perishables).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(da):</span>
                    <span>Mandatory Unit Sale Price (USP) in ₹ per g/kg/ml/L for every consumer retail pack.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(e):</span>
                    <span>Maximum Retail Price (MRP) inclusive of all taxes in clear bold lettering.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-sky-700 dark:text-amber-400">6(1)(10):</span>
                    <span>E-Commerce marketplace mandatory digital declaration parity prior to checkout.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 dark:text-amber-300 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Statutory Compounding Penalties (Section 36)
                </div>
                First offence: ₹25,000 fine per director. Second offence: ₹50,000. Subsequent offences: Up to ₹1,00,000 or 1 year imprisonment.
              </div>
            </div>
          )}

          {activeTab === 'hotline' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-sky-700 dark:text-amber-400">
                    National Consumer Helpline
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    1800-11-4000
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Toll-Free • 09:30 AM - 05:30 PM (Mon-Sat)
                  </div>
                </div>

                <div className="p-4 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-2xl">
                  <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">
                    DoCA Legal Metrology Wing
                  </div>
                  <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                    011-2338-9447
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Krishi Bhawan, New Delhi
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Official Grievance Email</div>
                    <div className="text-[11px] text-slate-500">dir-lm-ca@nic.in / nch-doca@gov.in</div>
                  </div>
                </div>
                <a
                  href="mailto:dir-lm-ca@nic.in"
                  className="px-3 py-1.5 bg-sky-200/80 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-200 rounded-xl hover:bg-sky-300 text-[11px]"
                >
                  Email Desk
                </a>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-2">
              <div className="p-3.5 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-2xl divide-y divide-sky-100 dark:divide-slate-800">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Launch New Inspection / Scan</span>
                  <kbd className="px-2 py-0.5 bg-sky-100 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 rounded text-[11px] font-mono">Alt + N</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Switch User Role / Login</span>
                  <kbd className="px-2 py-0.5 bg-sky-100 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 rounded text-[11px] font-mono">Alt + S</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Toggle Theme (Light / Dark)</span>
                  <kbd className="px-2 py-0.5 bg-sky-100 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 rounded text-[11px] font-mono">Alt + T</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">Open Help Handbook</span>
                  <kbd className="px-2 py-0.5 bg-sky-100 dark:bg-slate-800 border border-sky-300 dark:border-slate-700 rounded text-[11px] font-mono">Alt + H</kbd>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">How does the 5-Step AI scan verify compliance?</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Our system runs character-level Dual-Track OCR (EasyOCR + Gemini Multimodal Vision), calculates Area Ratio, and matches bounding boxes against LMPC 2011 statutory rules.
                </p>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-950/80 border border-sky-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">What is the Human-In-The-Loop (HITL) review?</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When AI confidence drops below 85% or high-risk slack fill is detected, the case is routed to the Legal Reviewer docket for mandatory officer adjudication before legal notices are served.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-sky-100/60 dark:bg-slate-950/80 px-6 py-3 border-t border-sky-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>PackSureAI Support Engine • Smart India Hackathon 2026</span>
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="px-3 py-1 bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 font-bold rounded-lg text-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
