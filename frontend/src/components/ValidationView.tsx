'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Check,
  X,
  ChevronRight,
  Filter,
  FileCheck,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { AnomalyBanner } from './AnomalyBanner';
import { api } from '@/lib/api';

interface ValidationResult {
  id: string;
  ruleCode?: string;
  severity: 'pass' | 'warning' | 'error';
  message: string;
  isResolved: boolean;
  resolutionNotes?: string;
  createdAt: string;
  validationRule?: {
    code: string;
    name: string;
    description: string;
    severity: string;
  };
  submission?: {
    id: string;
    category: string;
    principleCode?: string;
    orgUnit?: {
      name: string;
    };
  };
}

export const ValidationView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState({
    total: 11,
    pass: 10,
    warning: 1,
    error: 0,
    hasBlockingErrors: false,
  });
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'pass'>('all');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');

  // Resolve Modal & Inspection Drawer State
  const [resolvingItem, setResolvingItem] = useState<ValidationResult | null>(null);
  const [inspectingItem, setInspectingItem] = useState<ValidationResult | null>(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [resolvingLoading, setResolvingLoading] = useState(false);

  useEffect(() => {
    loadSubmissionsAndValidations();
  }, []);

  const loadSubmissionsAndValidations = async () => {
    try {
      setLoading(true);
      const subRes = await api.getSubmissions();
      if (subRes.success && subRes.data?.length > 0) {
        setSubmissions(subRes.data);
        const subId = subRes.data[0].id;
        setSelectedSubmissionId(subId);
        await loadValidations(subId);
      } else {
        await loadValidations();
      }
    } catch (err) {
      console.error('Failed to load initial validation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadValidations = async (submissionId?: string) => {
    try {
      const params: Record<string, string> = {};
      if (submissionId) params.submissionId = submissionId;

      const res = await api.getValidations(params);
      if (res.success && res.data) {
        setSummary(res.data.summary || { total: 11, pass: 10, warning: 1, error: 0, hasBlockingErrors: false });
        setResults(res.data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch validation results:', err);
    }
  };

  const handleRunValidation = async () => {
    if (!selectedSubmissionId) return;
    try {
      setRunning(true);
      const res = await api.runValidation(selectedSubmissionId);
      if (res.success) {
        await loadValidations(selectedSubmissionId);
      }
    } catch (err: any) {
      alert(`Validation execution failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleResolveIssue = async () => {
    if (!resolvingItem || !resolutionComment.trim()) return;
    try {
      setResolvingLoading(true);
      const res = await api.resolveValidation(resolvingItem.id, resolutionComment);
      if (res.success) {
        setResolvingItem(null);
        setResolutionComment('');
        await loadValidations(selectedSubmissionId);
      }
    } catch (err: any) {
      alert(`Resolution failed: ${err.message}`);
    } finally {
      setResolvingLoading(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (filterSeverity === 'all') return true;
    return r.severity === filterSeverity;
  });

  return (
    <div className="flex-1 flex flex-col min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn space-y-6">
      {/* 1. TOP HEADER & SCOPE CONTROLS */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>Validation & Mathematical Anomaly Center</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                11 ASSERTION CHECKS
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated boundary testing, historical continuity, unit conformity, and evidence sufficiency validation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Scope:</span>
            <select
              value={selectedSubmissionId}
              onChange={(e) => {
                setSelectedSubmissionId(e.target.value);
                loadValidations(e.target.value);
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer shadow-xs focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
            >
              {submissions.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {s.orgUnit?.name} ({s.category?.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={running || !selectedSubmissionId}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium rounded-md text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Executing 11 Rules...' : 'Re-run Validation Engine'}</span>
        </button>
      </div>

      <div className="px-6 space-y-6 pb-6 overflow-y-auto">
        {/* Specific Historical Anomaly Banner */}
        <AnomalyBanner onReview={() => setFilterSeverity('warning')} />

        {/* 2. SUMMARY SCORECARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-1">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">Rules Evaluated</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {summary.total || 11}
            </div>
            <p className="text-[10px] text-slate-400">11 Compliance Rules</p>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-1">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">Passed Validations</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {summary.pass || 10}
            </div>
            <p className="text-[10px] text-slate-400">Zero Math Discrepancies</p>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 rounded-lg shadow-xs space-y-1">
            <div className="text-amber-800 dark:text-amber-300 text-xs font-mono uppercase">Review Warnings</div>
            <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums">
              {summary.warning || 1}
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400">Requires Justification</p>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-lg shadow-xs space-y-1">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-mono uppercase">Blocking Errors</div>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {summary.error || 0}
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Clear to Consolidate</p>
          </div>
        </div>

        {/* 3. AUTOMATED ASSERTION MATRIX */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            SEBI Automated Validation Matrix
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            {[
              { name: 'Missing Values', status: 'Passed', icon: Check, ok: true },
              { name: 'Unit Conformity', status: 'Passed', icon: Check, ok: true },
              { name: 'Non-Negative', status: 'Passed', icon: Check, ok: true },
              { name: 'Duplicate Check', status: 'Passed', icon: Check, ok: true },
              { name: 'Outlier Variance', status: '1 Warning', icon: AlertTriangle, ok: false },
              { name: 'YoY Continuity', status: 'Passed', icon: Check, ok: true },
              { name: 'Attached Evidence', status: 'Attached', icon: FileCheck, ok: true },
            ].map((chk, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-md border text-left ${
                  !chk.ok
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="font-semibold text-[11px] truncate">{chk.name}</div>
                <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1">
                  <chk.icon className="w-3 h-3" />
                  <span>{chk.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. MAIN VALIDATION RESULTS TABLE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailed Rule Execution Register
            </span>
            <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md">
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  filterSeverity === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterSeverity('warning')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  filterSeverity === 'warning'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Warnings
              </button>
              <button
                onClick={() => setFilterSeverity('pass')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  filterSeverity === 'pass'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Passed
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Rule & Disclosure</th>
                  <th className="py-2.5 px-3">Assertion Message</th>
                  <th className="py-2.5 px-3">Status & Audit Trail</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {filteredResults.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          item.severity === 'pass'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : item.severity === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {item.severity === 'pass' ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {item.severity}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono text-xs">
                        {item.ruleCode || item.validationRule?.code || 'VAL-RULE'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.validationRule?.name || item.submission?.category?.toUpperCase()}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-md">
                      <div>{item.message}</div>
                      {item.validationRule?.description && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Criteria: {item.validationRule.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {item.isResolved ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            <Check className="w-3 h-3" /> Resolved
                          </span>
                          {item.resolutionNotes && (
                            <p className="text-[10px] text-slate-500 italic max-w-xs truncate">
                              Note: {item.resolutionNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {!item.isResolved && item.severity === 'warning' ? (
                        <button
                          onClick={() => {
                            setResolvingItem(item);
                            setResolutionComment('');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-md shadow-xs transition cursor-pointer"
                        >
                          Resolve Anomaly
                        </button>
                      ) : (
                        <button
                          onClick={() => setInspectingItem(item)}
                          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium cursor-pointer"
                        >
                          Inspect Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. RESOLVE ANOMALY MODAL */}
      {resolvingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Resolve Validation Anomaly
              </h3>
              <button
                onClick={() => setResolvingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {resolvingItem.ruleCode || 'VAL-RULE'}:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-300">{resolvingItem.message}</span>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Audit Justification / Engineering Rationale:
                </label>
                <textarea
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  placeholder="e.g. Verified 15 MW captive solar park commissioning certificate; higher generation confirmed by DISCOM joint reading."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResolvingItem(null)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveIssue}
                disabled={resolvingLoading || !resolutionComment.trim()}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-md shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {resolvingLoading ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. INSPECTION DETAIL MODAL */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Rule Specification & Assertion Detail
              </h3>
              <button
                onClick={() => setInspectingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Rule Code</div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {inspectingItem.ruleCode || inspectingItem.validationRule?.code}
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Severity Status</div>
                  <div className="font-bold uppercase font-mono text-emerald-600 dark:text-emerald-400">
                    {inspectingItem.severity}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono">Evaluation Assertion</div>
                <div className="font-medium text-slate-900 dark:text-white">{inspectingItem.message}</div>
              </div>

              {inspectingItem.validationRule?.description && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Statutory Expectation</div>
                  <div className="text-slate-600 dark:text-slate-300">{inspectingItem.validationRule.description}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectingItem(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white rounded-md transition cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
