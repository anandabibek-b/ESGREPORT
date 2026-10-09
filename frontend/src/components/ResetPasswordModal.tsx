'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Smartphone,
} from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (identifier: string, newPass: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('+91 98765 43210');
  const [phoneToConnect, setPhoneToConnect] = useState('+91 98765 43210');
  const [connectPhoneCheckbox, setConnectPhoneCheckbox] = useState(true);

  // Flow steps: 1 = Request, 2 = Verify & Set Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 2 inputs
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);
  const [maskedDestination, setMaskedDestination] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  // Preset quick fill helpers for easy demo evaluation
  const setQuickFill = (type: 'ravi' | 'admin' | 'manager') => {
    setError(null);
    if (type === 'ravi') {
      setMethod('phone');
      setIdentifier('+91 98765 43210');
      setPhoneToConnect('+91 98765 43210');
    } else if (type === 'admin') {
      setMethod('phone');
      setIdentifier('+91 98765 00001');
      setPhoneToConnect('+91 98765 00001');
    } else {
      setMethod('email');
      setIdentifier('esg.manager@meil.in');
      setPhoneToConnect('+91 98765 00002');
    }
  };

  // 1. Request verification code
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError(method === 'phone' ? 'Please enter a valid mobile number.' : 'Please enter your corporate email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestPasswordReset(
        identifier.trim(),
        method,
        connectPhoneCheckbox ? phoneToConnect.trim() : undefined
      );

      if (res.success) {
        setMaskedDestination(res.destination || identifier);
        setDemoOtpCode(res.otpCode || null);
        setStep(2);
        setResendTimer(45);
      } else {
        setError(res.error || 'Failed to send verification code.');
      }
    } catch (err: any) {
      setError(err.message || 'Account not found with this mobile number or email.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit OTP and New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        identifier: identifier.trim(),
        otpCode: otpCode.trim(),
        newPassword,
        phoneToConnect: connectPhoneCheckbox ? (method === 'phone' ? identifier.trim() : phoneToConnect.trim()) : undefined,
      });

      if (res.success) {
        setStep(3);
      } else {
        setError(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code or session expired.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-500' };
    if (score <= 4) return { score: 2, label: 'Moderate', color: 'bg-amber-500 text-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Password & Connect Phone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify your identity via mobile OTP or corporate email
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`flex-1 h-1 rounded-full ${
              step >= 1 ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
          <div
            className={`flex-1 h-1 rounded-full ${
              step >= 2 ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
          <div
            className={`flex-1 h-1 rounded-full ${
              step === 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* ================= STEP 1: SELECT METHOD & REQUEST OTP ================= */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setMethod('phone');
                  setError(null);
                  if (!identifier.startsWith('+')) setIdentifier('+91 98765 43210');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  method === 'phone'
                    ? 'bg-white dark:bg-[#0F172A] text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Phone (SMS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('email');
                  setError(null);
                  if (identifier.startsWith('+')) setIdentifier('ravi@meil.in');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  method === 'email'
                    ? 'bg-white dark:bg-[#0F172A] text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Corporate Email</span>
              </button>
            </div>

            {/* Quick Demo Preset Buttons */}
            <div className="p-2.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-xs">
              <div className="text-[10px] uppercase font-bold text-sky-800 dark:text-sky-300 font-mono mb-1.5">
                ⚡ Quick Fill Preset Accounts:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickFill('ravi')}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 transition cursor-pointer"
                >
                  📱 Ravi (+91 98765 43210)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFill('admin')}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 transition cursor-pointer"
                >
                  📱 Admin (+91 98765 00001)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFill('manager')}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:border-sky-500 transition cursor-pointer"
                >
                  📧 Priya (ESG Manager)
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {method === 'phone' ? 'Registered Mobile Number' : 'Registered Corporate Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    {method === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type={method === 'phone' ? 'tel' : 'email'}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={method === 'phone' ? '+91 98765 43210' : 'name@meil.in'}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                  />
                </div>
              </div>

              {/* Connect Phone Option (If resetting via Email) */}
              {method === 'email' && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Connect / Update Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phoneToConnect}
                      onChange={(e) => setPhoneToConnect(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs outline-none focus:border-sky-500 transition"
                    />
                  </div>
                </div>
              )}

              {/* Checkbox: Keep Phone Connected */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={connectPhoneCheckbox}
                  onChange={(e) => setConnectPhoneCheckbox(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span>Connect & verify this phone number for 2-factor login alerts</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending 6-Digit OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 2: ENTER OTP & NEW PASSWORD ================= */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            {/* Target & Demo Notice */}
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Code dispatched to:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {maskedDestination}
                </span>
              </div>

              {/* Demo Helper Pill */}
              {demoOtpCode && (
                <div className="pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <span>⚡ Demo Code:</span>
                    <strong className="font-mono text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                      {demoOtpCode}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(demoOtpCode)}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Auto-fill Code
                  </button>
                </div>
              )}
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enter 6-Digit Verification Code
                </label>
                {resendTimer > 0 ? (
                  <span className="text-[11px] text-slate-400">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters (e.g. Meil@2026)"
                  className="w-full pl-9 pr-10 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1 h-1">
                    <div
                      className={`flex-1 rounded-full ${
                        strength.score >= 1 ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full ${
                        strength.score >= 2 ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                    <div
                      className={`flex-1 rounded-full ${
                        strength.score >= 3 ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Password Strength:</span>
                    <span className="font-semibold">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Reset Password</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: SUCCESS STATE ================= */}
        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Password Successfully Reset!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                Your credentials have been updated securely in the database and your mobile phone has been connected.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] text-xs text-left space-y-1 font-mono">
              <div className="text-slate-500">Account: <span className="text-slate-900 dark:text-white font-semibold">{identifier}</span></div>
              <div className="text-slate-500">Audit Status: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">VERIFIED & LOGGED</span></div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSuccess(identifier, newPassword);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              Log In with New Password Now
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            SHA-256 Encrypted
          </span>
          <span>Helpdesk: 1800-6345-374</span>
        </div>
      </div>
    </div>
  );
};
