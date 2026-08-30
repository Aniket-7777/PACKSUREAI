import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, JURISDICTIONS, DATE_RANGES, ROLES_META } from '../context/AuthContext';
import { 
  Scale, 
  Key, 
  Sun, 
  Moon, 
  UserCheck, 
  X, 
  Check, 
  Bell, 
  HelpCircle, 
  MapPin, 
  Calendar, 
  LogOut, 
  User, 
  ChevronDown, 
  ShieldAlert, 
  Sparkles, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  MessageSquare,
  Settings
} from 'lucide-react';
import { LoginModal } from './LoginModal';
import { HelpSupportModal } from './HelpSupportModal';
import { FeedbackModal } from './FeedbackModal';
import { SettingsModal } from './SettingsModal';

export const Navbar = () => {
  const { 
    user, 
    switchRole, 
    logout,
    theme, 
    toggleTheme,
    selectedLocation,
    setSelectedLocation,
    selectedDateRange,
    setSelectedDateRange,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
    setIsLoginModalOpen,
    setIsHelpModalOpen,
    setIsFeedbackModalOpen,
    setIsSettingsModalOpen
  } = useAuth();

  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [savedKeyMsg, setSavedKeyMsg] = useState(false);

  // Dropdown states
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifTab, setNotifTab] = useState('all'); // all, unread, critical, tasks


  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const locationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setSavedKeyMsg(true);
    setTimeout(() => {
      setSavedKeyMsg(false);
      setShowKeyModal(false);
    }, 1200);
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.read).length;
  const currentLoc = selectedLocation || JURISDICTIONS[0];
  const currentDate = selectedDateRange || DATE_RANGES[0];
  const roleMeta = user ? (ROLES_META[user.role] || ROLES_META.inspector) : null;


  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-sky-200/80 dark:border-slate-800 transition-colors duration-200 shadow-xs">
        {/* Top Operational Ministry Sub-Bar */}
        <div className="bg-sky-900 dark:bg-slate-950 px-4 py-1 border-b border-sky-800/80 dark:border-slate-800/80 text-[11px] text-sky-100 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300 dark:text-amber-400">GOVERNMENT OF INDIA</span>
            <span className="text-sky-400">•</span>
            <span>Department of Consumer Affairs (DoCA)</span>
            <span className="hidden md:inline text-sky-400">•</span>
            <span className="hidden md:inline text-sky-200 dark:text-slate-300">
              Legal Metrology (Packaged Commodities) Enforcement
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-300 dark:text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Operational Grid • SIH26034
            </span>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: PackSureAI Logo & Product Name */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-[2px] shadow-sm group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Scale className="w-4 h-4 text-sky-700 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-base tracking-tight text-slate-900 dark:text-slate-100">
                    PackSure<span className="text-sky-600 dark:text-amber-400">AI</span>
                  </span>
                  <span className="text-[9px] font-extrabold bg-sky-200 dark:bg-amber-500/10 text-sky-900 dark:text-amber-400 border border-sky-300 dark:border-amber-500/30 px-1.5 py-0.2 rounded">
                    LMPC 2011
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium hidden sm:block">
                  Statutory Packaging Compliance Command Center
                </span>
              </div>
            </Link>
          </div>


          {/* Center: Location & Date (Visible when logged in) */}
          {user && (
            <div className="hidden md:flex items-center gap-2 bg-sky-50/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs shadow-xs" ref={locationRef}>
              <div className="relative">
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-amber-400 font-semibold px-2 py-0.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
                  title="Select Active Jurisdiction / Circle"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate max-w-[150px]">{currentLoc.label}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-sky-100 dark:border-slate-800">
                      Select Enforcement Circle
                    </div>
                    {JURISDICTIONS.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors ${
                          currentLoc.id === loc.id
                            ? 'font-bold text-sky-700 dark:text-amber-400 bg-sky-50/70 dark:bg-amber-500/10'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 opacity-70" />
                          <span>{loc.label}</span>
                        </div>
                        {currentLoc.id === loc.id && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-slate-300 dark:text-slate-700 font-light">|</span>

              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={currentDate.id}
                  onChange={(e) => {
                    const target = DATE_RANGES.find(d => d.id === e.target.value);
                    if (target) setSelectedDateRange(target);
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs pr-1"
                >
                  {DATE_RANGES.map((dr) => (
                    <option key={dr.id} value={dr.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {dr.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}


          {/* Right Action Controls: Notifications, Vision Key, Theme, Profile/Login */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Notifications Hub (if logged in) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl bg-sky-100/70 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-200 dark:hover:bg-slate-800 transition-all"
                  title="Operational Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center shadow-xs animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-84 sm:w-[440px] bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 pb-2.5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Operational Alerts</span>
                          <span className="text-[9px] bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold border border-sky-200 dark:border-sky-500/20">
                            {unreadCount} unread
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Circle: <b className="text-sky-700 dark:text-amber-400">{currentLoc?.label}</b> • <span className="capitalize">{user?.role}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] text-sky-600 dark:text-amber-400 font-bold hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        {safeNotifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold"
                            title="Clear all alerts"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="px-4 py-1.5 bg-sky-50/50 dark:bg-slate-950/40 border-b border-sky-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[10px] overflow-x-auto">
                      {[
                        { id: 'all', label: `All (${safeNotifications.length})` },
                        { id: 'unread', label: `Unread (${unreadCount})` },
                        { id: 'critical', label: 'Critical' },
                        { id: 'tasks', label: 'Tasks' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setNotifTab(t.id)}
                          className={`px-2.5 py-0.5 rounded-lg font-bold transition-all shrink-0 ${
                            notifTab === t.id
                              ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-sky-100 dark:divide-slate-800/80">
                      {(() => {
                        const filteredByTab = safeNotifications.filter(n => {
                          if (notifTab === 'unread') return !n.read;
                          if (notifTab === 'critical') return n.type === 'critical';
                          if (notifTab === 'tasks') return n.category === 'field_task' || n.category === 'legal_review';
                          return true;
                        });

                        if (filteredByTab.length === 0) {
                          return (
                            <div className="p-6 text-center text-xs text-slate-400">
                              No {notifTab === 'all' ? '' : notifTab} operational alerts in {currentLoc?.label}.
                            </div>
                          );
                        }


                        return filteredByTab.map((n) => {
                          const isCritical = n.type === 'critical';
                          const isWarning = n.type === 'warning';
                          const isSuccess = n.type === 'success';

                          return (
                            <div
                              key={n.id}
                              className={`p-3.5 text-xs flex items-start gap-3 hover:bg-sky-50 dark:hover:bg-slate-800/60 transition-colors group ${
                                !n.read ? 'bg-sky-50/60 dark:bg-slate-800/30' : ''
                              }`}
                            >
                              <div 
                                onClick={() => {
                                  markNotificationAsRead(n.id);
                                  if (n.actionLink) {
                                    navigate(n.actionLink);
                                    setShowNotifications(false);
                                  }
                                }}
                                className={`p-2 rounded-xl shrink-0 mt-0.5 cursor-pointer ${
                                  isCritical ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                                  isWarning ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                  isSuccess ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                  'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                }`}
                              >
                                {isCritical ? <AlertTriangle className="w-4 h-4" /> :
                                 isWarning ? <ShieldAlert className="w-4 h-4" /> :
                                 isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                              </div>

                              <div 
                                onClick={() => {
                                  markNotificationAsRead(n.id);
                                  if (n.actionLink) {
                                    navigate(n.actionLink);
                                    setShowNotifications(false);
                                  }
                                }}
                                className="flex-1 min-w-0 space-y-1 cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px] truncate">
                                    {n.title}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                    {n.timestamp}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                                  {n.message}
                                </p>

                                <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-500 flex-wrap">
                                  {n.sender && (
                                    <span className="font-medium bg-sky-100/70 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                      {n.sender}
                                    </span>
                                  )}
                                  {n.jurisdiction && n.jurisdiction !== 'all' && (
                                    <span className="font-medium bg-amber-100/70 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {n.jurisdiction.split('(')[0].trim()}
                                    </span>
                                  )}
                                  <span className="font-bold text-sky-700 dark:text-amber-400 ml-auto hover:underline flex items-center gap-0.5">
                                    View Action →
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-center gap-1.5 shrink-0">
                                {!n.read && (
                                  <button
                                    onClick={() => markNotificationAsRead(n.id)}
                                    title="Mark read"
                                    className="w-2.5 h-2.5 rounded-full bg-sky-600 dark:bg-amber-400 mt-1 shadow-xs hover:scale-125 transition-transform"
                                  />
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(n.id);
                                  }}
                                  title="Dismiss notification"
                                  className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    <div className="px-4 pt-2 border-t border-sky-100 dark:border-slate-800 text-center flex items-center justify-between">
                      <Link
                        to="/review-queue"
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] font-bold text-sky-600 dark:text-amber-400 hover:underline"
                      >
                        Priority Case Radar →
                      </Link>
                      <Link
                        to="/products"
                        onClick={() => setShowNotifications(false)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        All Commodities Database →
                      </Link>
                    </div>
                  </div>
                )}


              </div>
            )}

            {/* Platform Settings Trigger (Accessible to Everyone) */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-sky-100/70 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Platform Settings & Calibration"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Platform Feedback Trigger (Accessible to Everyone) */}
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="p-2 rounded-xl bg-sky-100/70 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-200 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Send Platform Feedback & Feature Suggestions"
              aria-label="Feedback"
            >
              <MessageSquare className="w-4 h-4 text-sky-700 dark:text-amber-400" />
              <span className="hidden xl:inline">Feedback</span>
            </button>

            {/* Help Modal Trigger */}
            <button
              onClick={() => setIsHelpModalOpen(true)}
              className="p-2 rounded-xl bg-sky-100/70 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-200 dark:hover:bg-slate-800 transition-all"
              title="LMPC Rules Handbook & Support"
              aria-label="Help & Support"
            >
              <HelpCircle className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Vision AI Key Modal Trigger */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 dark:text-amber-300 font-semibold bg-sky-100/70 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-sky-200 dark:border-amber-500/20 hover:bg-sky-200 transition-all shadow-xs"
              title="Configure Multimodal Vision API Key"
            >
              <Key className="w-3.5 h-3.5 text-sky-700 dark:text-amber-400" />
              <span className="hidden lg:inline">{apiKey ? 'Vision Key: Active' : 'API Key'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-sky-100/70 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-200 dark:hover:bg-slate-800 transition-all"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light Sky Blue'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Authenticated User Menu OR Public Sign In Button */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900 border border-sky-300 dark:border-slate-700 hover:border-sky-400 dark:hover:border-slate-600 transition-all shadow-xs"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${roleMeta?.avatar_color || 'from-sky-600 to-indigo-600'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                    {(user.full_name || user.username || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                        {user.full_name || user.username}
                      </span>
                      <span className="text-[9px] font-extrabold bg-sky-100 dark:bg-amber-500/10 text-sky-800 dark:text-amber-400 border border-sky-200 dark:border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                        {user.badge_number || 'DOCA'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-sky-700 dark:text-amber-400 -mt-0.5 truncate max-w-[180px]">
                      {roleMeta?.role_title || user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {/* Profile Popover Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                    {/* User Identity Details */}
                    <div className="flex items-start gap-3 pb-3 border-b border-sky-100 dark:border-slate-800">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${roleMeta?.avatar_color || 'from-sky-600 to-indigo-600'} text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0`}>
                        {(user.full_name || user.username || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {user.full_name || user.username}
                        </h4>
                        <div className="text-[11px] font-semibold text-sky-700 dark:text-amber-400">
                          {roleMeta?.role_title || user.role}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          ID: {user.badge_number}
                        </div>
                      </div>
                    </div>

                    {/* Official Credentials Dossier */}
                    <div className="bg-sky-50/70 dark:bg-slate-950/70 border border-sky-200/80 dark:border-slate-800 p-3 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                          {user.department || 'Enforcement Directorate'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Jurisdiction:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[160px]">
                          {user.jurisdiction || selectedLocation?.label || 'Delhi NCR'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Status:</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Active Session
                        </span>
                      </div>
                    </div>

                    {/* Profile Quick Settings & Feedback Links */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsSettingsModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          setIsFeedbackModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />
                        <span>Feedback</span>
                      </button>
                    </div>

                    {/* Notice for Role Switching */}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-sky-100/50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-sky-200/60 dark:border-slate-700/60 leading-relaxed">
                      💡 <b>Role Security:</b> To switch your operational workspace (e.g. to Legal Reviewer or Admin), please Log Out and sign in from the main portal.
                    </div>

                    {/* Prominent Log Out Button */}
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        navigate('/');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-2 font-bold transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out & Exit Workspace</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  window.scrollTo({ top: 450, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Roles</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal />
      <HelpSupportModal />
      <FeedbackModal />
      <SettingsModal />

      {/* Gemini Vision API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-sky-50 dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Configure Gemini Vision Key</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Enables character-accurate multimodal vision extraction</p>
                </div>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>Free keys available at</span>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-amber-400 hover:underline flex items-center gap-0.5 font-semibold"
                >
                  Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            {savedKeyMsg && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>API Key saved securely in your browser!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-1.5 bg-sky-600 dark:bg-amber-500 hover:bg-sky-700 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
