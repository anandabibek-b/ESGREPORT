'use client';

import React, { useState } from 'react';
import {
  Send,
  X,
  User,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Database,
  Scale,
  FileCheck,
  Check,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: any[];
  timestamp: string;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Welcome to the **ESG360 Grounded Analysis Engine**.\n\nI analyze disclosures strictly using database-backed records, IPCC/CEA deterministic calculation formulas, and cryptographic evidence hashes across active reporting entities.\n\nSelect any analytical query below or enter a specific metric inquiry:`,
      timestamp: 'Active',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'What is our Scope 1 emission for the current reporting period?',
    'Which BRSR Core indicators are incomplete?',
    'Why is this submission blocked?',
    'What changed compared with the previous year?',
    'Which evidence supports this metric?',
    'What validation issues require attention?',
  ];

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.queryAI(query);
      if (res.success && res.data) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: res.data.answer,
          citations: res.data.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Error querying verified platform data: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 animate-fadeIn">
      {/* 1. DRAWER HEADER */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-5 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Grounded ESG Regulatory Analyst</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                ZERO FABRICATION
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">SEBI BRSR Telemetry & Database Grounded</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. SUGGESTED INQUIRIES */}
      <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Suggested Analytical Queries:</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Click to inquire</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition text-left cursor-pointer font-medium shadow-xs"
            >
              “{p}”
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONVERSATION LOG */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/40 dark:bg-slate-950/20">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300 mt-0.5">
                <Scale className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-3.5 space-y-2 ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed text-xs">{m.text}</div>

              {/* Citations display */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 space-y-1.5 text-[10px]">
                  <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                    <Database className="w-3 h-3 text-slate-500" />
                    <span>Verified Platform Citations ({m.citations.length})</span>
                  </div>
                  <div className="space-y-1">
                    {m.citations.map((c, i) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-700 dark:text-slate-300"
                      >
                        {c.code && <span className="font-bold">[{c.code}] </span>}
                        {c.factor && <span>{c.factor} </span>}
                        {c.name && <span>{c.name} ({c.status}) </span>}
                        {c.value && <span className="font-semibold text-slate-900 dark:text-white">{c.value} </span>}
                        {c.files && <span>Files: {c.files.join(', ')}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`text-[9px] text-right font-mono ${
                  m.sender === 'user' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-md bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-slate-600 dark:text-slate-400 text-xs p-3 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
            <span>Retrieving verified database records & deterministic engine outputs...</span>
          </div>
        )}
      </div>

      {/* 4. INPUT CONTROLS */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about emissions, data gaps, or BRSR metrics..."
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-40 text-white dark:text-slate-900 rounded-md transition cursor-pointer font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
