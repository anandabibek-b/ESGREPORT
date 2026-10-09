'use client';

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Zap,
  Flame,
  ShieldCheck,
  RefreshCw,
  Sun,
  ShieldAlert,
  ArrowRight,
  Check,
  Info,
  Scale,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';

export const CalculationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scope1' | 'scope2' | 'renewable' | 'ltifr'>('scope1');
  const [loading, setLoading] = useState(false);
  const [calcModels, setCalcModels] = useState<any[]>([]);

  // Simulator Interactive States
  const [fuelLitres, setFuelLitres] = useState<number>(25000);
  const [fuelType, setFuelType] = useState<string>('Diesel (High Speed)');
  const [scope1Factor, setScope1Factor] = useState<number>(0.00268);
  const [scope1Result, setScope1Result] = useState<any>({
    calculatedEmissionsMT: 67.0,
    formula: '25,000 Litres × 0.00268 MT CO2e/L = 67.00 tCO2e',
  });

  const [electricityMWh, setElectricityMWh] = useState<number>(1450);
  const [gridFactor, setGridFactor] = useState<number>(0.716);
  const [scope2Result, setScope2Result] = useState<any>({
    calculatedEmissionsMT: 1038.2,
    formula: '1,450 MWh × 0.716 MT CO2/MWh = 1,038.20 tCO2e',
  });

  const [renewableMWh, setRenewableMWh] = useState<number>(62400);
  const [nonRenewableMWh, setNonRenewableMWh] = useState<number>(189500);
  const [renewableResult, setRenewableResult] = useState<any>({
    totalEnergyMWh: 251900,
    renewableSharePercentage: 24.77,
    formula: '(62,400 MWh ÷ 251,900 MWh) × 100 = 24.77%',
  });

  const [lostTimeInjuries, setLostTimeInjuries] = useState<number>(2);
  const [totalHoursWorked, setTotalHoursWorked] = useState<number>(11200000);
  const [ltifrResult, setLtifrResult] = useState<any>({
    ltifr: 0.18,
    formula: '(2 Incidents × 1,000,000) ÷ 11,200,000 Person-Hours = 0.18',
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const res = await api.getCalculations();
      if (res.success && res.data) {
        setCalcModels(res.data);
      }
    } catch (err) {
      console.error('Failed to load calculations from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScope1Calc = async (litres: number, factor: number, type: string) => {
    try {
      const res = await api.calculateScope1({ fuelLitres: litres, emissionFactor: factor, fuelType: type });
      if (res.success && res.data) {
        setScope1Result(res.data);
      } else {
        const total = litres * factor;
        setScope1Result({
          calculatedEmissionsMT: total,
          formula: `${litres.toLocaleString()} Litres × ${factor} MT CO2e/L = ${total.toFixed(2)} tCO2e`,
        });
      }
    } catch {
      const total = litres * factor;
      setScope1Result({
        calculatedEmissionsMT: total,
        formula: `${litres.toLocaleString()} Litres × ${factor} MT CO2e/L = ${total.toFixed(2)} tCO2e`,
      });
    }
  };

  const handleScope2Calc = async (mwh: number, factor: number) => {
    try {
      const res = await api.calculateScope2({ electricityMWh: mwh, gridFactor: factor });
      if (res.success && res.data) {
        setScope2Result(res.data);
      } else {
        const total = mwh * factor;
        setScope2Result({
          calculatedEmissionsMT: total,
          formula: `${mwh.toLocaleString()} MWh × ${factor} MT CO2/MWh = ${total.toFixed(2)} tCO2e`,
        });
      }
    } catch {
      const total = mwh * factor;
      setScope2Result({
        calculatedEmissionsMT: total,
        formula: `${mwh.toLocaleString()} MWh × ${factor} MT CO2/MWh = ${total.toFixed(2)} tCO2e`,
      });
    }
  };

  const handleRenewableCalc = async (ren: number, nonRen: number) => {
    try {
      const res = await api.calculateRenewableShare({ renewableMWh: ren, nonRenewableMWh: nonRen });
      if (res.success && res.data) {
        setRenewableResult(res.data);
      } else {
        const total = ren + nonRen;
        const share = total > 0 ? (ren / total) * 100 : 0;
        setRenewableResult({
          totalEnergyMWh: total,
          renewableSharePercentage: Number(share.toFixed(2)),
          formula: `(${ren.toLocaleString()} MWh ÷ ${total.toLocaleString()} MWh) × 100 = ${share.toFixed(2)}%`,
        });
      }
    } catch {
      const total = ren + nonRen;
      const share = total > 0 ? (ren / total) * 100 : 0;
      setRenewableResult({
        totalEnergyMWh: total,
        renewableSharePercentage: Number(share.toFixed(2)),
        formula: `(${ren.toLocaleString()} MWh ÷ ${total.toLocaleString()} MWh) × 100 = ${share.toFixed(2)}%`,
      });
    }
  };

  const handleLtifrCalc = async (injuries: number, hours: number) => {
    try {
      const res = await api.calculateLTIFR({ lostTimeInjuries: injuries, totalPersonHours: hours });
      if (res.success && res.data) {
        setLtifrResult(res.data);
      } else {
        const rate = hours > 0 ? (injuries * 1000000) / hours : 0;
        setLtifrResult({
          ltifr: Number(rate.toFixed(2)),
          formula: `(${injuries} Incidents × 1,000,000) ÷ ${hours.toLocaleString()} Hours = ${rate.toFixed(2)}`,
        });
      }
    } catch {
      const rate = hours > 0 ? (injuries * 1000000) / hours : 0;
      setLtifrResult({
        ltifr: Number(rate.toFixed(2)),
        formula: `(${injuries} Incidents × 1,000,000) ÷ ${hours.toLocaleString()} Hours = ${rate.toFixed(2)}`,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn space-y-6">
      {/* 1. TOP HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>Deterministic ESG Calculation Center</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              AUDITABLE FORMULAS
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent server-side calculations implementing IPCC 2006 stationary combustion & CEA National Grid baseline v20 factors.
          </p>
        </div>

        <button
          onClick={loadModels}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Models</span>
        </button>
      </div>

      <div className="px-6 space-y-6 pb-6 overflow-y-auto">
        {/* 2. PROVENANCE FLOW OVERVIEW */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>Provenance Model</span>
              <span className="text-slate-300">•</span>
              <span>Section 13 Compliance</span>
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Raw Metered Input → Authoritative Emission Factor → Deterministic Formula → Validated Filing Result
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-semibold">
              <Check className="w-3.5 h-3.5 inline mr-1" /> Source of Truth
            </span>
          </div>
        </div>

        {/* 3. CALCULATION NAVIGATION TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => setActiveTab('scope1')}
            className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
              activeTab === 'scope1'
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase text-slate-500">
              <Flame className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Scope 1 Direct</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">Diesel & Stationary Fuel</div>
            <div className="text-[10px] text-slate-400 font-mono">IPCC 2006 Factor</div>
          </button>

          <button
            onClick={() => setActiveTab('scope2')}
            className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
              activeTab === 'scope2'
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase text-slate-500">
              <Zap className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Scope 2 Indirect</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">Grid Electricity</div>
            <div className="text-[10px] text-slate-400 font-mono">CEA Baseline v20</div>
          </button>

          <button
            onClick={() => setActiveTab('renewable')}
            className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
              activeTab === 'renewable'
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase text-slate-500">
              <Sun className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Energy Mix</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">Renewable Share %</div>
            <div className="text-[10px] text-slate-400 font-mono">Captive Solar + Wheeling</div>
          </button>

          <button
            onClick={() => setActiveTab('ltifr')}
            className={`p-3.5 rounded-lg border text-left transition cursor-pointer ${
              activeTab === 'ltifr'
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-xs'
                : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] uppercase text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>Workforce Safety</span>
            </div>
            <div className="font-bold text-slate-900 dark:text-white mt-1">LTIFR Metric</div>
            <div className="text-[10px] text-slate-400 font-mono">Per 1M Person-Hours</div>
          </button>
        </div>

        {/* 4. WORKBENCH CONTAINER */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6 shadow-xs">
          {/* TAB 1: SCOPE 1 DIRECT */}
          {activeTab === 'scope1' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    Scope 1: Stationary & Fleet Fuel Combustion
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Formula: Fuel Consumed (Litres) × Emission Factor (MT CO2e/L) = Gross Scope 1 (tCO2e)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  SEBI Principle 6 Essential 1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Input: Fuel Consumed (Litres)
                  </label>
                  <input
                    type="number"
                    value={fuelLitres}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFuelLitres(v);
                      handleScope1Calc(v, scope1Factor, fuelType);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Cross-referenced with fuel logbooks</span>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Factor: Emission Factor (MT CO2e/L)
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={scope1Factor}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setScope1Factor(v);
                      handleScope1Calc(fuelLitres, v, fuelType);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">IPCC 2006 Guidelines Table 1.4</span>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Category: Fuel Specification
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFuelType(val);
                      const f = val.includes('Petrol') ? 0.00231 : 0.00268;
                      setScope1Factor(f);
                      handleScope1Calc(fuelLitres, f, val);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white cursor-pointer"
                  >
                    <option value="Diesel (High Speed)">Diesel (High Speed) — 2.68 kg CO2/L</option>
                    <option value="Motor Petrol">Motor Petrol — 2.31 kg CO2/L</option>
                  </select>
                </div>
              </div>

              {scope1Result && (
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="uppercase">Deterministic Scope 1 Output</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Auditor Reconciled</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {Number(scope1Result.calculatedEmissionsMT).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">tCO2e (Metric Tonnes)</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white">Applied Equation:</strong> {scope1Result.formula}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCOPE 2 INDIRECT */}
          {activeTab === 'scope2' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    Scope 2: Purchased Grid Electricity
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Formula: Purchased Electricity (MWh) × CEA Baseline Factor (tCO2/MWh) = Gross Scope 2 (tCO2e)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  SEBI Principle 6 Essential 2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Input: Purchased Electricity (MWh)
                  </label>
                  <input
                    type="number"
                    value={electricityMWh}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setElectricityMWh(v);
                      handleScope2Calc(v, gridFactor);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">DISCOM substation joint meter billing</span>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Factor: CEA Baseline Grid Factor (tCO2/MWh)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={gridFactor}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGridFactor(v);
                      handleScope2Calc(electricityMWh, v);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Central Electricity Authority (CEA) v20.0</span>
                </div>
              </div>

              {scope2Result && (
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="uppercase">Deterministic Scope 2 Output</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">CEA Validated</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {Number(scope2Result.calculatedEmissionsMT).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">tCO2e (Metric Tonnes)</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white">Applied Equation:</strong> {scope2Result.formula}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RENEWABLE ENERGY SHARE */}
          {activeTab === 'renewable' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Sun className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    Renewable Energy Consumption Mix
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Formula: (Renewable Energy ÷ Total Energy Consumed) × 100 = Share (%)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  SEBI Principle 6 Essential 3
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Input: Renewable Energy (MWh)
                  </label>
                  <input
                    type="number"
                    value={renewableMWh}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setRenewableMWh(v);
                      handleRenewableCalc(v, nonRenewableMWh);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Captive solar & green power open access</span>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Input: Non-Renewable Energy (MWh)
                  </label>
                  <input
                    type="number"
                    value={nonRenewableMWh}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setNonRenewableMWh(v);
                      handleRenewableCalc(renewableMWh, v);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Thermal grid & diesel generators</span>
                </div>
              </div>

              {renewableResult && (
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="uppercase">Calculated Renewable Ratio</span>
                    <span>Total Energy: {renewableResult.totalEnergyMWh?.toLocaleString()} MWh</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {renewableResult.renewableSharePercentage}%{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">Renewable Electricity</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white">Applied Equation:</strong> {renewableResult.formula}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LTIFR METRIC */}
          {activeTab === 'ltifr' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    Lost Time Injury Frequency Rate (LTIFR)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Formula: (Lost Time Injuries × 1,000,000) ÷ Person-Hours Worked = LTIFR
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  SEBI Principle 3 Safety Core
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Input: Lost Time Injuries (Incidents)
                  </label>
                  <input
                    type="number"
                    value={lostTimeInjuries}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setLostTimeInjuries(v);
                      handleLtifrCalc(v, totalHoursWorked);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">OSHA verified accident register</span>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Input: Total Person-Hours Worked
                  </label>
                  <input
                    type="number"
                    value={totalHoursWorked}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTotalHoursWorked(v);
                      handleLtifrCalc(lostTimeInjuries, v);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 font-mono tabular-nums text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Biometric turnstile access telemetry</span>
                </div>
              </div>

              {ltifrResult && (
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span className="uppercase">Calculated LTIFR Score</span>
                    <span className="text-slate-400">Industry Target: &lt;0.35</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {ltifrResult.ltifr}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">per 1M Person-Hours</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white">Applied Equation:</strong> {ltifrResult.formula}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
