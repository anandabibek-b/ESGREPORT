'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';
import {
  Bell,
  Search,
  Sparkles,
  Shield,
  ChevronDown,
  Building,
  Calendar,
  Globe,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Check,
  Menu,
  ShieldCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAI: () => void;
  onToggleMobileNav: () => void;
  activePeriod: string;
  onPeriodChange: (periodId: string) => void;
  periods: any[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAI,
  onToggleMobileNav,
  activePeriod,
  onPeriodChange,
  periods,
}) => {
  const { user, activeRole, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.getNotifications();
        if (res.success && res.data) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (e) {
        // quiet fallback
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

  const roleLabels: Record<string, string> = {
    PROJECT_MANAGER: 'Project Manager (Data Owner)',
    ESG_TEAM: 'ESG Reviewer & Compliance',
    company_admin: 'Company Administrator',
    esg_manager: 'Corporate ESG Manager',
    data_owner: 'Site Data Owner',
    reviewer: 'Lead ESG Reviewer',
    approver: 'Executive Approver',
    auditor: 'External ESG Auditor',
  };

  return (
    <header className="h-14 bg-white dark:bg-[#0c121e] border-b border-slate-200 dark:border-[#1e293b] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-colors duration-200 select-none">
      
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Company & Reporting Period Selector */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <Building className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>MEIL Corporate</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-[#182234] border border-slate-200 dark:border-[#2e3d55] px-2.5 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activePeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {periods.length > 0 ? (
                periods.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                    {p.name} ({p.status === 'open' || p.status === 'data_collection' ? 'Active' : 'Baseline'})
                  </option>
                ))
              ) : (
                <option value="current" className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white">
                  FY 2024-25 (Active Cycle)
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#182234] border border-slate-200 dark:border-[#2e3d55] text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search disclosures, evidence, metrics...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-700 text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, AI, Theme, Notifications & User */}
      <div className="flex items-center gap-2">
        
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Grounded AI Assistant Quick Action */}
        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition cursor-pointer"
          title="Open Grounded ESG AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">AI Analyst</span>
        </button>

        {/* Public Citizen Portal Link */}
        <Link
          href="/public"
          target="_blank"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer"
          title="Open Public Transparency Portal (Citizen View)"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Public Portal</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">Audit & System Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <div
                      key={n.id || i}
                      className={`p-2 rounded-lg border text-left ${
                        n.isRead
                          ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500'
                          : 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/40 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-xs">{n.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2">{n.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400">No active notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {activeRole || 'Officer'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-xl z-50 p-2.5 space-y-2 text-xs">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</div>
                <div className="text-[11px] text-slate-400 font-mono">{user?.email}</div>
                <div className="mt-1 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                  {roleLabels[activeRole] || activeRole}
                </div>
              </div>

              {/* Quick Persona Switcher for Evaluation */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold uppercase font-mono text-slate-400 px-2 pt-1">
                  Switch Persona (Demo):
                </div>
                {[
                  { role: 'company_admin', label: 'Company Admin (Rajesh)' },
                  { role: 'esg_manager', label: 'ESG Manager (Priya)' },
                  { role: 'data_owner', label: 'Data Owner (Ravi)' },
                  { role: 'auditor', label: 'External Auditor (Deepak)' },
                ].map((r) => (
                  <button
                    key={r.role}
                    onClick={async () => {
                      await switchRole(r.role);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] transition text-left cursor-pointer ${
                      activeRole === r.role
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    {activeRole === r.role && <Check className="w-3 h-3 text-sky-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
