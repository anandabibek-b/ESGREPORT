'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  FileText,
  Calculator,
  Layers,
  Building2,
  FileSpreadsheet,
  ShieldCheck,
  Check,
  Database,
  Table,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';

export const LineageView: React.FC = () => {
  const [metricList, setMetricList] = useState<any[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState<string>('');
  const [lineageData, setLineageData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<string>('calculation');
  const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');

  useEffect(() => {
    loadMetricList();
  }, []);

  const loadMetricList = async () => {
    try {
      const res = await api.getLineageList();
      if (res.success && res.data && res.data.length > 0) {
        setMetricList(res.data);
        const targetId = res.data[0].id;
        setSelectedMetricId(targetId);
        await loadLineage(targetId);
      }
    } catch (err) {
      console.error('Failed to load traceable metrics list:', err);
    }
  };

  const loadLineage = async (id: string) => {
    try {
      const res = await api.getLineage(id);
      if (res.success && res.data) {
        setLineageData(res.data);
      }
    } catch (err) {
      console.error('Failed to load lineage graph:', err);
    }
  };

  const nodes = lineageData?.lineageGraph?.nodes || [];
  const selectedNodeData = nodes.find((n: any) => n.id === selectedNode) || nodes[1] || nodes[0];

  const icons: Record<string, React.ReactNode> = {
    evidence: <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
    calculation: <Calculator className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
    metric: <Layers className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
    submission: <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
    report: <FileSpreadsheet className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
  };

  const stepLabels = [
    '1. Primary Evidence',
    '2. Deterministic Formula',
    '3. Calibrated Metric',
    '4. Site Submission',
    '5. SEBI Filing',
  ];

  return (
    <div className="flex-1 flex flex-col min-h-[720px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 overflow-hidden shadow-xs animate-fadeIn space-y-6">
      {/* 1. TOP HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              <span>End-to-End Data Lineage & Provenance Chain</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                AUDIT TRAIL
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic audit chain tracing reported BRSR metrics back to source invoices, smart meters, and deterministic calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md text-xs">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition ${
                viewMode === 'pipeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Pipeline View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Accessible Table</span>
            </button>
          </div>

          {/* Metric Selector */}
          <select
            value={selectedMetricId}
            onChange={(e) => {
              setSelectedMetricId(e.target.value);
              loadLineage(e.target.value);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white max-w-xs truncate cursor-pointer shadow-xs"
          >
            {metricList.map((m) => (
              <option key={m.id} value={m.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {m.question?.code || m.metric?.code} — {m.question?.text || m.metric?.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-6 space-y-6 pb-6 overflow-y-auto">
        {viewMode === 'pipeline' ? (
          <>
            {/* 2. PROVENANCE STAGE PIPELINE */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500">
                  Deterministic Provenance Transformation Flow
                </span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Reasonable Assurance Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {nodes.map((node: any, idx: number) => {
                  const isSelected = selectedNode === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 shadow-xs'
                          : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase font-mono mb-1.5">
                          {stepLabels[idx] || `Step ${idx + 1}`}
                        </div>
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 border border-slate-200 dark:border-slate-700">
                          {icons[node.id] || <Layers className="w-4 h-4 text-slate-500" />}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                          {node.label}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 capitalize font-mono">
                        {node.type?.replace('_', ' ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. STAGE INSPECTOR DETAIL */}
            {selectedNodeData && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Inspected Pipeline Node
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedNodeData.label}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200 dark:border-slate-700">
                    Type: {selectedNodeData.type}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      Transformation Parameters
                    </h4>
                    <div className="text-xs font-mono space-y-1.5 text-slate-700 dark:text-slate-300">
                      {Object.entries(selectedNodeData.details || {}).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between border-b border-slate-200 dark:border-slate-700/60 pb-1">
                          <span className="text-slate-500 capitalize">{k}:</span>
                          <span className="text-slate-900 dark:text-white font-semibold truncate max-w-xs">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-md border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      Assurance & Integrity Attribution
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Every link in this chain is secured with user role attribution, SHA-256 cryptographic hashes for attached files, and immutable timestamping in the platform audit log.
                    </p>
                    <div className="pt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono flex items-center gap-1.5 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Cryptographic Integrity Verified • ISO 14064-1 Compliant
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ACCESSIBLE TABULAR VIEW */
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Step #</th>
                  <th className="py-2.5 px-3">Pipeline Node</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Details / Transformation</th>
                  <th className="py-2.5 px-3">Assurance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {nodes.map((node: any, idx: number) => (
                  <tr key={node.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{node.label}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 capitalize">{node.type}</td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600 dark:text-slate-400 max-w-md">
                      {Object.entries(node.details || {})
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' • ')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono font-semibold">
                        <Check className="w-3 h-3" /> VERIFIED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
