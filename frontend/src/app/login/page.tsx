'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Read URL query errors (e.g. ?error=unauthorized or ?error=expired)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('You do not have permission to access this page.');
    } else if (errorParam === 'expired') {
      setError('Your session has expired. Please log in again.');
    }

    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('esg_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [searchParams]);

  // If already authenticated, redirect to role-specific dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const isProjectManager =
        user.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
        user.role?.toUpperCase() === 'PROJECT_MANAGER';
      if (isProjectManager) {
        router.replace('/?tab=questionnaire');
      } else {
        router.replace('/?tab=dashboard');
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password, rememberMe);
      const isProjectManager =
        loggedInUser.roles?.some((r) => r.toUpperCase() === 'PROJECT_MANAGER') ||
        loggedInUser.role?.toUpperCase() === 'PROJECT_MANAGER';

      if (isProjectManager) {
        router.replace('/?tab=questionnaire');
      } else {
        router.replace('/?tab=dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email/phone or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSuccess = (userIdentifier: string, newPass: string) => {
    setEmail(userIdentifier);
    setPassword(newPass);
    setSuccessMessage('Password reset successfully! You can now log in with your updated credentials.');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top enterprise strip */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">MEIL Group Sustainability Directorate</span>
          <span>•</span>
          <span className="hidden sm:inline font-mono text-[11px]">SEBI BRSR Core Assured Platform</span>
        </div>

        {/* Public Citizen Portal Quick Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/public"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Public Citizen Portal (No Login Required)</span>
          </Link>
          <div className="text-[11px] font-mono hidden md:inline text-slate-400">
            SEBI CIR/2023/122
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 space-y-4">
        {/* Main Login Card */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs p-6 sm:p-8 space-y-6">
          {/* Logo & Portal Branding */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center mb-1">
              <Building2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </div>

            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              MEIL GROUP • INFRASTRUCTURE
            </div>

            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              ESG Compliance & BRSR Reporting Platform
            </h1>

            <p className="text-xs text-slate-500">
              Deterministic Greenhouse Gas Accounting & Statutory Filing
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Work Email or Mobile Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@meil.in or +91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline cursor-pointer flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 inline" />
                  <span>Reset via SMS / Email</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-9 pr-10 py-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Remember on this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 disabled:opacity-60 text-white dark:text-slate-900 font-medium text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign In to Platform</span>
              )}
            </button>
          </form>

          {/* Security & Assurance Badge */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Role-Based Access Control • SMS OTP Verification</span>
          </div>
        </div>

        {/* Public Access Card for Citizens */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Public Transparency Portal
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold font-mono">
                No Login Required
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Citizens, researchers, and public stakeholders can inspect MEIL’s verified ESG score, clean water initiatives, and public BRSR filings without logging in.
            </p>
            <div className="pt-1">
              <Link
                href="/public"
                className="inline-flex items-center gap-1 text-slate-900 dark:text-white hover:underline text-xs font-semibold cursor-pointer"
              >
                <span>Explore Public Disclosures</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Reset Password Modal (Phone & Email with OTP) */}
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onSuccess={handleResetSuccess}
      />

      {/* Corporate Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 font-mono">
        © 2026 Megha Engineering & Infrastructures Limited • Reasonable Assurance Compliance
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
