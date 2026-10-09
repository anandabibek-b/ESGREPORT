'use client';

import React, { useState } from 'react';
import { NavTab } from '../lib/navigationConfig';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  FileSpreadsheet,
  Calculator,
  ShieldAlert,
  Award,
  FileDown,
  Bot,
  UserCheck,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';

interface HackathonDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAI: () => void;
}

export const DEMO_STEPS = [
  {
    step: 1,
    title: 'Login as Business Unit Manager',
    role: 'data_owner',
    tab: 'dashboard' as NavTab,
    badge: 'Step 1 • Authentication',
    summary: 'Switch to Site Lead persona (Vikram Patil / Ravi) to record site-level consumption.',
    actionLabel: 'Switch to BU Manager Role',
  },
  {
    step: 2,
    title: 'Enter ESG Data (Diesel Consumption: 25,000 Litres)',
    role: 'data_owner',
    tab: 'questionnaire' as NavTab,
    badge: 'Step 2 • Data Collection',
    summary: 'Enter high-speed diesel consumption for heavy earthmovers on Principle 6 Environmental form.',
    actionLabel: 'Open ESG Disclosures',
  },
  {
    step: 3,
    title: 'Upload Supporting Evidence with SHA-256 Hash',
    role: 'data_owner',
    tab: 'evidence' as NavTab,
    badge: 'Step 3 • Cryptographic Register',
    summary: 'Attach primary fuel invoice (Diesel_Invoice_Oct.pdf) with tamper-evident SHA-256 hash.',
    actionLabel: 'View Evidence Register',
  },
  {
    step: 4,
    title: 'Submit Data for Verification',
    role: 'data_owner',
    tab: 'questionnaire' as NavTab,
    badge: 'Step 4 • Workflow Dispatch',
    summary: 'Send disclosure batch into the multi-stage corporate review pipeline.',
    actionLabel: 'Inspect Submission Pipeline',
  },
  {
    step: 5,
    title: 'Automatic ESG Calculations (Scope 1 = Fuel × Factor)',
    role: 'data_owner',
    tab: 'calculations' as NavTab,
    badge: 'Step 5 • Deterministic Compute',
    summary: 'Zero frontend math: 25,000 L × 2.68 kg CO2/L computes 67.00 tCO2e direct Scope 1 emissions.',
    actionLabel: 'Open Calculation Engine',
  },
  {
    step: 6,
    title: 'System Validates Submitted Data (11 Assertions)',
    role: 'data_owner',
    tab: 'validation' as NavTab,
    badge: 'Step 6 • Quality Engine',
    summary: 'Runs 11 automated assertions: unit checks, missing values, range bounds & historical consistency.',
    actionLabel: 'Run Validation Engine',
  },
  {
    step: 7,
    title: 'Anomaly Warning: Potential July Consumption Spike',
    role: 'reviewer',
    tab: 'validation' as NavTab,
    badge: 'Step 7 • Anomaly Radar',
    summary: 'Detects unusual spike: April (1,200) → May (1,250) → June (1,280) → July (8,900 MWh). Provides [Review], [Accept], [Request Correction].',
    actionLabel: 'Inspect Anomaly Radar',
  },
  {
    step: 8,
    title: 'ESG Manager Reviews and Approves Data',
    role: 'esg_manager',
    tab: 'dashboard' as NavTab,
    badge: 'Step 8 • Governance Sign-off',
    summary: 'Corporate ESG Manager Priya Sharma verifies audit justification and signs off the submission.',
    actionLabel: 'Switch to ESG Manager Role',
  },
  {
    step: 9,
    title: 'Corporate Dashboard Automatically Updates (Score: 94/100)',
    role: 'company_admin',
    tab: 'dashboard' as NavTab,
    badge: 'Step 9 • Executive Rollup',
    summary: 'Consolidated ESG Score (88/100) and Data Quality Score (94/100) update instantly with live metrics.',
    actionLabel: 'View Executive Dashboard',
  },
  {
    step: 10,
    title: 'Open BRSR Mapping (Principle 1 to 9 Completion)',
    role: 'company_admin',
    tab: 'questionnaire' as NavTab,
    badge: 'Step 10 • BRSR Engine',
    summary: 'Track completion across all 9 statutory SEBI Principles (P1: 100%, P2: 85%, P3: 92%, P4: 100%).',
    actionLabel: 'View Principles Mapping',
  },
  {
    step: 11,
    title: 'Show BRSR & BRSR Core Completion Status (KPI 01-09)',
    role: 'company_admin',
    tab: 'dashboard' as NavTab,
    badge: 'Step 11 • SEBI Core KPIs',
    summary: 'Live status of 9 mandatory BRSR Core KPIs (GHG footprint, water intensity, renewable energy mix).',
    actionLabel: 'Inspect BRSR Core Grid',
  },
  {
    step: 12,
    title: 'Ask AI ESG Assistant a Grounded Question',
    role: 'company_admin',
    tab: 'dashboard' as NavTab,
    badge: 'Step 12 • Grounded AI',
    summary: 'Query: “Why did our carbon emissions increase this year?” answered with verified citations and numbers.',
    actionLabel: 'Launch AI Assistant',
  },
  {
    step: 13,
    title: 'Generate Final Regulatory BRSR Report (PDF / Excel)',
    role: 'company_admin',
    tab: 'reports' as NavTab,
    badge: 'Step 13 • Filing Dispatch',
    summary: 'Click “GENERATE BRSR REPORT” to export audit-grade PDF, Excel workbook, and JSON schema.',
    actionLabel: 'Go to Report Export Center',
  },
];

export const HackathonDemoModal: React.FC<HackathonDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenAI,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { switchRole } = useAuth();

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleExecuteStep = () => {
    // Switch role if specified
    if (currentStep.role) {
      switchRole(currentStep.role);
    }

    // If step 12, open AI drawer
    if (currentStep.step === 12) {
      onOpenAI();
      onClose();
      return;
    }

    // Navigate to target tab
    onNavigateTab(currentStep.tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0d0d14] text-slate-900 dark:text-white p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background in gold/amber */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-500 dark:text-amber-400">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                ESG360 • Hackathon Live Demonstration Walkthrough
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                13-Step End-to-End Workflow • Problem Statement 08
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="my-5 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span>Step {currentStep.step} of 13</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
              {Math.round((currentStep.step / 13) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 overflow-hidden border border-slate-200 dark:border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-purple-500 transition-all duration-300"
              style={{ width: `${(currentStep.step / 13) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/60 space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {currentStep.badge}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Target View: #{currentStep.tab}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{currentStep.title}</h3>

          <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">{currentStep.summary}</p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-zinc-800/80 text-xs">
            <span className="text-slate-500 dark:text-zinc-400">
              Auto Role Switch:{' '}
              <strong className="text-amber-600 dark:text-amber-400 font-mono">
                {currentStep.role.replace('_', ' ').toUpperCase()}
              </strong>
            </span>

            <button
              onClick={handleExecuteStep}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{currentStep.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Bottom Carousel Controls */}
        <div className="mt-6 flex items-center justify-between relative z-10">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {/* Step dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'bg-amber-500 scale-125'
                    : idx < currentStepIndex
                    ? 'bg-slate-400 dark:bg-zinc-600'
                    : 'bg-slate-200 dark:bg-zinc-800'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))}
            disabled={currentStepIndex === DEMO_STEPS.length - 1}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
