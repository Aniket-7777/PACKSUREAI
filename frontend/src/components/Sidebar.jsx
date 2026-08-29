import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, ROLES_META } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ScanLine, 
  ListFilter, 
  Package, 
  AlertOctagon, 
  FileSpreadsheet, 
  Globe, 
  Scale, 
  Cpu, 
  History, 
  ShieldCheck,
  Building2,
  ChevronRight,
  Shield,
  Gavel,
  Sliders,
  Sparkles,
  Camera
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Role-Segregated Navigation Items
  const navItemsByRole = {
    inspector: [
      {
        path: '/',
        label: 'Command Center',
        icon: LayoutDashboard,
        badge: 'Live Radar',
        desc: 'Field surveillance & compliance overview'
      },
      {
        path: '/scan',
        label: 'New Inspection',
        icon: ScanLine,
        badge: '5-Step AI',
        desc: 'Multimodal vision & OCR audit'
      },
      {
        path: '/review-queue',
        label: 'Field Review Queue',
        icon: ListFilter,
        badge: 'Priority',
        desc: 'Pending field audits'
      },
      {
        path: '/products',
        label: 'Product Repository',
        icon: Package,
        badge: null,
        desc: 'Verified FMCG & packaging vault'
      },
      {
        path: '/violations',
        label: 'Violations Analytics',
        icon: AlertOctagon,
        badge: 'Heatmap',
        desc: 'Risk clusters & non-compliance rates'
      }
    ],
    reviewer: [
      {
        path: '/',
        label: 'Adjudication Docket',
        icon: LayoutDashboard,
        badge: 'Cases',
        desc: 'Statutory compliance & hearing board'
      },
      {
        path: '/review-queue',
        label: 'HITL Review Queue',
        icon: Gavel,
        badge: 'Sec 36',
        desc: 'Human-in-the-loop adjudication'
      },
      {
        path: '/reports',
        label: 'Notices & Orders',
        icon: FileSpreadsheet,
        badge: 'Compounding',
        desc: 'Form I notices & compounding slips'
      },
      {
        path: '/rules',
        label: 'Statutory Rules Registry',
        icon: Scale,
        badge: 'LMPC 2011',
        desc: 'Mandatory rules, clauses & precedents'
      },
      {
        path: '/ai-accuracy',
        label: 'AI Evidence Validation',
        icon: Cpu,
        badge: 'Confidence',
        desc: 'Dual-track OCR & bounding box check'
      }
    ],
    admin: [
      {
        path: '/',
        label: 'Executive Command',
        icon: LayoutDashboard,
        badge: 'Governance',
        desc: 'Pan-India enforcement & systems'
      },
      {
        path: '/ecommerce-audit',
        label: 'E-Commerce Surveillance',
        icon: Globe,
        badge: 'Rule 6(10)',
        desc: 'Automated marketplace web crawler'
      },
      {
        path: '/rules',
        label: 'Rule Configurator',
        icon: Scale,
        badge: 'Registry',
        desc: 'Statutory rules & penalty thresholds'
      },
      {
        path: '/ai-accuracy',
        label: 'AI Accuracy & Metrics',
        icon: Cpu,
        badge: 'Dual-Track',
        desc: 'Vision calibration & latency stats'
      },
      {
        path: '/audit-logs',
        label: 'Cryptographic Audit Trail',
        icon: History,
        badge: 'SHA-256',
        desc: 'Tamper-proof compliance ledger'
      },
      {
        path: '/products',
        label: 'Master Product Database',
        icon: Package,
        badge: null,
        desc: 'Global scanned package records'
      }
    ],
    customer: [
      {
        path: '/',
        label: 'Consumer Command',
        icon: LayoutDashboard,
        badge: 'Protection',
        desc: 'Fair pricing & rights overview'
      },
      {
        path: '/citizen-portal',
        label: 'Smart Package Scanner',
        icon: Camera,
        badge: 'Instant',
        desc: 'Verify MRP, USP & missing weights'
      },
      {
        path: '/rules',
        label: 'Packaging Rights Guide',
        icon: ShieldCheck,
        badge: 'LMPC Rights',
        desc: 'Mandatory declarations to look for'
      }
    ]
  };

  if (!user) {
    return null;
  }

  const currentRole = user.role === 'citizen' ? 'customer' : user.role;
  const visibleItems = navItemsByRole[currentRole] || navItemsByRole.inspector;
  const roleMeta = ROLES_META[currentRole] || ROLES_META.inspector;

  return (

    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sky-200/70 dark:border-slate-800 bg-sky-50/60 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200">
        {/* User Identity Card */}
        <div className="p-4 border-b border-sky-200/60 dark:border-slate-800/80">
          <div className="bg-white/80 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleMeta.avatar_color} text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-500/20`}>
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.full_name || user.username}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-amber-400 truncate">
                    {currentRole === 'reviewer' ? 'Legal Reviewer' : currentRole}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-sky-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-mono text-[10px]">{user.badge_number}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
                {user.department?.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links Segregated by Role */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>{currentRole.toUpperCase()} WORKSPACE</span>
            <span className="text-[9px] lowercase opacity-60">dedicated</span>
          </div>
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path + item.label}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-md shadow-sky-600/20 dark:shadow-amber-500/20 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-sky-200/50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-slate-950' : 'text-sky-700 dark:text-slate-400 group-hover:text-sky-900 dark:group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight ${
                    isActive
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-sky-200/70 dark:bg-slate-800 text-sky-800 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Legal Disclaimer & Version Footer */}
        <div className="p-4 border-t border-sky-200/60 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />
            <span>DoCA Legal Metrology</span>
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
            LMPC Rules, 2011 • Sec 36 Enforcement Engine v2.4
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-sky-200/80 dark:border-slate-800 flex items-center justify-around px-2 py-2 safe-area-pb">
        {visibleItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path + item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-sky-700 dark:text-amber-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="truncate max-w-[68px]">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
