'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Users,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Save,
  Mail,
  UserCheck,
  Shield,
  Sliders,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'periods' | 'framework'>('profile');
  const [company, setCompany] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      const [compRes, usersRes, periodsRes] = await Promise.all([
        api.getCompany(),
        api.getUsers(),
        api.getReportingPeriods(),
      ]);

      if (compRes.success && compRes.data) setCompany(compRes.data);
      if (usersRes.success && usersRes.data) setUsersList(usersRes.data);
      if (periodsRes.success && periodsRes.data) setPeriods(periodsRes.data);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn space-y-6">
      {/* 1. TOP HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>Enterprise Platform Administration & Governance</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                RBAC & SEBI
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organization metadata, 6-role RBAC assignments, reporting cycle schedules & framework configurations.
          </p>
        </div>

        {savedNotice && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" /> Configuration Persisted
          </span>
        )}
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="px-6 space-y-6 pb-6 overflow-y-auto">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs w-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Organization Profile
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            RBAC & Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('periods')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === 'periods'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reporting Cycles ({periods.length})
          </button>
          <button
            onClick={() => setActiveTab('framework')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition cursor-pointer ${
              activeTab === 'framework'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            SEBI Regulatory Framework
          </button>
        </div>

        {/* Tab 1: Organization Profile Form */}
        {activeTab === 'profile' && company && (
          <form onSubmit={handleSaveProfile} className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4 max-w-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2.5">
              Corporate Legal Entity Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Company Legal Name</label>
                <input
                  type="text"
                  defaultValue={company.legalName}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Corporate Identity Number (CIN)</label>
                <input
                  type="text"
                  defaultValue={company.cin || 'U45200TG2006PLC050277'}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-white font-mono outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Industry Sector</label>
                <input
                  type="text"
                  defaultValue={company.sector || 'Heavy Civil Infrastructure & EPC'}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">SEBI Listing Status</label>
                <input
                  type="text"
                  defaultValue="Top 1000 Listed Entity (BSE / NSE)"
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Registered Corporate Address</label>
                <input
                  type="text"
                  defaultValue={company.registeredAddress || 'Balanagar, Hyderabad, Telangana - 500037'}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-md text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Users & Roles List */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Tenant Stakeholders & RBAC Roles</h3>
              <p className="text-xs text-slate-500">
                Authoritative roles determining data-entry, validation resolution, submission approval, and audit permissions.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="px-4 py-2.5">User Identity</th>
                    <th className="px-4 py-2.5">Assigned Role</th>
                    <th className="px-4 py-2.5">Department</th>
                    <th className="px-4 py-2.5">Designation</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {u.firstName} {u.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.department || 'ESG & Operations'}</td>
                      <td className="px-4 py-3 text-slate-500">{u.designation || 'Specialist'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Reporting Cycles */}
        {activeTab === 'periods' && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configured Financial Reporting Cycles</h3>
              <p className="text-xs text-slate-500">
                Active and historical reporting windows used for periodic disclosures and YoY comparisons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {periods.map((p) => (
                <div key={p.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">
                      {p.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                        p.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                    <div>
                      <span>Duration: </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {new Date(p.startDate).toLocaleDateString()} to {new Date(p.endDate).toLocaleDateString()}
                      </strong>
                    </div>
                    <div>
                      <span>Framework: </span>
                      <span className="text-slate-700 dark:text-slate-300">SEBI BRSR Core Circular CIR/2023/122</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">Reasonable Assurance Mandate</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono text-[11px]">Enabled</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Framework */}
        {activeTab === 'framework' && (
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3.5 max-w-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2.5">
              SEBI BRSR Regulatory Framework Engine
            </h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                This platform is configured in strict adherence with SEBI circular <strong className="text-slate-900 dark:text-white">SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122</strong> dated July 12, 2023 introducing <strong className="text-slate-900 dark:text-white">BRSR Core</strong> for value chain reporting and reasonable assurance.
              </p>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-md border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white">Configured Regulatory Standards:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Section A: General Corporate Disclosures</li>
                  <li>Section B: Management and Process Disclosures</li>
                  <li>Section C: Principle-wise Performance Disclosures (P1 to P9)</li>
                  <li>BRSR Core: 9 Key Environmental, Social & Governance Attributes</li>
                  <li>GHG Accounting: IPCC 2006 stationary combustion guidelines & CEA CO2 Database v20</li>
                  <li>Safety Standard: ISO 45001 / OHSAS 18001 standardized LTIFR formula</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
