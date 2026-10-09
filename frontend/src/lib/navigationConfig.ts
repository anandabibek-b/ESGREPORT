import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Calculator,
  Paperclip,
  GitCompare,
  GitBranch,
  FileDown,
  History,
  Settings,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'organizations'
  | 'questionnaire'
  | 'validation'
  | 'calculations'
  | 'evidence'
  | 'comparison'
  | 'lineage'
  | 'reports'
  | 'audit'
  | 'settings';

export interface NavItemConfig {
  id: NavTab;
  label: string;
  shortLabel: string;
  pill: string;
  description: string;
  engineCategory: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  colors: {
    accent: string;
    inactiveIconBg: string;
    inactiveIconColor: string;
    inactiveBorder: string;
    hoverBorder: string;
    hoverBg: string;
    hoverText: string;
    hoverIconGlow: string;
    activeBorder: string;
    activeBg: string;
    activeText: string;
    activeShadow: string;
    indicatorGrad: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    cardGlow: string;
    cardBorderHover: string;
    cardGradientBg: string;
    cardIconGrad: string;
    buttonGradient: string;
  };
}

// Pure Astra Obsidian & Amber/Violet Design System (Strictly ZERO Blue, ZERO Green)
const astraColor = (accent: 'amber' | 'purple' | 'rose' | 'zinc' = 'amber') => {
  if (accent === 'purple') {
    return {
      accent: 'purple',
      inactiveIconBg: 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 group-hover:bg-purple-950/40 group-hover:text-purple-300 group-hover:border-purple-500/40',
      inactiveIconColor: 'text-zinc-400 group-hover:text-purple-400',
      inactiveBorder: 'border-zinc-800/80',
      hoverBorder: 'hover:border-purple-500/40',
      hoverBg: 'hover:bg-purple-950/30',
      hoverText: 'hover:text-white',
      hoverIconGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
      activeBorder: 'border-purple-500/60',
      activeBg: 'bg-purple-950/40',
      activeText: 'text-purple-300 font-bold',
      activeShadow: 'shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]',
      indicatorGrad: 'bg-purple-500',
      pillBg: 'bg-purple-950/60',
      pillText: 'text-purple-300',
      pillBorder: 'border-purple-500/40',
      cardGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
      cardBorderHover: 'hover:border-purple-500/50',
      cardGradientBg: 'bg-[#0f0e17]',
      cardIconGrad: 'bg-purple-950/60 text-purple-400 border border-purple-500/40',
      buttonGradient: 'bg-purple-600 hover:bg-purple-500 text-white font-medium',
    };
  }

  if (accent === 'rose') {
    return {
      accent: 'rose',
      inactiveIconBg: 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 group-hover:bg-rose-950/40 group-hover:text-rose-300 group-hover:border-rose-500/40',
      inactiveIconColor: 'text-zinc-400 group-hover:text-rose-400',
      inactiveBorder: 'border-zinc-800/80',
      hoverBorder: 'hover:border-rose-500/40',
      hoverBg: 'hover:bg-rose-950/30',
      hoverText: 'hover:text-white',
      hoverIconGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      activeBorder: 'border-rose-500/60',
      activeBg: 'bg-rose-950/40',
      activeText: 'text-rose-300 font-bold',
      activeShadow: 'shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]',
      indicatorGrad: 'bg-rose-500',
      pillBg: 'bg-rose-950/60',
      pillText: 'text-rose-300',
      pillBorder: 'border-rose-500/40',
      cardGlow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      cardBorderHover: 'hover:border-rose-500/50',
      cardGradientBg: 'bg-[#140c10]',
      cardIconGrad: 'bg-rose-950/60 text-rose-400 border border-rose-500/40',
      buttonGradient: 'bg-rose-600 hover:bg-rose-500 text-white font-medium',
    };
  }

  // Default: Imperial Solar Gold / Amber
  return {
    accent: 'amber',
    inactiveIconBg: 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 group-hover:bg-amber-950/40 group-hover:text-amber-300 group-hover:border-amber-500/40',
    inactiveIconColor: 'text-zinc-400 group-hover:text-amber-400',
    inactiveBorder: 'border-zinc-800/80',
    hoverBorder: 'hover:border-amber-500/40',
    hoverBg: 'hover:bg-amber-950/30',
    hoverText: 'hover:text-white',
    hoverIconGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
    activeBorder: 'border-amber-500/60',
    activeBg: 'bg-amber-950/40',
    activeText: 'text-amber-400 font-bold',
    activeShadow: 'shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]',
    indicatorGrad: 'bg-amber-500',
    pillBg: 'bg-amber-950/60',
    pillText: 'text-amber-400',
    pillBorder: 'border-amber-500/40',
    cardGlow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    cardBorderHover: 'hover:border-amber-500/50',
    cardGradientBg: 'bg-[#12100d]',
    cardIconGrad: 'bg-amber-950/60 text-amber-400 border border-amber-500/40',
    buttonGradient: 'bg-amber-500 hover:bg-amber-400 text-black font-bold',
  };
};

export const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Overview',
    pill: 'ESG Score 88/100',
    description: 'Executive scorecards, BRSR Core compliance rate, and real-time GHG footprint meters.',
    engineCategory: 'Command Center',
    icon: LayoutDashboard,
    colors: astraColor('amber'),
  },
  {
    id: 'organizations',
    label: 'Organization Units',
    shortLabel: 'Org Units',
    pill: '250+ Project Sites',
    description: '4-Tier operational hierarchy: Corporate HQ, 3 Subsidiaries, 2 Business Units, and Sites.',
    engineCategory: 'Structure & Tenancy',
    icon: Building2,
    colors: astraColor('zinc'),
  },
  {
    id: 'questionnaire',
    label: 'ESG Disclosures',
    shortLabel: 'Disclosures',
    pill: 'P1–P9 SEBI Core',
    description: 'Mandatory SEBI BRSR questions across General Disclosures, Management, and Principles 1-9.',
    engineCategory: 'Statutory Reporting',
    icon: FileSpreadsheet,
    badge: '9 Principles',
    colors: astraColor('purple'),
  },
  {
    id: 'validation',
    label: 'Validation Engine',
    shortLabel: 'Validations',
    pill: '11 Assertions',
    description: 'Server-side rule engine enforcing 11 assertion categories, blocking invalid submissions.',
    engineCategory: 'Quality & Assurance',
    icon: CheckCircle2,
    badge: '1 Alert',
    colors: astraColor('rose'),
  },
  {
    id: 'calculations',
    label: 'Deterministic Engine',
    shortLabel: 'Calculations',
    pill: 'IPCC & CEA Factors',
    description: 'Zero frontend math. Server-side computation of Scope 1, Scope 2 CEA baseline & LTIFR safety.',
    engineCategory: 'Deterministic Compute',
    icon: Calculator,
    badge: 'IPCC / CEA',
    colors: astraColor('amber'),
  },
  {
    id: 'evidence',
    label: 'Evidence Register',
    shortLabel: 'Evidence',
    pill: 'SHA-256 Vault',
    description: 'Tamper-evident audit vault with SHA-256 checksums, vendor fuel invoices, and meter telemetry.',
    engineCategory: 'Cryptographic Ledger',
    icon: Paperclip,
    colors: astraColor('purple'),
  },
  {
    id: 'comparison',
    label: 'Period Comparison',
    shortLabel: 'YoY Trends',
    pill: 'YoY ±15% Radar',
    description: 'Period-over-period variance calculation between FY 2024-25 and baseline with anomaly alerts.',
    engineCategory: 'Trend & Variance',
    icon: GitCompare,
    badge: 'YoY',
    colors: astraColor('amber'),
  },
  {
    id: 'lineage',
    label: 'Data Lineage & DAG',
    shortLabel: 'Lineage DAG',
    pill: 'Chain of Custody',
    description: 'Directed Acyclic Graph tracing raw invoice → telemetry → deterministic formula → SEBI filing.',
    engineCategory: 'Provenance & Auditing',
    icon: GitBranch,
    colors: astraColor('purple'),
  },
  {
    id: 'reports',
    label: 'Regulatory Reports',
    shortLabel: 'Report Center',
    pill: 'PDF / Excel / JSON',
    description: 'Instant generation of official SEBI BRSR Annual Report PDF, multi-sheet Excel, and JSON schema.',
    engineCategory: 'Statutory Filings',
    icon: FileDown,
    badge: 'Export',
    colors: astraColor('amber'),
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    shortLabel: 'Audit Logs',
    pill: 'Immutable Ledger',
    description: 'Complete append-only audit trail logging all edits, approvals, role switches, and validations.',
    engineCategory: 'Governance & Assurance',
    icon: History,
    colors: astraColor('zinc'),
  },
  {
    id: 'settings',
    label: 'Settings & RBAC',
    shortLabel: 'RBAC Matrix',
    pill: '5 Personas',
    description: 'Fine-grained RBAC for 5 personas, tenant parameters, workflow locks, and reporting limits.',
    engineCategory: 'Administration & Security',
    icon: Settings,
    badge: 'RBAC',
    colors: astraColor('zinc'),
  },
];
