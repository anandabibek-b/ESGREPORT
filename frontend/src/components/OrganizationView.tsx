'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle2,
  FolderTree,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

interface OrgUnit {
  id: string;
  name: string;
  code?: string;
  city?: string;
  state?: string;
  country?: string;
  type: {
    id: string;
    name: string;
    level: number;
  };
  parent?: {
    id: string;
    name: string;
  };
  children?: Array<{
    id: string;
    name: string;
  }>;
}

export const OrganizationView: React.FC = () => {
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgRes, compRes] = await Promise.all([
        api.getOrgUnits(),
        api.getCompany(),
      ]);

      if (orgRes.success && orgRes.data) {
        setOrgUnits(orgRes.data);
      }
      if (compRes.success && compRes.data) {
        setCompany(compRes.data);
      }
    } catch (err) {
      console.error('Failed to load organization hierarchy:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = orgUnits.filter((unit) => {
    if (levelFilter !== 'all' && unit.type.level.toString() !== levelFilter) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      unit.name.toLowerCase().includes(q) ||
      (unit.code && unit.code.toLowerCase().includes(q)) ||
      (unit.city && unit.city.toLowerCase().includes(q)) ||
      (unit.state && unit.state.toLowerCase().includes(q)) ||
      unit.type.name.toLowerCase().includes(q)
    );
  });

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent';
      case 2:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
      case 3:
        return 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn space-y-6">
      {/* 1. TOP HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>Organizational Hierarchy & Entity Consolidation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                TENANT ISOLATED
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Corporate Group → Subsidiaries → Business Units → Project Sites multi-tier reporting boundary.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Structure</span>
        </button>
      </div>

      <div className="px-6 space-y-6 pb-6 overflow-y-auto">
        {/* 2. CORPORATE PROFILE CARD */}
        {company && (
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    CIN: {company.cin || 'U45200TG2006PLC050277'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    SEBI Top 1000 Listed Entity
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Sector: {company.sector || 'Heavy Civil Infrastructure & EPC'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{company.legalName}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Corporate Headquarters: {company.registeredAddress || 'Balanagar, Hyderabad, Telangana - 500037'}</span>
                </p>
              </div>

              {/* High-level stats */}
              <div className="flex items-center gap-8 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-8">
                <div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">250+</div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Project Sites</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">9</div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">BRSR Principles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">100%</div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Core Coverage</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FILTER CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search units by name, site code, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Hierarchy Level:</span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer shadow-xs focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            >
              <option value="all">All Levels ({orgUnits.length})</option>
              <option value="1">Level 1: Corporate HQ</option>
              <option value="2">Level 2: Subsidiaries</option>
              <option value="3">Level 3: Business Units</option>
              <option value="4">Level 4: Locations / Projects</option>
            </select>
          </div>
        </div>

        {/* 4. ORG UNIT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono ${getLevelBadge(
                      unit.type.level
                    )}`}
                  >
                    Level {unit.type.level}: {unit.type.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{unit.code || 'MEIL'}</span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{unit.name}</h3>

                {unit.parent && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="text-slate-400">Parent:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{unit.parent.name}</span>
                  </div>
                )}

                {(unit.city || unit.state) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {unit.city ? `${unit.city}, ` : ''}
                      {unit.state || unit.country}
                    </span>
                  </div>
                )}
              </div>

              {/* Sub-entities counter & reporting status */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  {unit.children && unit.children.length > 0
                    ? `${unit.children.length} Reporting Units`
                    : 'Operational Project Site'}
                </span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-[10px] font-mono">
                  <Check className="w-3 h-3" /> Tenant Isolated
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
