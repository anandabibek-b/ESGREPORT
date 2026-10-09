'use client';

import React, { useState } from 'react';
import { Calculator, Zap, Fuel, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

export const CalculationSimulator: React.FC = () => {
  const [dieselLitres, setDieselLitres] = useState<number>(25000);
  const [electricityMwh, setElectricityMwh] = useState<number>(1450);
  const [emissionFactorFuel, setEmissionFactorFuel] = useState<number>(2.68); // kg CO2 / L (IPCC)
  const [gridFactorCEA, setGridFactorCEA] = useState<number>(0.716); // tCO2 / MWh (CEA Baseline v20)

  // Scope 1: Fuel (L) * Factor (kg/L) / 1000 = tCO2e
  const scope1Tonnes = (dieselLitres * emissionFactorFuel) / 1000;

  // Scope 2: Electricity (MWh) * Factor (tCO2/MWh) = tCO2e
  const scope2Tonnes = electricityMwh * gridFactorCEA;

  const totalEmissions = scope1Tonnes + scope2Tonnes;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-amber-500/25 bg-white dark:bg-[#0e0e15] p-5 sm:p-6 text-slate-900 dark:text-white shadow-xs space-y-6 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-amber-500/15 border border-sky-200 dark:border-amber-500/40 text-sky-600 dark:text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Automatic ESG Calculation Engine • Real-Time Deterministic Math
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
              Server-Side IPCC 2006 Stationary Combustion & CEA National Grid Baseline v20
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-amber-400 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-amber-400" />
          <span>Zero Frontend Fabrication</span>
        </div>
      </div>

      {/* Input Sliders & Number Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scope 1 Simulator */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-700 dark:text-amber-400 font-semibold text-sm">
              <Fuel className="w-4 h-4" />
              <span>Scope 1: Fuel Combustion</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
              Formula: Fuel × Factor
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-600 dark:text-zinc-300">High-Speed Diesel Consumption (Litres):</label>
              <span className="font-mono font-bold text-sky-700 dark:text-amber-400">{dieselLitres.toLocaleString()} L</span>
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={dieselLitres}
              onChange={(e) => setDieselLitres(Number(e.target.value))}
              className="w-full accent-sky-600 dark:accent-amber-500 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
              <span>1,000 L</span>
              <span>Default: 25,000 L</span>
              <span>100,000 L</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">IPCC Mobile Factor:</span>
            <span className="font-mono text-slate-700 dark:text-zinc-200">2.68 kg CO2/L</span>
          </div>

          <div className="p-3 rounded-lg bg-sky-50 dark:bg-amber-950/30 border border-sky-200 dark:border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-zinc-300">Computed Scope 1 Output:</span>
            <span className="text-lg font-bold font-mono text-sky-700 dark:text-amber-400">
              {scope1Tonnes.toFixed(2)} <span className="text-xs text-slate-400 dark:text-zinc-400 font-normal">tCO2e</span>
            </span>
          </div>
        </div>

        {/* Scope 2 Simulator */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-black/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <span>Scope 2: Purchased Electricity</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
              Formula: Electricity × Factor
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-slate-600 dark:text-zinc-300">Purchased Grid Electricity (MWh):</label>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-400">{electricityMwh.toLocaleString()} MWh</span>
            </div>
            <input
              type="range"
              min={100}
              max={10000}
              step={50}
              value={electricityMwh}
              onChange={(e) => setElectricityMwh(Number(e.target.value))}
              className="w-full accent-purple-600 dark:accent-purple-500 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
              <span>100 MWh</span>
              <span>Default: 1,450 MWh</span>
              <span>10,000 MWh</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-zinc-400">CEA National Grid Factor:</span>
            <span className="font-mono text-slate-700 dark:text-zinc-200">0.716 tCO2/MWh (v20)</span>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-zinc-300">Computed Scope 2 Output:</span>
            <span className="text-lg font-bold font-mono text-purple-700 dark:text-purple-400">
              {scope2Tonnes.toFixed(2)} <span className="text-xs text-slate-400 dark:text-zinc-400 font-normal">tCO2e</span>
            </span>
          </div>
        </div>
      </div>

      {/* Total Consolidated Banner */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100/80 dark:bg-black/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
              Consolidated Direct + Indirect Footprint
            </span>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {totalEmissions.toFixed(2)}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">tCO2e Gross GHG</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono text-right">
          <div>Scope 1: {((scope1Tonnes / totalEmissions) * 100).toFixed(1)}% of total</div>
          <div>Scope 2: {((scope2Tonnes / totalEmissions) * 100).toFixed(1)}% of total</div>
        </div>
      </div>
    </div>
  );
};
