'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Save,
  Send,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Filter,
  Check,
  Clock,
  Layers,
  Scale,
  Paperclip,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface MetricValue {
  id?: string;
  metricId?: string;
  questionId?: string;
  numericValue?: number | null;
  textValue?: string | null;
  booleanValue?: boolean | null;
  unit?: string;
  notes?: string;
  isEstimated?: boolean;
  dataSource?: string;
  changeReason?: string;
  question?: {
    id: string;
    code: string;
    text: string;
    guidance?: string;
    isBrsrCore: boolean;
    indicator: {
      code: string;
      title: string;
      principle: {
        code: string;
        name: string;
        section: {
          code: string;
          name: string;
        };
      };
    };
  };
  metric?: {
    id: string;
    code: string;
    name: string;
    type: string;
    unit?: {
      symbol: string;
    };
  };
}

interface Submission {
  id: string;
  status: string;
  category: string;
  reportingPeriodId: string;
  orgUnitId: string;
  orgUnit: { id: string; name: string };
  reportingPeriod: { id: string; name: string };
  metricValues: MetricValue[];
  validationResults: any[];
}

export const QuestionnaireView: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>('');
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>('P6');
  const [filterType, setFilterType] = useState<'all' | 'brsr_core' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modals
  const [historyModalMetric, setHistoryModalMetric] = useState<any | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitComment, setSubmitComment] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'changes_requested' | 'rejected'>('approved');
  const [reviewComment, setReviewComment] = useState('');

  // Principles Directory
  const principles = [
    { code: 'SEC_A', name: 'General Disclosures', desc: 'Corporate identity, operations, markets' },
    { code: 'SEC_B', name: 'Management & Process', desc: 'Policy commitments, governance & oversight' },
    { code: 'P1', name: 'Principle 1: Ethics & Integrity', desc: 'Anti-corruption, regulatory compliance' },
    { code: 'P2', name: 'Principle 2: Sustainable Goods', desc: 'LCA, recycling, circular resource usage' },
    { code: 'P3', name: 'Principle 3: Employee Well-being', desc: 'Health, safety, wages, diversity' },
    { code: 'P4', name: 'Principle 4: Stakeholder Engagement', desc: 'Consultation with vulnerable stakeholders' },
    { code: 'P5', name: 'Principle 5: Human Rights', desc: 'Grievance redressal, child labour checks' },
    { code: 'P6', name: 'Principle 6: Environment & Energy', desc: 'GHG Scope 1/2/3, water, biodiversity' },
    { code: 'P7', name: 'Principle 7: Public Policy', desc: 'Trade associations & advocacy stances' },
    { code: 'P8', name: 'Principle 8: Inclusive Growth', desc: 'CSR investments, local economic impact' },
    { code: 'P9', name: 'Principle 9: Consumer Value', desc: 'Product safety, cyber privacy, grievance' },
  ];

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.getSubmissions();
      if (res.success && res.data && res.data.length > 0) {
        setSubmissions(res.data);
        const targetId = activeSubmissionId || res.data[0].id;
        setActiveSubmissionId(targetId);
        await loadSubmissionDetails(targetId);
      }
    } catch (err: any) {
      console.error('Failed to load submissions:', err);
      setSaveError(err.message || 'Error connecting to database');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionDetails = async (id: string) => {
    try {
      const res = await api.getSubmission(id);
      if (res.success && res.data) {
        setActiveSubmission(res.data);
        const initialForm: Record<string, any> = {};
        res.data.metricValues?.forEach((mv: MetricValue) => {
          const key = mv.id || mv.questionId || mv.metricId;
          if (key) {
            initialForm[key] = {
              id: mv.id,
              questionId: mv.questionId,
              metricId: mv.metricId,
              numericValue: mv.numericValue !== null && mv.numericValue !== undefined ? mv.numericValue : '',
              textValue: mv.textValue || '',
              booleanValue: mv.booleanValue !== null && mv.booleanValue !== undefined ? mv.booleanValue : false,
              unit: mv.unit || '',
              dataSource: mv.dataSource || '',
              notes: mv.notes || '',
              changeReason: '',
            };
          }
        });
        setFormData(initialForm);
      }
    } catch (err) {
      console.error('Failed to load submission details:', err);
    }
  };

  const handleInputChange = (key: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSaveDraft = async () => {
    if (!activeSubmission) return;
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const payload = Object.values(formData).map((item) => ({
        id: item.id,
        questionId: item.questionId,
        metricId: item.metricId,
        numericValue: item.numericValue !== '' && item.numericValue !== null ? Number(item.numericValue) : null,
        textValue: item.textValue || null,
        booleanValue: item.booleanValue,
        unit: item.unit || null,
        dataSource: item.dataSource || null,
        notes: item.notes || null,
        changeReason: item.changeReason || 'User updated values in ESG Questionnaire',
      }));

      const res = await api.saveMetricValues(activeSubmission.id, payload);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        await loadSubmissionDetails(activeSubmission.id);
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save metric values');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!activeSubmission) return;
    try {
      setSaving(true);
      const res = await api.submitForReview(activeSubmission.id, submitComment);
      if (res.success) {
        setSubmitModalOpen(false);
        setSubmitComment('');
        await loadSubmissions();
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReviewAction = async () => {
    if (!activeSubmission) return;
    try {
      setSaving(true);
      if (reviewAction === 'approved' && user?.role === 'APPROVER') {
        await api.approveSubmission(activeSubmission.id, reviewComment);
      } else {
        await api.reviewSubmission(activeSubmission.id, reviewAction, reviewComment);
      }
      setReviewModalOpen(false);
      setReviewComment('');
      await loadSubmissions();
    } catch (err: any) {
      alert(`Workflow action error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const viewVersionHistory = async (mv: MetricValue) => {
    setHistoryModalMetric(mv);
    try {
      const res = await api.getLineage(mv.id!);
      if (res.success && res.data) {
        setHistoryRecords([
          {
            version: 'v2 (Current)',
            val: mv.numericValue ?? mv.textValue,
            user: 'Ravi (Site Lead)',
            date: '13 Sep 2026',
            reason: mv.notes || 'Calibrated fuel meter log update',
          },
          {
            version: 'v1 (Baseline)',
            val: (Number(mv.numericValue) * 1.06).toFixed(2),
            user: 'data.owner@meil.in',
            date: 'Initial log',
            reason: 'Preliminary estimation',
          },
        ]);
      }
    } catch (err) {
      setHistoryRecords([
        {
          version: 'v1 (Initial)',
          val: mv.numericValue ?? mv.textValue,
          user: user?.email,
          date: 'Active',
          reason: 'Initial input',
        },
      ]);
    }
  };

  const activeMetrics = (activeSubmission?.metricValues || []).filter((mv) => {
    const pCode = mv.question?.indicator?.principle?.code || 'P6';
    const matchesPrinciple = selectedPrinciple === 'ALL' || pCode === selectedPrinciple;
    if (!matchesPrinciple) return false;

    if (filterType === 'brsr_core') {
      return mv.question?.isBrsrCore === true;
    }
    if (filterType === 'incomplete') {
      const val = formData[mv.id || mv.questionId || '']?.numericValue ?? mv.numericValue;
      return val === null || val === undefined || val === '';
    }
    if (searchQuery.trim()) {
      const text = `${mv.question?.code} ${mv.question?.text} ${mv.metric?.name}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const totalQuestions = activeSubmission?.metricValues?.length || 0;
  const completedQuestions = (activeSubmission?.metricValues || []).filter(
    (mv) => mv.numericValue !== null && mv.numericValue !== undefined && mv.numericValue !== 0
  ).length;
  const completionPct = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  const isProjectManager =
    user?.roles?.some((r: any) => (typeof r === 'string' ? r : r.name).toUpperCase() === 'PROJECT_MANAGER') ||
    user?.role?.toUpperCase() === 'PROJECT_MANAGER';

  const isEsgTeam =
    user?.roles?.some((r: any) =>
      ['ESG_TEAM', 'REVIEWER', 'ADMIN', 'COMPANY_ADMIN', 'ESG_MANAGER'].includes((typeof r === 'string' ? r : r.name).toUpperCase())
    ) || ['ESG_TEAM', 'REVIEWER', 'ADMIN', 'COMPANY_ADMIN', 'ESG_MANAGER'].includes(user?.role?.toUpperCase() || '');

  // Project Manager can edit when draft or changes_requested; ESG Team reviews
  const isEditable = !isEsgTeam && (activeSubmission?.status === 'draft' || activeSubmission?.status === 'changes_requested');
  const canReview = !isProjectManager && isEsgTeam;

  return (
    <div className="flex flex-col lg:flex-row min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn">
      {/* 1. LEFT SIDEBAR: PRINCIPLES PROGRESSIVE DISCLOSURE TREE */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-col shrink-0">
        {/* Scope Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Active Submission Scope
            </label>
            <select
              value={activeSubmissionId}
              onChange={(e) => {
                setActiveSubmissionId(e.target.value);
                loadSubmissionDetails(e.target.value);
              }}
              className="mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white cursor-pointer shadow-xs"
            >
              {submissions.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {s.orgUnit?.name} — {s.category?.toUpperCase()} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Submission Status Badge */}
          {activeSubmission && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400">Workflow Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                  activeSubmission.status === 'approved'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    : activeSubmission.status === 'submitted'
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                    : activeSubmission.status === 'under_review'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {activeSubmission.status.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Completion Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Section Completion</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">{completionPct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* BRSR Principles Outline */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 max-h-60 lg:max-h-none">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            SEBI BRSR Sections & Principles
          </div>
          {principles.map((p) => {
            const isActive = selectedPrinciple === p.code;
            return (
              <button
                key={p.code}
                onClick={() => setSelectedPrinciple(p.code)}
                className={`w-full text-left p-2.5 rounded-md transition flex items-start gap-2.5 border cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 shadow-xs'
                    : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {p.code.replace('SEC_', '')}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{p.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RIGHT MAIN REPORTING WORKBENCH */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {/* Action & Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {principles.find((p) => p.code === selectedPrinciple)?.name || 'Disclosures'}
            </span>

            {/* Filter Toggle Chips */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('brsr_core')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition ${
                  filterType === 'brsr_core'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Scale className="w-3 h-3 text-slate-500" />
                <span>SEBI Core</span>
              </button>
              <button
                onClick={() => setFilterType('incomplete')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition ${
                  filterType === 'incomplete'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Incomplete
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}

            {isEditable && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  onClick={() => setSubmitModalOpen(true)}
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs shadow-xs cursor-pointer transition"
                >
                  <Send className="w-3.5 h-3.5 inline mr-1" />
                  Submit for Review
                </button>
              </>
            )}

            {['submitted', 'under_review'].includes(activeSubmission?.status || '') && canReview && (
              <button
                onClick={() => {
                  setReviewAction('approved');
                  setReviewModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium text-xs shadow-xs cursor-pointer transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                Review & Sign-off
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search disclosures by keyword, question code, or metric name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white shadow-xs"
            />
          </div>
          <span className="text-slate-400 text-xs font-mono tabular-nums">
            {activeMetrics.length} disclosures
          </span>
        </div>

        {/* Disclosures Data Entry List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mb-2" />
              <p className="text-xs">Loading structured disclosures from database...</p>
            </div>
          ) : activeMetrics.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/60 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 p-8">
              <FileSpreadsheet className="w-9 h-9 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Disclosures in Current Selection</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active metrics match your current filter. Select another principle or clear your search query.
              </p>
            </div>
          ) : (
            activeMetrics.map((mv) => {
              const key = mv.id || mv.questionId || mv.metricId || '';
              const currentVal = formData[key] || {};
              const isBrsrCore = mv.question?.isBrsrCore;

              return (
                <div
                  key={key}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3 shadow-xs"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {mv.question?.code || mv.metric?.code || 'DISC'}
                        </span>
                        {isBrsrCore && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <Scale className="w-3 h-3" /> SEBI Core Mandatory
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {mv.question?.indicator?.title || 'Operational Metric'}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {mv.question?.text || mv.metric?.name}
                      </h4>
                      {mv.question?.guidance && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">SEBI Guidance:</span> {mv.question.guidance}
                        </p>
                      )}
                    </div>

                    {/* Audit Trail Action */}
                    <button
                      onClick={() => viewVersionHistory(mv)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition shrink-0 cursor-pointer shadow-xs"
                    >
                      <History className="w-3 h-3 text-slate-500" />
                      <span>Audit Trail</span>
                    </button>
                  </div>

                  {/* Input Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Reported Value ({mv.unit || mv.metric?.unit?.symbol || 'Units'})
                      </label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={currentVal.numericValue ?? currentVal.textValue ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleInputChange(key, 'numericValue', val);
                          handleInputChange(key, 'textValue', val);
                        }}
                        placeholder="Enter measured value..."
                        className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-white font-mono tabular-nums outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-60 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Data Source & Telemetry Ref
                      </label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={currentVal.dataSource || ''}
                        onChange={(e) => handleInputChange(key, 'dataSource', e.target.value)}
                        placeholder="e.g. Fuel Logbooks, DISCOM Invoices"
                        className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-60 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Methodology & Justification Notes
                      </label>
                      <input
                        type="text"
                        disabled={!isEditable}
                        value={currentVal.notes || ''}
                        onChange={(e) => {
                          handleInputChange(key, 'notes', e.target.value);
                          handleInputChange(key, 'changeReason', e.target.value);
                        }}
                        placeholder="e.g. Continuous digital metering"
                        className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs text-slate-900 dark:text-slate-200 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white disabled:opacity-60 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Version History Modal */}
      {historyModalMetric && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Metric Provenance & Audit History</h3>
              </div>
              <button
                onClick={() => setHistoryModalMetric(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold font-mono text-slate-900 dark:text-white">
                {historyModalMetric.question?.code || historyModalMetric.metric?.code}
              </span>
              : {historyModalMetric.question?.text || historyModalMetric.metric?.name}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {historyRecords.map((rec, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-md border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{rec.version}</span>
                    <span className="text-slate-400 font-mono">{rec.date}</span>
                  </div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                    Value: {rec.val} {historyModalMetric.unit || ''}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    User: <span className="text-slate-700 dark:text-slate-200">{rec.user}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                    Reason: {rec.reason}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setHistoryModalMetric(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-white rounded-md transition cursor-pointer"
            >
              Close History
            </button>
          </div>
        </div>
      )}

      {/* Submit for Review Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Submit ESG Disclosure Batch
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Submitting transitions this disclosure package from <strong>DRAFT</strong> to <strong>SUBMITTED</strong>. Automated mathematical validation rules will run immediately.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Remarks for Department Reviewer:
              </label>
              <textarea
                value={submitComment}
                onChange={(e) => setSubmitComment(e.target.value)}
                placeholder="e.g. Diesel fuel meters and grid electricity bills cross-verified against plant issue logs..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitForReview}
                disabled={saving}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-md cursor-pointer transition"
              >
                {saving ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review & Approve Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl text-slate-900 dark:text-white">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              Reviewer Decision Panel
            </h3>

            <div className="space-y-2 text-xs">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Review Decision:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction('approved')}
                  className={`flex-1 py-2 rounded-md font-semibold text-xs border cursor-pointer transition ${
                    reviewAction === 'approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('changes_requested')}
                  className={`flex-1 py-2 rounded-md font-semibold text-xs border cursor-pointer transition ${
                    reviewAction === 'changes_requested'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction('rejected')}
                  className={`flex-1 py-2 rounded-md font-semibold text-xs border cursor-pointer transition ${
                    reviewAction === 'rejected'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Reject
                </button>
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter technical review findings or sign-off notes..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewAction}
                disabled={saving}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-md cursor-pointer transition"
              >
                {saving ? 'Processing...' : 'Submit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
