'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, RotateCcw, ChevronRight, ShieldAlert } from 'lucide-react';

interface AnomalyBannerProps {
  onReview?: () => void;
}

export const AnomalyBanner: React.FC<AnomalyBannerProps> = ({ onReview }) => {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'correction_requested'>('pending');
  const [showDetails, setShowDetails] = useState(false);

  const handleAccept = () => {
    setStatus('accepted');
  };

  const handleRequestCorrection = () => {
    setStatus('correction_requested');
  };

  return (
    <div className="w-full rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 shadow-xs transition-colors duration-200 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Section: Icon & Alert Message */}
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                Statistical Anomaly Detected
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Rule VAL-008 • Project: Zojila Tunnel Site • Metric: Energy (MWh)
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
              July electricity consumption is significantly higher (+595%) than the 3-month trailing average.
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
              Trailing Trend: Apr 1,200 MWh → May 1,250 MWh → Jun 1,280 MWh →{' '}
              <span className="font-bold text-amber-800 dark:text-amber-300 underline decoration-amber-400">
                Jul 8,900 MWh
              </span>
            </p>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end pt-1 lg:pt-0">
          {status === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowDetails(!showDetails);
                  if (onReview) onReview();
                }}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Inspect Historical Data</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept with Justification</span>
              </button>

              <button
                type="button"
                onClick={handleRequestCorrection}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Site Recheck</span>
              </button>
            </>
          )}

          {status === 'accepted' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Accepted: Verified against 15 MW captive solar park commissioning certificate</span>
            </div>
          )}

          {status === 'correction_requested' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium">
              <RotateCcw className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Correction requested: Re-verification ticket dispatched to Site Lead Ravi</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
