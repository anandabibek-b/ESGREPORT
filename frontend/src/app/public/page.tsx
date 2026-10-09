'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Building,
  Globe,
  ShieldCheck,
  Award,
  CheckCircle2,
  FileText,
  Download,
  Send,
  MessageSquare,
  HelpCircle,
  Search,
  ExternalLink,
  ChevronRight,
  Sun,
  Moon,
  Leaf,
  Droplets,
  HeartHandshake,
  Users,
  HardHat,
  Scale,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';

export default function PublicTransparencyPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'principles' | 'projects' | 'grievance' | 'reports' | 'faq'>('overview');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [principlesData, setPrinciplesData] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [faqsData, setFaqsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grievance form states
  const [grievanceForm, setGrievanceForm] = useState({
    name: '',
    email: '',
    phone: '',
    stakeholderType: 'Local Citizen / Resident',
    category: 'Water Conservation & Borewell Recharge',
    subject: '',
    message: '',
  });
  const [grievanceSubmitting, setGrievanceSubmitting] = useState(false);
  const [grievanceSuccess, setGrievanceSuccess] = useState<any>(null);
  const [grievanceError, setGrievanceError] = useState<string | null>(null);

  // Tracking query state
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackedRecord, setTrackedRecord] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Sync dark mode class
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    }

    async function loadPublicData() {
      try {
        setLoading(true);
        const [sumRes, prinRes, repRes, faqRes] = await Promise.all([
          api.getPublicSummary(),
          api.getPublicPrinciples(),
          api.getPublicReports(),
          api.getPublicFaq(),
        ]);

        if (sumRes.success && sumRes.data) setSummaryData(sumRes.data);
        if (prinRes.success && prinRes.data) setPrinciplesData(prinRes.data);
        if (repRes.success && repRes.data) setReportsData(repRes.data);
        if (faqRes.success && faqRes.data) setFaqsData(faqRes.data);
      } catch (e) {
        console.error('Error fetching public data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadPublicData();
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        setIsDarkMode(false);
      } else {
        html.classList.add('dark');
        setIsDarkMode(true);
      }
    }
  };

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrievanceError(null);
    setGrievanceSubmitting(true);

    try {
      const res = await api.submitCitizenGrievance(grievanceForm);
      if (res.success && res.data) {
        setGrievanceSuccess(res.data);
        setGrievanceForm({
          name: '',
          email: '',
          phone: '',
          stakeholderType: 'Local Citizen / Resident',
          category: 'Water Conservation & Borewell Recharge',
          subject: '',
          message: '',
        });
      } else {
        setGrievanceError(res.error || 'Failed to submit grievance.');
      }
    } catch (err: any) {
      setGrievanceError(err.message || 'Unable to submit grievance at this moment.');
    } finally {
      setGrievanceSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackIdInput.trim()) return;

    setTrackError(null);
    setTrackingLoading(true);
    try {
      const res = await api.getPublicGrievance(trackIdInput.trim());
      if (res.success && res.data) {
        setTrackedRecord(res.data);
      } else {
        setTrackError(res.error || 'Tracking ID not found.');
        setTrackedRecord(null);
      }
    } catch (err: any) {
      setTrackError('No grievance found with this Tracking ID. Please verify your reference number.');
      setTrackedRecord(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ================= 1. ENTERPRISE PUBLIC STRIP ================= */}
      <header className="w-full bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-[#334155] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
            <Building className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Megha Engineering & Infrastructures Limited (MEIL Group)</span>
          </div>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
            Public Citizen & Stakeholder Transparency Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toll Free Helpline */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Citizen Toll-Free: 1800-6345-374</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Corporate Internal Login Link */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <span>Corporate Staff Login</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-slate-50 dark:from-[#0F172A] dark:via-[#131F33] dark:to-[#0F172A] border-b border-slate-200 dark:border-[#334155] py-10 sm:py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-semibold">
                <Globe className="w-3.5 h-3.5" />
                <span>Open Public Disclosures • SEBI BRSR & BRSR Core Mandated</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                Sustainable Infrastructure for India’s Future
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Welcome to MEIL Group’s Public ESG & BRSR Transparency Portal. As part of our commitment to national development and environmental responsibility, all citizens, communities, investors, and researchers have complete, unhindered access to our verified sustainability metrics, clean water initiatives, and CSR welfare projects.
              </p>
            </div>

            {/* Quick ESG Grade Badge */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-sm flex flex-col items-center justify-center min-w-[220px] text-center space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                SEBI Disclosures Rating
              </div>
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                88 <span className="text-sm text-slate-400 font-normal">/ 100</span>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tier-1 Leadership Band</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 w-full">
                Reasonable Assurance by BSI & DNV
              </div>
            </div>
          </div>

          {/* 6 Key National Impact Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <Sun className="w-4 h-4" />
                <span>Clean Energy</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">38.4%</div>
              <div className="text-[10px] text-slate-500">Renewable energy share</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-semibold">
                <Droplets className="w-4 h-4" />
                <span>Water Recycled</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">4.2M Litres</div>
              <div className="text-[10px] text-slate-500">Zero Liquid Discharge</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <Leaf className="w-4 h-4" />
                <span>Afforestation</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">125,000+</div>
              <div className="text-[10px] text-slate-500">Native saplings planted</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                <HardHat className="w-4 h-4" />
                <span>Safety Record</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">14.8M Hrs</div>
              <div className="text-[10px] text-slate-500">Zero Lost Time Injury</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold">
                <HeartHandshake className="w-4 h-4" />
                <span>CSR Investment</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">₹48.60 Cr</div>
              <div className="text-[10px] text-slate-500">Rural community welfare</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                <Scale className="w-4 h-4" />
                <span>Governance</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">100%</div>
              <div className="text-[10px] text-slate-500">SEBI BRSR Compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. NAVIGATION TABS ================= */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#334155] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          {[
            { id: 'overview', label: 'Sustainability Overview', icon: Sparkles },
            { id: 'principles', label: 'SEBI BRSR 9 Principles', icon: FileText },
            { id: 'projects', label: 'Flagship Projects', icon: Layers },
            { id: 'grievance', label: 'Citizen Grievance & Inquiries', icon: MessageSquare },
            { id: 'reports', label: 'Public Reports & Downloads', icon: Download },
            { id: 'faq', label: 'Citizen FAQs', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 4. TAB CONTENTS ================= */}
      <main className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
        
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar E: Environmental */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Environmental Stewardship (E)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Decarbonizing heavy engineering and construction operations through renewable power, zero water discharge, and circular waste recycling.
                </p>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center justify-between">
                    <span>Clean Solar & Wind Energy:</span>
                    <strong className="text-slate-900 dark:text-white">38.4% share</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Scope 1 & 2 Emission Intensity:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">-18.2% reduction</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Recycled Concrete Aggregate:</span>
                    <strong className="text-slate-900 dark:text-white">86.4% circular reuse</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Net-Zero Roadmap Target:</span>
                    <strong className="text-sky-600 dark:text-sky-400">Net-Zero by 2045</strong>
                  </li>
                </ul>
              </div>

              {/* Pillar S: Social */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Social Responsibility & CSR (S)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Investing in local community welfare, clean drinking water, education for rural youth, and a zero-harm workplace for over 28,000 employees.
                </p>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center justify-between">
                    <span>CSR Community Spending:</span>
                    <strong className="text-slate-900 dark:text-white">₹48.60 Crores</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Village Beneficiaries:</span>
                    <strong className="text-sky-600 dark:text-sky-400">45,200+ citizens</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Rural Water Treatment RO Plants:</span>
                    <strong className="text-slate-900 dark:text-white">180+ installations</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>LTI-Free Safe Work Hours:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">14.8M hours</strong>
                  </li>
                </ul>
              </div>

              {/* Pillar G: Governance */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Corporate Governance & Ethics (G)</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Strict adherence to ethical business conduct, independent board oversight, whistleblower protections, and SEBI BRSR Core statutory filing.
                </p>
                <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <li className="flex items-center justify-between">
                    <span>Board Independence:</span>
                    <strong className="text-slate-900 dark:text-white">50% Independent Directors</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Code of Conduct Compliance:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">100% Certified</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Material Legal / Anti-trust Penalties:</span>
                    <strong className="text-slate-900 dark:text-white">₹0 (Zero violations)</strong>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Audit Assurance Level:</span>
                    <strong className="text-purple-600 dark:text-purple-400">BSI & DNV Assured</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Net-Zero Pathway 2045 Timeline */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    National Net-Zero 2045 Decarbonization Roadmap
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aligned with Government of India Panchamrit targets & Paris Climate Agreement
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  On-Track for Milestone 2030
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-sky-600">PHASE 1 (FY 2021-24)</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Baseline Telemetry</div>
                  <p className="text-[11px] text-slate-500">Scope 1, 2 emissions mapped across 250+ project sites; automated IoT fuel tracking deployed.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-600">PHASE 2 (FY 2025-27) • CURRENT</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Renewable Expansion</div>
                  <p className="text-[11px] text-slate-500">Transitioning construction machinery to electric drive & captive solar power; 38.4% clean electricity.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-purple-600">PHASE 3 (2030 TARGET)</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">50% Low-Carbon Intensity</div>
                  <p className="text-[11px] text-slate-500">50% GHG intensity cut; 100% green concrete utilization; fleet converted to hydrogen/electric power.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-amber-600">PHASE 4 (2045 GOAL)</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Full Net-Zero Operations</div>
                  <p className="text-[11px] text-slate-500">Absolute carbon neutrality across all infrastructure engineering and subsidiary operations.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: SEBI BRSR 9 PRINCIPLES ================= */}
        {activeTab === 'principles' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
              <FileText className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
                <strong>SEBI National Voluntary Guidelines (BRSR Core):</strong> Under SEBI mandate, listed corporations must disclose policies and progress against 9 core principles of business responsibility. Here is how MEIL performs, explained in plain language for every citizen.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {principlesData.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {p.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {p.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.citizenExplanation}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Compliance Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{p.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                        style={{ width: `${p.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p.keyMetric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: FLAGSHIP PROJECTS ================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Zojila Himalayan Tunnel (NH-1)',
                  tag: 'Cold-Climate Green Engineering',
                  imgColor: 'from-amber-600 to-amber-800',
                  description: 'Constructing Asia’s longest bi-directional all-weather highway tunnel at 11,578 ft elevation. Designed with electric mucking, dust wet-suppression, and minimal disturbance to delicate Himalayan ecosystems.',
                  impact: 'Cuts Srinagar-Leh travel time by 75%, saving an estimated 32,000 tCO2e of vehicle idling emissions every year.',
                },
                {
                  title: 'Kaleshwaram Lift Irrigation Mega-Project',
                  tag: 'National Water Stewardship',
                  imgColor: 'from-sky-600 to-sky-800',
                  description: 'The world’s largest multi-stage lift irrigation system. Channels surplus floodwater into underground reservoirs, recharging groundwater aquifers and transforming drought-prone regions.',
                  impact: 'Provides perennial irrigation water to 4.5 million acres of agricultural land, securing drinking water for 12,000 villages.',
                },
                {
                  title: 'Olectra Greentech Clean Electric Mobility',
                  tag: 'Zero Tailpipe Emissions',
                  imgColor: 'from-emerald-600 to-emerald-800',
                  description: 'Pioneering 100% electric commercial bus fleets operating across Mumbai, Pune, Hyderabad, and Delhi NCR with indigenous regenerative braking technology.',
                  impact: 'Displaces 22 million litres of diesel annually, cutting particulate matter (PM2.5) in congested urban metropolitan corridors.',
                },
                {
                  title: 'Rural Solar Microgrids & RO Water Stations',
                  tag: 'Community Empowerment',
                  imgColor: 'from-indigo-600 to-indigo-800',
                  description: 'Decentralized 45 MW captive solar microgrids feeding clean energy into agrarian communities alongside 180+ free community drinking water filtration plants.',
                  impact: 'Delivers safe, WHO-compliant drinking water to over 45,200 rural citizens who previously lacked clean water access.',
                },
              ].map((proj, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                >
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {proj.tag}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    <strong>🌱 Environmental & Community Impact:</strong> {proj.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: CITIZEN GRIEVANCE & INQUIRIES ================= */}
        {activeTab === 'grievance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-sky-600" />
                    <span>Citizen & Stakeholder Feedback / Grievance Portal</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    SEBI BRSR Principle 4 & Principle 8 Mandated Stakeholder Redressal Mechanism
                  </p>
                </div>

                {/* Grievance Success Box */}
                {grievanceSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 text-emerald-900 dark:text-emerald-200 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Inquiry Registered Successfully!</span>
                    </div>
                    <p>Thank you, {grievanceSuccess.name}. Your submission has been logged directly with the MEIL Corporate Sustainability Directorate.</p>
                    <div className="p-2.5 bg-white dark:bg-[#0F172A] rounded-lg border border-emerald-200 dark:border-emerald-900 font-mono text-xs flex items-center justify-between">
                      <span>Tracking Reference ID:</span>
                      <strong className="text-sky-600 dark:text-sky-400 font-bold">{grievanceSuccess.trackingId}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Please note this ID. An acknowledgement email has been queued and our site CSR team will review within 24–48 hours.
                    </p>
                  </div>
                )}

                {/* Grievance Error Box */}
                {grievanceError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{grievanceError}</span>
                  </div>
                )}

                <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={grievanceForm.name}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={grievanceForm.email}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, email: e.target.value })}
                        placeholder="name@gmail.com"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mobile Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={grievanceForm.phone}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Stakeholder Identity *
                      </label>
                      <select
                        value={grievanceForm.stakeholderType}
                        onChange={(e) => setGrievanceForm({ ...grievanceForm, stakeholderType: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition cursor-pointer"
                      >
                        <option>Local Citizen / Resident</option>
                        <option>Farmer / Agrarian Community Member</option>
                        <option>Student / Academic Researcher</option>
                        <option>Public Shareholder / Investor</option>
                        <option>Environmental NGO Representative</option>
                        <option>Job Applicant / Contract Worker</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Grievance / Inquiry Category *
                    </label>
                    <select
                      value={grievanceForm.category}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition cursor-pointer"
                    >
                      <option>Water Conservation & Borewell Recharge</option>
                      <option>Air Quality & Construction Dust Control</option>
                      <option>CSR Rural Skill Training Program</option>
                      <option>Tree Plantation & Biodiversity Inquiries</option>
                      <option>Public Safety & Road Connectivity Near Project</option>
                      <option>SEBI BRSR Statutory Report Query</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      value={grievanceForm.subject}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, subject: e.target.value })}
                      placeholder="Brief summary of your inquiry"
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Detailed Message / Suggestion *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={grievanceForm.message}
                      onChange={(e) => setGrievanceForm({ ...grievanceForm, message: e.target.value })}
                      placeholder="Please specify location, project details, and any assistance required..."
                      className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs outline-none focus:border-sky-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={grievanceSubmitting}
                    className="py-2.5 px-5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {grievanceSubmitting ? (
                      <span>Registering Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Stakeholder Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Tracking Look-Up Column (1 Col) */}
            <div className="space-y-6">
              {/* Check Status Widget */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-sky-600" />
                  <span>Track Existing Inquiry</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Enter your tracking ticket number to view live resolution updates from our site engineers.
                </p>

                <form onSubmit={handleTrackSubmit} className="space-y-2">
                  <input
                    type="text"
                    required
                    value={trackIdInput}
                    onChange={(e) => setTrackIdInput(e.target.value)}
                    placeholder="e.g. MEIL-PUB-2026-8912"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-mono outline-none focus:border-sky-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="w-full py-2 px-3 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    {trackingLoading ? 'Checking...' : 'Check Resolution Status'}
                  </button>
                </form>

                {trackError && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300">
                    {trackError}
                  </div>
                )}

                {trackedRecord && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sky-600">{trackedRecord.trackingId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {trackedRecord.status}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{trackedRecord.subject}</div>
                      <div className="text-slate-500 text-[11px]">{trackedRecord.category}</div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <strong>Resolution Note:</strong> {trackedRecord.responseETA}
                    </div>
                  </div>
                )}
              </div>

              {/* Citizen Contact Hotline */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 border border-sky-200 dark:border-sky-800 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-sky-600" />
                  <span>Direct Citizen Helpdesk</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Toll-Free: <strong>1800-6345-374</strong> (Mon-Sat, 9AM-6PM IST)
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  Email: <strong>esg.assurance@meil.in</strong>
                </div>
                <div className="text-slate-500 text-[11px] pt-1">
                  MEIL Corporate Office, Technocrat Estate, Balanagar, Hyderabad 500037
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PUBLIC REPORTS & DOWNLOADS ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
              <Download className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-900 dark:text-sky-200 leading-relaxed">
                <strong>Statutory Filing Downloads:</strong> All documents published here are compliant with SEBI circular requirements, verified with SHA-256 cryptographic hashes, and open to the public without registration or authentication.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reportsData.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                        {rep.format} • {rep.fileSize}
                      </span>
                      <span className="text-[11px] text-slate-400">{rep.publishedDate}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {rep.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rep.description}
                    </p>

                    <div className="pt-2 text-[10px] text-slate-400">
                      <strong>Assurance:</strong> {rep.assuranceAgency}
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-[#0F172A] rounded-lg border border-slate-200 dark:border-[#334155] text-[10px] font-mono break-all text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">SHA-256 Hash:</span><br />
                      {rep.sha256Hash}
                    </div>
                  </div>

                  <a
                    href={`/api/public/summary`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Public PDF Disclosure</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: FAQS ================= */}
        {activeTab === 'faq' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions for Common Citizens
              </h3>
              <p className="text-xs text-slate-500">
                Clear, transparent answers to environmental and community impact questions
              </p>
            </div>

            {faqsData.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2"
              >
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                  <span className="text-sky-600 font-mono">Q:</span>
                  <span>{item.q}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5 border-l-2 border-sky-500">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ================= 5. FOOTER ================= */}
      <footer className="w-full bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-[#334155] py-8 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              Megha Engineering & Infrastructures Limited (MEIL Group)
            </div>
            <div>
              Corporate Identity Number (CIN): U45200TG2006PLC050271 • SEBI Top 1000 Listed Infrastructure Group
            </div>
            <div>
              Registered Office: S-2, Technocrat Industrial Estate, Balanagar, Hyderabad, Telangana 500037
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
            >
              Corporate Staff Login
            </Link>
            <span>•</span>
            <a
              href="https://meil.in"
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
            >
              Corporate Website
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400">
          © 2026 Megha Engineering & Infrastructures Limited. Published under SEBI BRSR and BRSR Core Disclosure Framework.
        </div>
      </footer>
    </div>
  );
}
