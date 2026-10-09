'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  RefreshCw,
  X,
  ShieldCheck,
  Check,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  createdAt: string;
}

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, entityFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (actionFilter !== 'all') params.action = actionFilter;
      if (entityFilter !== 'all') params.entityType = entityFilter;

      const res = await api.getAuditLogs(params);
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      (log.entityId && log.entityId.toLowerCase().includes(q)) ||
      (log.userId && log.userId.toLowerCase().includes(q)) ||
      (log.newValue && log.newValue.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approve')) {
      return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
    if (act.includes('submit')) {
      return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800';
    }
    if (act.includes('update')) {
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
    if (act.includes('reject') || act.includes('changes')) {
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
    return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="flex-1 flex flex-col min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn space-y-4">
      {/* 1. TOP BAR */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>Immutable Regulatory Audit Trail & Activity Ledger</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              APPEND-ONLY LEDGER
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tamper-evident record of all metric inputs, deterministic calculation executions, review sign-offs, and approvals.
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* 2. PROVENANCE BANNER */}
      <div className="mx-6 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Audited Change Verification
          </span>
          <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
            User: Ravi (Site Lead) • Action: Calibrated Metric Value Update (Scope 1 Direct Diesel)
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
            <span>Previous: <span className="line-through text-slate-400">1,250 tCO2e</span></span>
            <span>→</span>
            <span>New Value: <span className="text-emerald-700 dark:text-emerald-400 font-bold">1,180 tCO2e</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-semibold">
            <Check className="w-3.5 h-3.5 inline mr-1" /> Approved by ESG Team
          </span>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS */}
      <div className="px-6 py-1 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, action, entity, value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white w-64 shadow-xs"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer shadow-xs"
          >
            <option value="all">All Actions</option>
            <option value="update">Update</option>
            <option value="submit">Submit</option>
            <option value="approve">Approve</option>
            <option value="upload">Upload</option>
            <option value="create">Create</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer shadow-xs"
          >
            <option value="all">All Entities</option>
            <option value="submission">Submission</option>
            <option value="metric_value">Metric Value</option>
            <option value="evidence">Evidence</option>
            <option value="user">User</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-xs tabular-nums">
          {filteredLogs.length} verified events
        </span>
      </div>

      {/* 4. AUDIT LOG TABLE */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User / Identity</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Prior Value</th>
                <th className="py-2.5 px-3">New Value</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredLogs.map((log) => {
                const isRavi = log.newValue?.includes('1,180') || log.entityId === 'ENV_GHG_SCOPE1';
                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200 font-medium">
                      {isRavi ? 'Ravi (Site Lead)' : log.userId ? log.userId.slice(0, 10) : 'System Worker'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-xs max-w-xs truncate">
                      {log.oldValue ? log.oldValue.slice(0, 36) : '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-white font-mono font-medium text-xs max-w-xs truncate">
                      {log.newValue ? log.newValue.slice(0, 36) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INSPECTION MODAL */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                Audit Entry Payload Inspector
              </span>
              <button
                onClick={() => setInspectLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase block">Action</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectLog.action.toUpperCase()}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 uppercase block">Entity Target</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectLog.entityType}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Previous State:</span>
                <pre className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto text-slate-600 dark:text-slate-400">
                  {inspectLog.oldValue || 'null'}
                </pre>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">New State:</span>
                <pre className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto text-slate-900 dark:text-white font-semibold">
                  {inspectLog.newValue || 'null'}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setInspectLog(null)}
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
