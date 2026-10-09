'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NavTab } from '@/lib/navigationConfig';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { QuestionnaireView } from '@/components/QuestionnaireView';
import { ValidationView } from '@/components/ValidationView';
import { CalculationView } from '@/components/CalculationView';
import { EvidenceView } from '@/components/EvidenceView';
import { ComparisonView } from '@/components/ComparisonView';
import { LineageView } from '@/components/LineageView';
import { ReportsView } from '@/components/ReportsView';
import { AuditLogView } from '@/components/AuditLogView';
import { OrganizationView } from '@/components/OrganizationView';
import { SettingsView } from '@/components/SettingsView';
import { AiAssistantDrawer } from '@/components/AiAssistantDrawer';
import { GlobalSearchModal } from '@/components/GlobalSearchModal';
import { api } from '@/lib/api';
import { Building, Phone, Mail, AlertTriangle, X } from 'lucide-react';

const PM_ALLOWED_TABS: NavTab[] = ['dashboard', 'organizations', 'questionnaire', 'evidence'];
const ESG_ALLOWED_TABS: NavTab[] = [
  'dashboard',
  'organizations',
  'questionnaire',
  'validation',
  'calculations',
  'evidence',
  'comparison',
  'lineage',
  'reports',
  'audit',
  'settings',
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeRole, isLoading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [periods, setPeriods] = useState<any[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('');
  const [validationIssuesCount, setValidationIssuesCount] = useState<number>(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState<string | null>(null);

  // Responsive Sidebar States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // 1. Session & Authentication Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // 2. Keyboard shortcut for Search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. Role-based Default & Tab Protection
  useEffect(() => {
    if (!user) return;

    const isProjectManager =
      user.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
      activeRole.toUpperCase() === 'PROJECT_MANAGER' ||
      user.role?.toUpperCase() === 'PROJECT_MANAGER';

    const isEsgTeam =
      user.roles?.some((r) => r.toUpperCase() === 'ESG_TEAM') ||
      activeRole.toUpperCase() === 'ESG_TEAM' ||
      user.role?.toUpperCase() === 'ESG_TEAM';

    const requestedTab = (searchParams.get('tab') as NavTab) || null;
    const hasDeniedParam = searchParams.get('denied') === '1';

    if (hasDeniedParam) {
      setAccessDeniedMsg('You do not have permission to access this page.');
    }

    if (isProjectManager) {
      if (requestedTab && !PM_ALLOWED_TABS.includes(requestedTab)) {
        setAccessDeniedMsg('You do not have permission to access this page.');
        setCurrentTab('questionnaire');
      } else if (requestedTab && PM_ALLOWED_TABS.includes(requestedTab)) {
        setCurrentTab(requestedTab);
        setAccessDeniedMsg(null);
      } else {
        setCurrentTab('questionnaire');
      }
    } else if (isEsgTeam) {
      if (requestedTab && !ESG_ALLOWED_TABS.includes(requestedTab)) {
        setAccessDeniedMsg('You do not have permission to access this page.');
        setCurrentTab('dashboard');
      } else if (requestedTab && ESG_ALLOWED_TABS.includes(requestedTab)) {
        setCurrentTab(requestedTab);
        setAccessDeniedMsg(null);
      } else {
        setCurrentTab('dashboard');
      }
    } else if (requestedTab) {
      setCurrentTab(requestedTab);
    }
  }, [user, activeRole, searchParams]);

  // 4. Tab change handler with permission enforcement
  const handleTabChange = (targetTab: NavTab) => {
    if (!user) return;

    const isProjectManager =
      user.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
      activeRole.toUpperCase() === 'PROJECT_MANAGER' ||
      user.role?.toUpperCase() === 'PROJECT_MANAGER';

    const isEsgTeam =
      user.roles?.some((r) => r.toUpperCase() === 'ESG_TEAM') ||
      activeRole.toUpperCase() === 'ESG_TEAM' ||
      user.role?.toUpperCase() === 'ESG_TEAM';

    if (isProjectManager && !PM_ALLOWED_TABS.includes(targetTab)) {
      setAccessDeniedMsg('You do not have permission to access this page.');
      return;
    }

    if (isEsgTeam && !ESG_ALLOWED_TABS.includes(targetTab)) {
      setAccessDeniedMsg('You do not have permission to access this page.');
      return;
    }

    setAccessDeniedMsg(null);
    setCurrentTab(targetTab);
  };

  // 5. Load metadata (periods and validation count)
  useEffect(() => {
    if (!user) return;

    async function loadMeta() {
      try {
        const [pRes, vRes] = await Promise.all([
          api.getReportingPeriods(),
          api.getValidations(),
        ]);

        if (pRes.success && pRes.data && pRes.data.length > 0) {
          setPeriods(pRes.data);
          setActivePeriod(pRes.data[0].id);
        }

        if (vRes.success && vRes.data?.summary) {
          setValidationIssuesCount(
            (vRes.data.summary.warning || 0) + (vRes.data.summary.error || 0)
          );
        }
      } catch (e) {
        console.error('Error loading metadata in main shell:', e);
      }
    }
    loadMeta();
  }, [user]);

  // Loading screen while checking authentication session
  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold text-sm flex items-center justify-center mx-auto shadow-xs">
            E360
          </div>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            ESG360 Enterprise Platform
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <div className="w-3.5 h-3.5 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
            <span>Verifying enterprise session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] font-sans text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200">
      
      {/* 1. ENTERPRISE SIDEBAR */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        validationIssuesCount={validationIssuesCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* 2. MAIN APPLICATION CONTENT COLUMN */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAI={() => setAiOpen(true)}
          onToggleMobileNav={() => setMobileNavOpen(true)}
          activePeriod={activePeriod}
          onPeriodChange={setActivePeriod}
          periods={periods}
        />

        {/* Permission Denied Alert Banner */}
        {accessDeniedMsg && (
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200 shadow-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="font-semibold">{accessDeniedMsg}</span>
              </div>
              <button
                onClick={() => setAccessDeniedMsg(null)}
                className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab: NavTab) => handleTabChange(tab)}
              activePeriodId={activePeriod}
            />
          )}
          {currentTab === 'questionnaire' && <QuestionnaireView />}
          {currentTab === 'validation' && <ValidationView />}
          {currentTab === 'evidence' && <EvidenceView />}
          {currentTab === 'calculations' && <CalculationView />}
          {currentTab === 'comparison' && <ComparisonView />}
          {currentTab === 'lineage' && <LineageView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'audit' && <AuditLogView />}
          {currentTab === 'organizations' && <OrganizationView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>

        {/* Quiet Enterprise Footer */}
        <footer className="w-full bg-white dark:bg-[#0c121e] border-t border-slate-200 dark:border-[#1e293b] text-slate-500 dark:text-slate-400 text-xs mt-auto select-none transition-colors duration-200">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Megha Engineering & Infrastructures Limited
              </span>
              <span>•</span>
              <span>SEBI BRSR Core Filing System FY 2024-25</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>SHA-256 Verified Ledger</span>
              <span>•</span>
              <span>BSI & DNV Assured</span>
              <span>•</span>
              <span>Toll Free: 1800-6345-374</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Grounded ESG AI Assistant Drawer */}
      <AiAssistantDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Global Quick Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab) => {
          handleTabChange(tab);
          setSearchOpen(false);
        }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#090D16] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-sky-600/30 border-t-sky-600 rounded-full animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
