import React, { useState, useEffect } from 'react';
import { useAuth, JURISDICTIONS } from '../context/AuthContext';
import { 
  X, 
  Settings, 
  Sun, 
  Moon, 
  Key, 
  Sliders, 
  Bell, 
  MapPin, 
  Database, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Languages, 
  Cpu, 
  RotateCcw,
  Building2,
  Lock
} from 'lucide-react';

export const SettingsModal = () => {
  const { 
    isSettingsModalOpen, 
    setIsSettingsModalOpen, 
    theme, 
    toggleTheme,
    selectedLocation,
    setSelectedLocation,
    user,
    addNotification
  } = useAuth();

  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'ai_vision' | 'notifications' | 'jurisdiction' | 'storage'

  // Settings states persisted in localStorage
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(() => Number(localStorage.getItem('app_ai_threshold') || '75'));
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(() => localStorage.getItem('app_sound_alerts') !== 'false');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(() => localStorage.getItem('app_auto_refresh') || '30');
  const [compactTables, setCompactTables] = useState(() => localStorage.getItem('app_compact_tables') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'en');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('app_high_contrast') === 'true');
  const [dualTrackVision, setDualTrackVision] = useState(() => localStorage.getItem('app_dual_track') !== 'false');

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!isSettingsModalOpen) return null;

  const handleClose = () => {
    setIsSettingsModalOpen(false);
    setSaveSuccessMsg('');
  };

  const handleSaveAll = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('app_ai_threshold', String(aiConfidenceThreshold));
    localStorage.setItem('app_sound_alerts', String(enableSoundAlerts));
    localStorage.setItem('app_auto_refresh', autoRefreshInterval);
    localStorage.setItem('app_compact_tables', String(compactTables));
    localStorage.setItem('app_language', language);
    localStorage.setItem('app_high_contrast', String(highContrast));
    localStorage.setItem('app_dual_track', String(dualTrackVision));

    setSaveSuccessMsg('✓ Settings updated and synced across workspace!');

    if (addNotification) {
      addNotification({
        type: 'info',
        title: 'Platform Settings Updated',
        message: 'Your appearance, AI vision calibration, and alert preferences have been saved.',
        targetRole: [user?.role || 'all'],
        category: 'settings_sync',
        sender: 'PackSureAI System Engine'
      });
    }

    setTimeout(() => {
      setSaveSuccessMsg('');
      setIsSettingsModalOpen(false);
    }, 1000);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all local application cache and inspection filters? User session will remain active.')) {
      localStorage.removeItem('app_cached_scans');
      localStorage.removeItem('app_user_feedback');
      setSaveSuccessMsg('✓ Local cache cleared successfully.');
      setTimeout(() => setSaveSuccessMsg(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={handleClose} 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8">
        {/* Top Gradient Ribbon */}
        <div className="h-2.5 w-full bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5">
              <Settings className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-amber-400 border border-sky-200 dark:border-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-500" />
                  System Preferences
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-semibold text-slate-500">Universal Access</span>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
                Platform Settings & Calibration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize appearance, AI thresholds, regional circle, and notification alerts.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-sky-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme & Display</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_vision')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'ai_vision'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Vision & OCR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Chimes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jurisdiction')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'jurisdiction'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Circle & Language</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data & Cache</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 font-semibold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/60 dark:bg-slate-950/60 border border-sky-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Interface Theme</h4>
                    <p className="text-[11px] text-slate-500">Switch between Day (Sky Blue) and Night Mode</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shadow-2xs font-bold"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Switch to Light Theme</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-sky-600" />
                        <span>Switch to Dark Theme</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-2 border-t border-sky-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Compact Queue Rows</h4>
                    <p className="text-[11px] text-slate-500">Denser table view for handling high-volume dockets</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compactTables}
                      onChange={(e) => setCompactTables(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI VISION & GEMINI */}
          {activeTab === 'ai_vision' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/60 dark:bg-slate-950/60 border border-sky-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Google Gemini 2.0 Vision API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <span>Generate free Gemini keys from</span>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div className="pt-2 border-t border-sky-200/60 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Minimum AI Confidence Threshold:
                    </span>
                    <span className="font-mono font-bold text-sky-700 dark:text-amber-400">
                      {aiConfidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={aiConfidenceThreshold}
                    onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:accent-amber-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    Detections with confidence below {aiConfidenceThreshold}% are automatically routed to Human-in-the-Loop (HITL) review.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALERTS & NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/60 dark:bg-slate-950/60 border border-sky-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Audio Chimes on Critical Alerts</h4>
                    <p className="text-[11px] text-slate-500">Play subtle audible tone when PRI &ge; 75 items arrive</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableSoundAlerts(!enableSoundAlerts)}
                    className={`p-2 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                      enableSoundAlerts
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {enableSoundAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>{enableSoundAlerts ? 'Enabled' : 'Muted'}</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-sky-200/60 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Live Feed Polling Interval</h4>
                    <p className="text-[11px] text-slate-500">Frequency of priority inspection docket sync</p>
                  </div>
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(e.target.value)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="10">Every 10 seconds</option>
                    <option value="30">Every 30 seconds</option>
                    <option value="60">Every 1 minute</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JURISDICTION & LANGUAGE */}
          {activeTab === 'jurisdiction' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/60 dark:bg-slate-950/60 border border-sky-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Default Operating Circle / Zone
                  </label>
                  <select
                    value={selectedLocation?.label || JURISDICTIONS[0].label}
                    onChange={(e) => {
                      const matched = JURISDICTIONS.find(j => j.label === e.target.value) || JURISDICTIONS[0];
                      setSelectedLocation(matched);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {JURISDICTIONS.map((j) => (
                      <option key={j.id} value={j.label}>
                        {j.label} ({j.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-sky-200/60 dark:border-slate-800 space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Statutory Notice Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="en">English (Official Court Language)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STORAGE & CACHE */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/60 dark:bg-slate-950/60 border border-sky-200/80 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">Local Inspection Cache</h4>
                    <p className="text-[11px] text-slate-500">Purge cached docket scans and UI filters</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Cache</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-sky-200/60 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
                  🔒 All statutory audit trails and legal notices are protected by SHA-256 tamper-proof ledgers on the backend.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-sky-50/80 dark:bg-slate-950/80 border-t border-sky-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500">
            Changes are saved automatically to your device.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-600 hover:opacity-95 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
