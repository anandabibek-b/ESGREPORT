'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileSpreadsheet,
  Layers,
  Paperclip,
  Building2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { NavTab } from '../lib/navigationConfig';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    questions: [],
    metrics: [],
    evidence: [],
    reports: [],
    orgUnits: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ questions: [], metrics: [], evidence: [], reports: [], orgUnits: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.search(query);
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits =
    (results.questions?.length || 0) +
    (results.metrics?.length || 0) +
    (results.evidence?.length || 0) +
    (results.orgUnits?.length || 0) +
    (results.reports?.length || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Bar Input */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search disclosures, metrics, evidence documents, or site facilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
          />
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400 shrink-0" />}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Type to search disclosures, metrics, evidence documents, or org units across MEIL Group...
            </div>
          ) : totalHits === 0 && !loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No results found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {/* Questions & Disclosures */}
              {results.questions?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono">
                    Disclosures & Requirements ({results.questions.length})
                  </div>
                  {results.questions.map((q: any) => (
                    <div
                      key={q.id}
                      onClick={() => {
                        onNavigate('questionnaire');
                        onClose();
                      }}
                      className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium">{q.text}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{q.code}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Metrics */}
              {results.metrics?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono">
                    ESG Metrics & Calibrations ({results.metrics.length})
                  </div>
                  {results.metrics.map((m: any) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        onNavigate('calculations');
                        onClose();
                      }}
                      className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium">{m.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            {m.code} • Unit: {m.unit?.symbol || 'Standard'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Evidence */}
              {results.evidence?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono">
                    Certified Evidence Files ({results.evidence.length})
                  </div>
                  {results.evidence.map((e: any) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        onNavigate('evidence');
                        onClose();
                      }}
                      className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Paperclip className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium">{e.fileName}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            SHA-256: {e.fileHash?.slice(0, 16)}...
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Org Units */}
              {results.orgUnits?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono">
                    Organization Sites ({results.orgUnits.length})
                  </div>
                  {results.orgUnits.map((u: any) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        onNavigate('organizations');
                        onClose();
                      }}
                      className="p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                        <div>
                          <div className="text-slate-900 dark:text-white font-medium">{u.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {u.city ? `${u.city}, ` : ''}{u.state || 'India'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Esc to close</span>
          <span>Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
