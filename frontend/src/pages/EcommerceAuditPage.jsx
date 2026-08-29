import React, { useState } from 'react';
import { Globe, Search, AlertCircle, CheckCircle2, ShieldAlert, Scale, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';

export const EcommerceAuditPage = () => {
  const [url, setUrl] = useState('https://www.amazon.in/dp/B08XYZ1234/imported-protein-spread');
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const handleAudit = async (customUrl) => {
    const targetUrl = customUrl || url;
    setAuditing(true);
    try {
      const res = await fetch('/api/v1/ecommerce/audit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      }
    } catch (e) {
      console.error('Error auditing e-commerce URL:', e);
    } finally {
      setAuditing(false);
    }
  };

  const loadPreset = (type) => {
    if (type === 'compliant') {
      const u = 'https://www.blinkit.com/prn/tata-salt-vacuum-evaporated-iodised/prid/12345';
      setUrl(u);
      handleAudit(u);
    } else {
      const u = 'https://www.amazon.in/dp/B08XYZ1234/imported-protein-spread';
      setUrl(u);
      handleAudit(u);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-sky-200 dark:bg-blue-500/10 text-sky-800 dark:text-blue-400 border border-sky-300 dark:border-blue-500/30 px-2 py-0.5 rounded uppercase">
            Rule 6(10) E-Commerce Compliance
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs text-slate-600 dark:text-slate-400">Digital Marketplace Enforcement</span>
        </div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
          E-Commerce Digital Listing Compliance Auditor
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Under the <b>Legal Metrology (Packaged Commodities) Amendment Rules</b>, all e-commerce entities (Amazon, Flipkart, Blinkit, Zepto, Swiggy Instamart) are legally mandated to display Unit Sale Price (USP), Country of Origin, and complete Manufacturer/Importer details on the digital product page before consumer checkout.
        </p>
      </div>

      {/* URL Input Bar & Presets */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste product page URL from Amazon, Flipkart, Blinkit, Zepto..."
              className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs font-mono"
            />
          </div>

          <button
            onClick={() => handleAudit(url)}
            disabled={auditing}
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all shrink-0 disabled:opacity-50"
          >
            {auditing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auditing Digital Shelf...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Audit Listing
              </>
            )}
          </button>
        </div>

        {/* Demo Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Test Scenarios:</span>
          <button
            onClick={() => loadPreset('compliant')}
            className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-sky-800 dark:text-emerald-400 rounded-lg font-bold border border-sky-200 dark:border-slate-700 transition-all text-[11px]"
          >
            Blinkit: Tata Salt (Compliant)
          </button>
          <button
            onClick={() => loadPreset('non-compliant')}
            className="px-2.5 py-1 bg-sky-100 hover:bg-sky-200 dark:bg-slate-800 text-red-700 dark:text-red-400 rounded-lg font-bold border border-sky-200 dark:border-slate-700 transition-all text-[11px]"
          >
            Amazon: Imported Spread (Missing USP & Origin)
          </button>
        </div>
      </div>

      {/* Audit Result Display */}
      {auditResult && (
        <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200/60 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-700 dark:text-amber-400 font-mono">Platform: {auditResult.platform}</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{auditResult.title}</h2>
              <p className="text-xs text-slate-500 truncate max-w-xl">{auditResult.url}</p>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Compliance Grade</div>
              <div className={`text-2xl font-bold font-display ${auditResult.is_compliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {auditResult.compliance_grade || (auditResult.is_compliant ? 'Grade A' : 'Grade F')}
              </div>
            </div>
          </div>

          {/* Declarations Check Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(auditResult.declarations_found || {}).map(([k, v]) => (
              <div key={k} className="p-3 bg-sky-50 dark:bg-slate-950/60 rounded-xl border border-sky-200/60 dark:border-slate-800 text-xs space-y-1">
                <div className="text-[11px] text-slate-500 capitalize">{k.replace(/_/g, ' ')}</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{v || 'MISSING'}</div>
                <div className={`text-[10px] font-bold ${v ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {v ? '✓ Declared' : '✗ Violation'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
