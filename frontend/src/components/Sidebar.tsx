'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckCircle2,
  Paperclip,
  Calculator,
  GitCompare,
  GitBranch,
  FileDown,
  History,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { NavTab } from '../lib/navigationConfig';
import { useAuth } from '../context/AuthContext';

export type { NavTab };

interface SidebarNavGroup {
  title: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isAlert?: boolean;
  }[];
}

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  validationIssuesCount?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  validationIssuesCount = 0,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, activeRole } = useAuth();

  const isProjectManager =
    user?.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
    activeRole.toUpperCase() === 'PROJECT_MANAGER' ||
    user?.role?.toUpperCase() === 'PROJECT_MANAGER';

  // Navigation groupings
  const navGroups: SidebarNavGroup[] = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'questionnaire', label: 'ESG Disclosures', icon: FileSpreadsheet, badge: 'P1–P9' },
        {
          id: 'validation',
          label: 'Validation Center',
          icon: CheckCircle2,
          badge: validationIssuesCount > 0 ? `${validationIssuesCount}` : undefined,
          isAlert: validationIssuesCount > 0,
        },
        { id: 'evidence', label: 'Evidence Register', icon: Paperclip, badge: 'SHA-256' },
      ],
    },
    {
      title: 'ANALYTICS & ENGINES',
      items: [
        { id: 'calculations', label: 'Deterministic Engine', icon: Calculator, badge: 'CEA v20' },
        { id: 'comparison', label: 'Period Variance (YoY)', icon: GitCompare },
        { id: 'lineage', label: 'Data Lineage DAG', icon: GitBranch },
      ],
    },
    {
      title: 'GOVERNANCE & REPORTS',
      items: [
        { id: 'reports', label: 'Regulatory Filings', icon: FileDown, badge: 'PDF/XLS' },
        { id: 'audit', label: 'Immutable Audit Trail', icon: History },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'organizations', label: 'Organization Units', icon: Building2 },
        { id: 'settings', label: 'Settings & RBAC', icon: Settings },
      ],
    },
  ];

  // Role permissions filtering
  const PM_ALLOWED: NavTab[] = ['dashboard', 'organizations', 'questionnaire', 'evidence'];

  const filteredGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (isProjectManager && !PM_ALLOWED.includes(item.id)) return false;
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-[#1e293b] flex flex-col transition-all duration-200 ease-in-out select-none ${
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a]/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs tracking-wider">
              E360
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 truncate">
                  <span>ESG360</span>
                  <span className="text-[9.5px] px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-semibold">
                    BRSR Core
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  MEIL Sustainability
                </div>
              </div>
            )}
          </div>

          {/* Close on Mobile / Collapse on Desktop */}
          <div className="flex items-center gap-1">
            <button
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 no-scrollbar">
          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider uppercase font-mono text-slate-400 dark:text-slate-400">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      if (mobileOpen) onCloseMobile();
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-200 font-semibold border-l-2 border-sky-600 dark:border-sky-400'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}
                    />

                    {!collapsed && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                              item.isAlert
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold'
                                : isActive
                                ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-semibold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Active User & Tenant info */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0f172a]/60">
          {!collapsed ? (
            <div className="flex items-center justify-between text-xs">
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Authenticated Officer'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {activeRole || user?.role || 'ESG Contributor'}
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online & Secured" />
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
