'use client';

import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  BarChart3,
  Flame,
  Zap,
  Droplets,
  Trash2,
  Users,
  ShieldAlert,
  HeartHandshake,
  Layers,
  Check,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

type TimeDimension = 'monthly' | 'quarterly' | 'yearly';
type EntityDimension = 'group' | 'subsidiary' | 'bu';

export const ComparisonView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [currPeriodId, setCurrPeriodId] = useState<string>('');
  const [prevPeriodId, setPrevPeriodId] = useState<string>('');
  const [filterQuery, setFilterQuery] = useState('');

  const [timeDimension, setTimeDimension] = useState<TimeDimension>('yearly');
  const [entityDimension, setEntityDimension] = useState<EntityDimension>('group');

  useEffect(() => {
    loadPeriodsAndComparison();
  }, []);

  const loadPeriodsAndComparison = async () => {
    try {
      setLoading(true);
      const pRes = await api.getReportingPeriods();
      if (pRes.success && pRes.data && pRes.data.length >= 2) {
        setPeriods(pRes.data);
        const curr = pRes.data[0].id;
        const prev = pRes.data[1].id;
        setCurrPeriodId(curr);
        setPrevPeriodId(prev);
        await fetchComparison(curr, prev);
      } else {
        await fetchComparison();
      }
    } catch (err) {
      console.error('Failed to load period comparison data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (curr?: string, prev?: string) => {
    try {
      setLoading(true);
      const res = await api.comparePeriods(curr, prev);
      if (res.success && res.data) {
        setComparisonData(res.data);
      }
    } catch (err) {
      console.error('Comparison fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newCurr: string, newPrev: string) => {
    setCurrPeriodId(newCurr);
    setPrevPeriodId(newPrev);
    fetchComparison(newCurr, newPrev);
  };

  const metrics = comparisonData?.metrics || [];
  const filteredMetrics = metrics.filter((m: any) => {
    if (!filterQuery) return true;
    const text = `${m.metricCode} ${m.name} ${m.unit}`.toLowerCase();
    return text.includes(filterQuery.toLowerCase());
  });

  const analyticsStreams = [
    {
      id: 'emissions',
      title: 'Carbon Footprint',
      subtitle: 'Scope 1 Direct & Scope 2 CEA Grid Baseline',
      icon: <Flame className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
      currVal: '14,480 tCO2e',
      prevVal: '16,210 tCO2e',
      variance: '-10.7%',
      favorable: true,
      breakdown: [
        { label: 'Scope 1 Stationary Diesel', val: '4,180 t', pct: 29 },
        { label: 'Scope 2 Purchased Grid', val: '10,300 t', pct: 71 },
      ],
      monthlyData: [
        { p: 'Apr', v: 1210 }, { p: 'May', v: 1190 }, { p: 'Jun', v: 1220 },
        { p: 'Jul', v: 1180 }, { p: 'Aug', v: 1205 }, { p: 'Sep', v: 1175 },
      ],
    },
    {
      id: 'energy',
      title: 'Energy Consumption',
      subtitle: 'Captive Solar vs State Grid Supply',
      icon: <Zap className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
      currVal: '28,450 MWh',
      prevVal: '32,100 MWh',
      variance: '-11.4%',
      favorable: true,
      breakdown: [
        { label: 'Renewable Captive Solar', val: '11,380 MWh', pct: 40 },
        { label: 'Conventional Grid Power', val: '17,070 MWh', pct: 60 },
      ],
      monthlyData: [
        { p: 'Apr', v: 4800 }, { p: 'May', v: 4920 }, { p: 'Jun', v: 4710 },
        { p: 'Jul', v: 4650 }, { p: 'Aug', v: 4620 }, { p: 'Sep', v: 4750 },
      ],
    },
    {
      id: 'water',
      title: 'Water Management',
      subtitle: 'Withdrawal & Zero Liquid Discharge (ZLD)',
      icon: <Droplets className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
      currVal: '184,200 kL',
      prevVal: '215,000 kL',
      variance: '-14.3%',
      favorable: true,
      breakdown: [
        { label: 'Recycled & Reused', val: '77,364 kL', pct: 42 },
        { label: 'Freshwater Extraction', val: '106,836 kL', pct: 58 },
      ],
      monthlyData: [
        { p: 'Apr', v: 31500 }, { p: 'May', v: 32000 }, { p: 'Jun', v: 30800 },
        { p: 'Jul', v: 29900 }, { p: 'Aug', v: 30100 }, { p: 'Sep', v: 29900 },
      ],
    },
    {
      id: 'safety',
      title: 'Workforce Safety (LTIFR)',
      subtitle: 'Lost Time Incident Rate per 1M Man-Hours',
      icon: <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
      currVal: '0.14 LTIFR',
      prevVal: '0.25 LTIFR',
      variance: '-44.0%',
      favorable: true,
      breakdown: [
        { label: 'Zero Fatalities Target', val: '100% Met', pct: 100 },
        { label: 'Safety Permit Audits', val: '98.8%', pct: 99 },
      ],
      monthlyData: [
        { p: 'Apr', v: 0.22 }, { p: 'May', v: 0.19 }, { p: 'Jun', v: 0.18 },
        { p: 'Jul', v: 0.16 }, { p: 'Aug', v: 0.15 }, { p: 'Sep', v: 0.14 },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 text-slate-900 dark:text-slate-100 overflow-hidden space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP HEADER & MULTI-DIMENSIONAL SELECTORS */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>ESG Multi-Period Comparative Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                  YEAR-OVER-YEAR
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Benchmark trends across Carbon, Energy, Water, Diversity, and Health & Safety.
              </p>
            </div>
          </div>
        </div>

        {/* Dimension Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Dimension */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs">
            <span className="text-[10px] text-slate-500 px-2 font-mono uppercase">Time:</span>
            {(['monthly', 'quarterly', 'yearly'] as TimeDimension[]).map((td) => (
              <button
                key={td}
                onClick={() => setTimeDimension(td)}
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition ${
                  timeDimension === td
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {td}
              </button>
            ))}
          </div>

          {/* Org Hierarchy */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs">
            <span className="text-[10px] text-slate-500 px-2 font-mono uppercase">Scope:</span>
            {(['group', 'subsidiary', 'bu'] as EntityDimension[]).map((ed) => (
              <button
                key={ed}
                onClick={() => setEntityDimension(ed)}
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition ${
                  entityDimension === ed
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ed === 'bu' ? 'Business Unit' : ed}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-md text-xs border border-slate-200 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currPeriodId}
              onChange={(e) => handlePeriodChange(e.target.value, prevPeriodId)}
              className="bg-transparent text-slate-900 dark:text-white border-none focus:outline-none font-medium cursor-pointer text-xs"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {p.name}
                </option>
              ))}
            </select>
            <span className="text-slate-400 font-mono">vs</span>
            <select
              value={prevPeriodId}
              onChange={(e) => handlePeriodChange(currPeriodId, e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white border-none focus:outline-none font-medium cursor-pointer text-xs"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchComparison(currPeriodId, prevPeriodId)}
            className="p-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-xs"
            title="Refresh comparison"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL STREAM CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Operational Variance Streams ({timeDimension.toUpperCase()} • {entityDimension.toUpperCase()})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {comparisonData?.currentPeriod || 'FY 2024-25'} vs {comparisonData?.previousPeriod || 'FY 2023-24'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {analyticsStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {stream.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{stream.title}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      stream.favorable
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {stream.variance.startsWith('-') ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {stream.variance}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{stream.subtitle}</p>

                {/* Values Comparison */}
                <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Current</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                      {stream.currVal}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Prior</div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums">{stream.prevVal}</div>
                  </div>
                </div>

                {/* Sub-breakdown Bars */}
                <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {stream.breakdown.map((item, bIdx) => (
                    <div key={bIdx} className="space-y-0.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 truncate max-w-[140px]">{item.label}</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">{item.val}</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 dark:bg-slate-200 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. COMPARISON DATA TABLE & ANOMALY DETECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              BRSR Core Disclosures Variance Matrix
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search parameter, code or unit..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px] font-mono">
              <tr>
                <th className="px-4 py-2.5">Metric / Disclosure</th>
                <th className="px-4 py-2.5">Unit</th>
                <th className="px-4 py-2.5 text-right font-mono">{comparisonData?.previousPeriod || 'FY 2023-24'}</th>
                <th className="px-4 py-2.5 text-right font-mono">{comparisonData?.currentPeriod || 'FY 2024-25'}</th>
                <th className="px-4 py-2.5 text-right">Absolute Change</th>
                <th className="px-4 py-2.5 text-right">% Change</th>
                <th className="px-4 py-2.5 text-center">Validation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Consolidating comparative datasets...
                  </td>
                </tr>
              ) : filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No matching comparison metrics found.
                  </td>
                </tr>
              ) : (
                filteredMetrics.map((m: any, idx: number) => {
                  const absChange = Number(m.absoluteChange);
                  const pct = m.percentageChange;
                  const isSignificant = Math.abs(parseFloat(pct)) > 15;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{m.metricCode}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.unit || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500 tabular-nums">
                        {Number(m.previousValue).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white font-bold tabular-nums">
                        {Number(m.currentValue).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {absChange > 0 ? `+${absChange.toLocaleString()}` : absChange.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            pct !== 'N/A' && parseFloat(pct) > 0
                              ? 'text-slate-900 dark:text-white font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {pct !== 'N/A' ? `${parseFloat(pct) > 0 ? '+' : ''}${pct}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isSignificant ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Review Anomaly
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Nominal Variance
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
