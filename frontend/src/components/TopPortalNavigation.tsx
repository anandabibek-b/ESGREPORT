'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import { NAV_ITEMS_CONFIG, NavTab } from '../lib/navigationConfig';
import {
  Bell,
  Search,
  Sparkles,
  Shield,
  UserCheck,
  ChevronDown,
  CheckCircle,
  Building,
  Calendar,
  Phone,
  Award,
  Send,
  LogOut,
  User as UserIcon,
  Globe,
} from 'lucide-react';

interface TopPortalNavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenAI: () => void;
  activePeriod: string;
  onPeriodChange: (periodId: string) => void;
  periods: any[];
  validationIssuesCount?: number;
}

export const TopPortalNavigation: React.FC<TopPortalNavigationProps> = ({
  currentTab,
  onTabChange,
  onOpenSearch,
  onOpenAI,
  activePeriod,
  onPeriodChange,
  periods,
  validationIssuesCount = 0,
}) => {
  const { user, activeRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.getNotifications();
        if (res.success && res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (e) {
        // silent fallback
      }
    }
    loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const roleLabels: Record<string, { label: string; color: string; badge: string }> = {
    PROJECT_MANAGER: { label: 'Project Manager', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', badge: 'PM' },
    ESG_TEAM: { label: 'ESG Team', color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800', badge: 'ESG' },
    company_admin: { label: 'Company Admin', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700', badge: 'Admin' },
    esg_manager: { label: 'ESG Team', color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800', badge: 'ESG' },
    data_owner: { label: 'Project Manager', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', badge: 'PM' },
    reviewer: { label: 'ESG Reviewer', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', badge: 'Reviewer' },
    approver: { label: 'Executive Approver', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', badge: 'Sign-off' },
    auditor: { label: 'External Auditor', color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800', badge: 'Assurance' },
  };

  const userRoleKey =
    user?.roles?.find((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
    user?.roles?.find((r) => r.toUpperCase() === 'ESG_TEAM') ||
    activeRole ||
    'PROJECT_MANAGER';

  const currentRoleBadge = roleLabels[userRoleKey] || roleLabels[activeRole] || {
    label: activeRole || 'Authorized User',
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    badge: 'Role',
  };

  const isProjectManager =
    userRoleKey.toUpperCase() === 'PROJECT_MANAGER' ||
    user?.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
    activeRole.toUpperCase() === 'PROJECT_MANAGER';

  const isEsgTeam =
    userRoleKey.toUpperCase() === 'ESG_TEAM' ||
    user?.roles?.some((r) => r.toUpperCase() === 'ESG_TEAM') ||
    activeRole.toUpperCase() === 'ESG_TEAM';

  const visibleNavItems = NAV_ITEMS_CONFIG.filter((item) => {
    if (isProjectManager) {
      return ['dashboard', 'organizations', 'questionnaire', 'evidence'].includes(item.id);
    }
    if (isEsgTeam) {
      return ['dashboard', 'organizations', 'questionnaire', 'validation', 'calculations', 'evidence', 'reports', 'audit'].includes(item.id);
    }
    return true;
  }).map((item) => {
    if (isProjectManager) {
      if (item.id === 'organizations') return { ...item, label: 'My Project', shortLabel: 'Project' };
      if (item.id === 'questionnaire') return { ...item, label: 'Data Collection', shortLabel: 'Section C' };
    }
    if (isEsgTeam) {
      if (item.id === 'organizations') return { ...item, label: 'Projects', shortLabel: 'Projects' };
      if (item.id === 'questionnaire') return { ...item, label: 'BRSR / Section C', shortLabel: 'Section C' };
      if (item.id === 'validation') return { ...item, label: 'Reviews', shortLabel: 'Reviews' };
      if (item.id === 'audit') return { ...item, label: 'Audit History', shortLabel: 'Audit' };
    }
    return item;
  });

  return (
    <header className="w-full bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-[#334155] shadow-xs sticky top-0 z-40 select-none transition-colors duration-200">
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-slate-50/90 dark:bg-[#111827] text-slate-600 dark:text-slate-300 text-[11px] px-4 sm:px-8 py-1.5 border-b border-slate-200 dark:border-[#334155] flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
        {/* Left: Helplines & Directives */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Toll-Free ESG Directorate: <strong className="text-slate-900 dark:text-white font-mono">1800-6345-374 (1800-MEIL-ESG)</strong></span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hidden md:flex">
            <Award className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            <span>SEBI BRSR Core Mandate: <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122</span></span>
          </div>
        </div>

        {/* Right: Quick Tools, AI & Persona Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Ask ESG AI Trigger */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition"
            title="Ask AI Grounded in Application Database"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-100" />
            <span>Ask ESG AI</span>
          </button>

          {/* Global Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs shadow-xs transition"
            title="Global Search (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="text-[9px] bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white relative shadow-xs transition"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-slate-200 dark:border-[#334155] z-50 p-4 text-xs animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="font-semibold text-slate-900 dark:text-white">Notifications ({unreadCount} unread)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 dark:text-slate-500 py-3 text-center">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border transition ${
                          n.isRead
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            : 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-slate-800 dark:text-slate-200 font-medium'
                        }`}
                      >
                        <div className="text-[11px] font-semibold text-slate-900 dark:text-white mb-0.5">{n.title}</div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Identity & Logout */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border shadow-xs ${currentRoleBadge.color}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>{user ? `${user.firstName} ${user.lastName}` : currentRoleBadge.label}</span>
              <span className="opacity-75 text-[10px] font-mono uppercase">({currentRoleBadge.label})</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold cursor-pointer transition shadow-xs"
              title="Logout from session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN OFFICIAL BRANDING HEADER */}
      <div className="px-4 sm:px-8 py-3.5 bg-white dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-[#334155] transition-colors duration-200">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          {/* Emblem / Insignia */}
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 shadow-xs">
            <Building className="w-6 h-6 text-sky-700 dark:text-sky-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 font-mono">
                MEIL GROUP • INFRASTRUCTURE
              </span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                SEBI Top 1000 Listed Entity
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Megha Engineering & Infrastructures Limited
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Corporate Sustainability & BRSR Reporting Portal</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Ministry of Corporate Affairs • SEBI Mandate FY 2024-25</span>
            </p>
          </div>
        </div>

        {/* Right CTA, Period Selection & THEME TOGGLE BUTTON */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* THEME TOGGLE BUTTON - Clearly visible in Top-Right Header */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-white dark:bg-[#243244] hover:bg-slate-100 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-slate-100 text-xs font-medium shadow-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:focus:ring-offset-slate-900 cursor-pointer"
            title={theme === 'dark' ? 'Click to switch to Light Mode' : 'Click to switch to Dark Mode'}
          >
            <span className="text-sm select-none" aria-hidden="true">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="whitespace-nowrap font-semibold">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Citizen Portal Public View Link */}
          <a
            href="/public"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs transition cursor-pointer"
            title="View what common citizens and public investors see without logging in"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="whitespace-nowrap hidden sm:inline">Citizen Portal</span>
          </a>

          {/* Active Period Selector Dropdown */}
          <div className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 shadow-xs transition-colors duration-200">
            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <div className="text-left">
              <div className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Reporting Cycle</div>
              <select
                value={activePeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-900 dark:text-slate-100 text-xs outline-none cursor-pointer"
              >
                {periods.length > 0 ? (
                  periods.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100">
                      {p.name} ({p.status === 'open' || p.status === 'data_collection' ? 'Active' : 'Baseline'})
                    </option>
                  ))
                ) : (
                  <option value="current" className="bg-white dark:bg-[#1E293B] text-slate-900 dark:text-slate-100">FY 2024-25 (Active)</option>
                )}
              </select>
            </div>
          </div>

          {/* Prominent Call to Action Button */}
          <button
            onClick={() => onTabChange('questionnaire')}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enter ESG Data</span>
            <span className="sm:hidden">Data</span>
          </button>
        </div>
      </div>

      {/* 3. HORIZONTAL NAVBAR ACROSS THE WEB */}
      <nav className="bg-slate-50/70 dark:bg-[#111827]/90 backdrop-blur-xs px-3 sm:px-6 border-b border-slate-200 dark:border-[#334155] overflow-x-auto transition-colors duration-200">
        <div className="flex items-center gap-1.5 py-2 min-w-max">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const dynamicBadge =
              item.id === 'validation' && validationIssuesCount > 0
                ? `${validationIssuesCount} Alerts`
                : item.badge || item.pill;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={`${item.label} — ${item.description}`}
                className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] text-sky-800 dark:text-sky-300 font-semibold shadow-xs'
                    : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#1E293B]/60 hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition shrink-0 ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Label & Sub-pill */}
                <div className="flex items-center gap-1.5">
                  <span className="tracking-tight whitespace-nowrap">{item.label}</span>
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono font-medium border ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {dynamicBadge}
                  </span>
                </div>

                {/* Active Indicator Underline */}
                {isActive && (
                  <span className="absolute -bottom-[9px] left-2 right-2 h-[2px] rounded-full bg-sky-600 dark:bg-sky-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. SCROLLING REGULATORY TICKER */}
      <div className="bg-sky-50/60 dark:bg-[#111827] border-b border-sky-100 dark:border-slate-800 px-4 sm:px-8 py-1.5 flex items-center gap-3 text-xs overflow-hidden transition-colors duration-200">
        <div className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider text-[10px] shrink-0 bg-sky-100 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 inline-block" />
          <span>Statutory Notice</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap text-slate-700 dark:text-slate-300 text-[11px] font-normal">
          <span className="inline-block animate-marquee">
            The SEBI BRSR Core Annual Filing for FY 2024-25 is active. All MEIL Group subsidiaries (MEIL Energy, MEIL Infra, Olectra Greentech EV) and 250+ Project Sites (Zojila Tunnel Site, Kaleshwaram Lift Irrigation) must submit primary activity telemetry with SHA-256 verified evidence before the statutory deadline.
          </span>
        </div>
      </div>
    </header>
  );
};
