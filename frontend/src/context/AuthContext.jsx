import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES_META = {
  inspector: {
    id: 2,
    username: 'inspector',
    full_name: 'Vikram Singh',
    role: 'inspector',
    role_title: 'Senior Field Metrology Inspector',
    badge_number: 'DOCA-INSP-104',
    department: 'Legal Metrology Enforcement Wing',
    jurisdiction: 'Delhi NCR (North Zone)',
    avatar_color: 'from-sky-600 to-indigo-600',
    description: 'Field inspection, 5-step packaging audits & spot non-compliance notice issuance.'
  },
  reviewer: {
    id: 3,
    username: 'reviewer',
    full_name: 'Adv. Ananya Sharma',
    role: 'reviewer',
    role_title: 'Legal Metrology Adjudication Officer',
    badge_number: 'DOCA-LEGAL-042',
    department: 'Statutory Review & Notice Directorate',
    jurisdiction: 'Central Legal Directorate',
    avatar_color: 'from-indigo-600 to-purple-600',
    description: 'Legal adjudication, HITL compliance verification, compounding orders & Sec 36 notices.'
  },
  admin: {
    id: 1,
    username: 'admin',
    full_name: 'Dr. Rajesh Mehta',
    role: 'admin',
    role_title: 'Director of Enforcement & Systems',
    badge_number: 'DOCA-DIR-001',
    department: 'National Compliance & AI Governance',
    jurisdiction: 'Pan-India Central Hub',
    avatar_color: 'from-amber-600 to-orange-600',
    description: 'Platform administration, rule registry management, AI calibration & tamper-proof audit trails.'
  },
  customer: {
    id: 4,
    username: 'customer',
    full_name: 'Priya Verma',
    role: 'customer',
    role_title: 'Verified Consumer & Fair Trade Portal',
    badge_number: 'INGRAM-USR-8821',
    department: 'Consumer Redressal & Fair Trade Wing',
    jurisdiction: 'Consumer Circle',
    avatar_color: 'from-emerald-600 to-teal-600',
    description: 'Consumer package verification, fair price/MRP checks & INGRAM grievance filing.'
  }
};

export const JURISDICTIONS = [
  { id: 'delhi-ncr', label: 'Delhi NCR (North Zone)', state: 'Delhi' },
  { id: 'mumbai-port', label: 'Mumbai Port & Customs', state: 'Maharashtra' },
  { id: 'bengaluru-hub', label: 'Bengaluru Tech & Retail Hub', state: 'Karnataka' },
  { id: 'kolkata-east', label: 'Kolkata Eastern Directorate', state: 'West Bengal' },
  { id: 'pan-india', label: 'Pan-India (All Circles)', state: 'National' }
];

export const DATE_RANGES = [
  { id: 'today', label: 'Today (Live Feed)' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last-7-days', label: 'Last 7 Days' },
  { id: 'month-to-date', label: 'Month-to-Date' },
  { id: 'quarter', label: 'Q1 2026' }
];

export const INITIAL_NOTIFICATIONS = [
  // ── INSPECTOR NOTIFICATIONS ──
  {
    id: 'notif-insp-1',
    type: 'critical',
    title: 'High Slack-Fill Alert (Rule 21)',
    message: 'Package #DK-8891 flagged with 42% non-functional void ratio in Connaught Place retail hub.',
    timestamp: '5m ago',
    read: false,
    targetRole: ['inspector'],
    jurisdiction: 'Delhi NCR (North Zone)',
    category: 'field_task',
    sender: 'AI Vision Radar Engine',
    actionLink: '/review-queue'
  },
  {
    id: 'notif-insp-2',
    type: 'success',
    title: 'Adjudication Approved by Legal Reviewer',
    message: 'Adv. Ananya Sharma approved your Non-Compliance Memo for Case #DOCA-2026-0042. Form I Show-Cause ready.',
    timestamp: '25m ago',
    read: false,
    targetRole: ['inspector'],
    jurisdiction: 'Delhi NCR (North Zone)',
    category: 'legal_review',
    sender: 'Review Directorate (Adv. Ananya Sharma)',
    actionLink: '/reports'
  },
  {
    id: 'notif-insp-3',
    type: 'warning',
    title: 'Evidence Clarification Requested',
    message: 'Reviewer requested clearer back-panel photo for MRP and Unit Sale Price (USP) font height check on Case #0019.',
    timestamp: '1h ago',
    read: false,
    targetRole: ['inspector'],
    jurisdiction: 'all',
    category: 'legal_review',
    sender: 'Statutory Review Directorate',
    actionLink: '/scan?id=1'
  },
  {
    id: 'notif-insp-4',
    type: 'critical',
    title: 'Citizen INGRAM Grievance Escalation',
    message: 'Consumer reported missing Net Quantity declaration and MRP tampering at Supermarket Circle 4.',
    timestamp: '2h ago',
    read: false,
    targetRole: ['inspector'],
    jurisdiction: 'Delhi NCR (North Zone)',
    category: 'consumer_grievance',
    sender: 'INGRAM Grievance Redressal Desk',
    actionLink: '/review-queue'
  },
  {
    id: 'notif-insp-5',
    type: 'warning',
    title: 'Port Ingestion Alert: Missing Country of Origin',
    message: 'Imported confectionery batch #IMP-9921 arrived at Nhava Sheva without mandatory importer address.',
    timestamp: '40m ago',
    read: false,
    targetRole: ['inspector'],
    jurisdiction: 'Mumbai Port & Customs',
    category: 'field_task',
    sender: 'Customs Liaison Desk',
    actionLink: '/review-queue'
  },
  {
    id: 'notif-insp-6',
    type: 'info',
    title: 'DoCA Statutory Advisory 2026/04',
    message: 'Directorate issued strict guidance on Rule 6(1)(e): Unit Sale Price (USP) mandatory for all pre-packaged foods above 5g/5ml.',
    timestamp: '3h ago',
    read: false,
    targetRole: ['inspector', 'reviewer', 'admin'],
    jurisdiction: 'all',
    category: 'rule_update',
    sender: 'Ministry of Consumer Affairs (DoCA)',
    actionLink: '/rules'
  },

  // ── LEGAL REVIEWER NOTIFICATIONS ──
  {
    id: 'notif-rev-1',
    type: 'critical',
    title: 'New Inspection Case Submitted for Adjudication',
    message: 'Insp. Vikram Singh submitted 3 severe breaches for Haldiram Snacks Batch #HL-442 awaiting Form I issuance.',
    timestamp: '12m ago',
    read: false,
    targetRole: ['reviewer'],
    jurisdiction: 'all',
    category: 'legal_review',
    sender: 'Enforcement Field Wing',
    actionLink: '/review-queue'
  },
  {
    id: 'notif-rev-2',
    type: 'warning',
    title: 'Section 36 Notice Deadline Expiry (48h)',
    message: 'Form I Show-Cause Notice response deadline for Dabur Honey batch #DH-901 expires in 48 hours.',
    timestamp: '45m ago',
    read: false,
    targetRole: ['reviewer'],
    jurisdiction: 'all',
    category: 'legal_review',
    sender: 'Statutory Notice Engine',
    actionLink: '/reports'
  },
  {
    id: 'notif-rev-3',
    type: 'success',
    title: 'Compounding Order Drafted (₹25,000)',
    message: 'First Offense compounding calculation generated for KBB Nuts under Section 48 of Legal Metrology Act, 2009.',
    timestamp: '2h ago',
    read: false,
    targetRole: ['reviewer'],
    jurisdiction: 'all',
    category: 'legal_review',
    sender: 'Compounding Slip Calculator',
    actionLink: '/reports'
  },

  // ── ADMIN / DIRECTOR NOTIFICATIONS ──
  {
    id: 'notif-admin-1',
    type: 'critical',
    title: 'E-Commerce Crawler Breaches Flagged',
    message: 'Rule 6(10) Crawler detected 24 marketplace listings missing mandatory Unit Sale Price on Blinkit & Amazon.',
    timestamp: '15m ago',
    read: false,
    targetRole: ['admin'],
    jurisdiction: 'all',
    category: 'admin_surveillance',
    sender: 'E-Commerce Surveillance Engine',
    actionLink: '/ecommerce-audit'
  },
  {
    id: 'notif-admin-2',
    type: 'info',
    title: 'SHA-256 Cryptographic Audit Ledger Verified',
    message: 'Scheduled integrity verification completed: 1,420 packaging scans and audit trails verified tamper-proof.',
    timestamp: '1h ago',
    read: false,
    targetRole: ['admin'],
    jurisdiction: 'all',
    category: 'admin_surveillance',
    sender: 'Security & Audit Service',
    actionLink: '/audit-logs'
  },
  {
    id: 'notif-admin-3',
    type: 'warning',
    title: 'AI Model Vision Accuracy Benchmark (98.4%)',
    message: 'Laplacian blur filter filtered 12 low-quality camera uploads across Western Circle. Optical accuracy stable.',
    timestamp: '3h ago',
    read: false,
    targetRole: ['admin'],
    jurisdiction: 'all',
    category: 'admin_surveillance',
    sender: 'AI Accuracy & Telemetry',
    actionLink: '/ai-accuracy'
  },

  // ── CONSUMER / CITIZEN NOTIFICATIONS ──
  {
    id: 'notif-cit-1',
    type: 'success',
    title: 'INGRAM Grievance Assigned to Inspector',
    message: 'Your complaint #ING-2026-8821 regarding missing MRP has been assigned to Field Inspector for physical verification.',
    timestamp: '20m ago',
    read: false,
    targetRole: ['customer', 'citizen'],
    jurisdiction: 'all',
    category: 'consumer_grievance',
    sender: 'National Consumer Helpline (NCH)',
    actionLink: '/citizen-portal'
  },
  {
    id: 'notif-cit-2',
    type: 'success',
    title: 'Grievance Resolved: Compounding Notice Issued',
    message: 'Retailer at Sector 18 Store penalized ₹25,000 under Section 36 for packaging violations. Case closed.',
    timestamp: '3h ago',
    read: true,
    targetRole: ['customer', 'citizen'],
    jurisdiction: 'all',
    category: 'consumer_grievance',
    sender: 'Legal Metrology Redressal Directorate',
    actionLink: '/citizen-portal'
  },
  {
    id: 'notif-cit-3',
    type: 'info',
    title: 'Consumer Rights Guide: Legal Metrology Rules',
    message: 'Did you know? Under LMPC 2011, it is illegal for any seller to alter, sticker over, or charge more than the printed MRP.',
    timestamp: '5h ago',
    read: true,
    targetRole: ['customer', 'citizen'],
    jurisdiction: 'all',
    category: 'consumer_grievance',
    sender: 'Department of Consumer Affairs Awareness Wing',
    actionLink: '/citizen-portal'
  }
];

export const DEFAULT_NOTIFICATIONS = INITIAL_NOTIFICATIONS;

export const AuthProvider = ({ children }) => {

  // Check localStorage for persisted user session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('metrology_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Operational Context Filters
  const [selectedLocation, setSelectedLocation] = useState(JURISDICTIONS[0]);
  const [selectedDateRange, setSelectedDateRange] = useState(DATE_RANGES[0]);

  // Theme State: 'light' is default (Light Sky Blue shade), 'dark' toggleable

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';

  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginWithCustomDetails = async (details) => {
    const roleKey = details.role || 'inspector';
    const baseMeta = ROLES_META[roleKey] || ROLES_META.inspector;
    
    const payload = {
      full_name: details.full_name?.trim() || baseMeta.full_name,
      username: details.username?.trim() || details.full_name?.toLowerCase().replace(/\s+/g, '_') || baseMeta.username,
      role: roleKey,
      badge_number: details.badge_number?.trim() || `DOCA-${roleKey.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      department: details.department || baseMeta.department,
      jurisdiction: details.jurisdiction || selectedLocation?.label || baseMeta.jurisdiction,
      password: details.password || 'password123'
    };

    try {
      const res = await fetch('/api/v1/auth/custom-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const fullUser = { 
          ...baseMeta, 
          ...data.user,
          role_title: baseMeta.role_title,
          avatar_color: baseMeta.avatar_color
        };
        setUser(fullUser);
        localStorage.setItem('metrology_user', JSON.stringify(fullUser));
        setToken(data.access_token);
        localStorage.setItem('auth_token', data.access_token);
        setIsLoginModalOpen(false);
        return { success: true, user: fullUser };
      }
    } catch (err) {
      console.warn("Backend auth connect fallback:", err);
    }

    // Fallback if offline
    const fallbackUser = {
      ...baseMeta,
      ...payload
    };
    setUser(fallbackUser);
    localStorage.setItem('metrology_user', JSON.stringify(fallbackUser));
    setToken(`jwt-session-${Date.now()}`);
    localStorage.setItem('auth_token', `jwt-session-${Date.now()}`);
    setIsLoginModalOpen(false);
    return { success: true, user: fallbackUser };
  };


  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      const baseMeta = ROLES_META[targetRole] || ROLES_META.inspector;
      const updatedUser = user ? { ...user, ...baseMeta, role: targetRole } : baseMeta;
      setUser(updatedUser);
      localStorage.setItem('metrology_user', JSON.stringify(updatedUser));
    } finally {
      setLoading(false);
    }
  };

  const login = async (roleOrDetails, password = '') => {
    setLoading(true);
    try {
      if (typeof roleOrDetails === 'object') {
        return loginWithCustomDetails(roleOrDetails);
      }

      if (ROLES_META[roleOrDetails]) {
        const meta = ROLES_META[roleOrDetails];
        setUser(meta);
        localStorage.setItem('metrology_user', JSON.stringify(meta));
        setToken(`token-${roleOrDetails}`);
        setIsLoginModalOpen(false);
        return { success: true, user: meta };
      }

      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: roleOrDetails, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('metrology_user', JSON.stringify(data.user));
        setToken(data.access_token);
        localStorage.setItem('auth_token', data.access_token);
        setIsLoginModalOpen(false);
        return { success: true, user: data.user };
      } else {
        const err = await res.json();
        return { success: false, error: err.detail || 'Login failed' };
      }
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('metrology_user');
    localStorage.removeItem('auth_token');
  };

  // Dynamic Role & Jurisdiction Filtered Notifications
  const currentRole = user?.role === 'citizen' ? 'customer' : (user?.role || 'inspector');
  const activeJurisdiction = selectedLocation?.label || user?.jurisdiction || 'Delhi NCR (North Zone)';

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('metrology_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('metrology_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to persist notifications:', e);
    }
  }, [notifications]);

  const addNotification = (newNotif) => {
    const formatted = {
      id: `notif-dyn-${Date.now()}`,
      type: newNotif.type || 'info',
      title: newNotif.title,
      message: newNotif.message,
      timestamp: 'Just now',
      read: false,
      targetRole: Array.isArray(newNotif.targetRole) ? newNotif.targetRole : [newNotif.targetRole || 'inspector'],
      jurisdiction: newNotif.jurisdiction || selectedLocation?.label || 'all',
      category: newNotif.category || 'field_task',
      sender: newNotif.sender || user?.full_name || 'System Grid',
      actionLink: newNotif.actionLink || '/review-queue'
    };
    setNotifications(prev => [formatted, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(n => {
    // 1. Role match
    const roleMatches = (n.targetRole || []).includes(currentRole) || 
      (currentRole === 'customer' && (n.targetRole || []).includes('citizen')) ||
      (currentRole === 'admin'); // Admins can monitor everything

    if (!roleMatches) return false;

    // 2. Jurisdiction match
    if (n.jurisdiction === 'all' || activeJurisdiction.includes('Pan-India') || currentRole === 'admin') {
      return true;
    }

    // Direct or fuzzy region match (e.g. "Delhi NCR" matches "Delhi NCR (North Zone)")
    const cleanActiveLoc = activeJurisdiction.split('(')[0].trim().toLowerCase();
    const cleanNotifLoc = (n.jurisdiction || 'all').split('(')[0].trim().toLowerCase();
    return cleanActiveLoc === cleanNotifLoc || cleanNotifLoc.includes(cleanActiveLoc) || cleanActiveLoc.includes(cleanNotifLoc) || cleanNotifLoc === 'all';
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        token,
        switchRole,
        login,
        loginWithCustomDetails,
        logout,
        loading,
        theme,
        toggleTheme,
        selectedLocation,
        setSelectedLocation,
        selectedDateRange,
        setSelectedDateRange,
        notifications: filteredNotifications,
        allNotifications: notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        removeNotification,
        clearAllNotifications,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isHelpModalOpen,
        setIsHelpModalOpen,
        isFeedbackModalOpen,
        setIsFeedbackModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen
      }}
    >

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


