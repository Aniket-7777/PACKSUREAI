import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, JURISDICTIONS, ROLES_META } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Scale, 
  Sliders, 
  Eye, 
  EyeOff, 
  X, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Mail, 
  Building2,
  BadgeCheck,
  MapPin
} from 'lucide-react';

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  initialRole = 'inspector', 
  initialMode = 'signin' 
}) => {
  const { loginWithCustomDetails, addNotification } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [jurisdiction, setJurisdiction] = useState(JURISDICTIONS[0]?.label || 'Delhi NCR (North Zone)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const roleMeta = ROLES_META[selectedRole] || ROLES_META.inspector;

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      const meta = ROLES_META[initialRole] || ROLES_META.inspector;
      setFullName(meta.full_name || '');
      setUsername(meta.username || '');
      setBadgeNumber(meta.badge_number || '');
      setJurisdiction(meta.jurisdiction || JURISDICTIONS[0].label);
      setPassword('••••••••••••');
    }
  }, [isOpen, initialRole, initialMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDemoFill = () => {
    const meta = ROLES_META[selectedRole] || ROLES_META.inspector;
    setFullName(meta.full_name);
    setUsername(meta.username);
    setBadgeNumber(meta.badge_number);
    setEmail(`${meta.username}@doca.gov.in`);
    setJurisdiction(meta.jurisdiction);
    setPassword('DemoPass2026!');
    setConfirmPassword('DemoPass2026!');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (mode === 'signup') {
      if (password && confirmPassword && password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        role: selectedRole,
        full_name: trimmedName,
        username: trimmedUsername || selectedRole,
        badge_number: badgeNumber.trim() || `DOCA-${selectedRole.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        jurisdiction: jurisdiction,
        department: roleMeta.department,
        email: email.trim()
      };

      await loginWithCustomDetails(payload);
      
      setSuccessMsg(
        mode === 'signup' 
          ? `✓ Account created successfully for ${trimmedName} (${roleMeta.role_title})!`
          : `✓ Authenticated as ${trimmedName} (${roleMeta.role_title})!`
      );

      if (addNotification) {
        addNotification({
          type: 'success',
          title: mode === 'signup' ? 'New Officer Onboarding Complete' : 'Session Authenticated',
          message: `Logged in to ${roleMeta.role_title} workspace for ${jurisdiction}.`,
          targetRole: [selectedRole],
          jurisdiction: jurisdiction,
          category: 'session_auth',
          sender: 'DoCA Central Auth'
        });
      }

      setTimeout(() => {
        onClose();
        navigate('/');
      }, 500);

    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const RoleIcon = selectedRole === 'reviewer' 
    ? Scale 
    : selectedRole === 'admin' 
      ? Sliders 
      : selectedRole === 'customer' 
        ? ShieldCheck 
        : User;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 transition-all">
        {/* Top Gradient Ribbon */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${roleMeta.avatar_color || 'from-sky-600 to-indigo-600'}`} />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-sky-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${roleMeta.avatar_color || 'from-sky-600 to-indigo-600'} text-white flex items-center justify-center font-bold shadow-xs shrink-0 mt-0.5`}>
              <RoleIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-amber-400 border border-sky-200 dark:border-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-500" />
                  {roleMeta.department || 'Legal Metrology Wing'}
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
                {mode === 'signin' ? `Sign In to ${roleMeta.role_title}` : `Register as ${roleMeta.role_title}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'signin'
                  ? 'Enter your credentials to access your designated operational dashboard.'
                  : 'Complete your registration to initialize your officer credentials.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-sky-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="px-5 sm:px-6 pt-4 pb-1 flex items-center justify-between border-b border-sky-100/60 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMsg(''); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-sky-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-sky-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              New Registration
            </button>
          </div>

          <button
            type="button"
            onClick={handleDemoFill}
            className="text-[11px] font-semibold text-sky-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            title="Auto-fill sample credentials for active role"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Demo Fill</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
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
                  className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            {/* Email (Visible on Sign Up) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@doca.gov.in"
                    className="w-full pl-8 pr-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Jurisdiction */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-600 dark:text-amber-400" />
                  <span>Jurisdiction Circle</span>
                </label>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-sky-600 dark:text-amber-400" />
                  <span>Badge / Reg. Number</span>
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
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-8 pr-9 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up Mode) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Security Passcode
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-8 pr-3 py-2 bg-sky-50/50 dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${roleMeta.avatar_color || 'from-sky-600 to-indigo-600'} hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50`}
              >
                <span>
                  {loading 
                    ? 'Authenticating...' 
                    : mode === 'signup' 
                      ? `Register & Open ${roleMeta.role_title}` 
                      : `Sign In to ${roleMeta.role_title}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="p-3.5 bg-sky-50/60 dark:bg-slate-950/60 border-t border-sky-100 dark:border-slate-800 text-center text-[10px] text-slate-500">
          <span>Protected under Rule 26 • Legal Metrology Act, 2009 • Central Enforcement Directory</span>
        </div>
      </div>
    </div>
  );
};
