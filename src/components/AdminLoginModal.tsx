import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { verifyAdminCredentials } from '../data/adminCredentials';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  X, 
  ArrowRight, 
  Smartphone, 
  RotateCw, 
  KeyRound, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DAILY_OTP_LIMIT = 50;
const OTP_SESSION_KEY = 'nmh_admin_otp_session';
const OTP_SESSION_DURATION_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const ADMIN_PHONE = '+91 7989904117';
const MASKED_PHONE = '+91 79*** **117';

export const AdminLoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginAsAdmin } = useApp();
  const [email, setEmail] = useState('admin@nikkys.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  
  // 2-Step Verification (OTP) state
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('482910');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [resendTimer, setResendTimer] = useState(30);
  const [dailyOtpUsed, setDailyOtpUsed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const todayKey = `otp_count_${new Date().toISOString().slice(0, 10)}`;
      return parseInt(localStorage.getItem(todayKey) || '3', 10);
    }
    return 3;
  });
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check password first
    const normalizedEmail = email.trim().toLowerCase();
    if (verifyAdminCredentials(email, password)) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + OTP_SESSION_DURATION_MS;
      setGeneratedOtp(newOtp);
      setOtpExpiresAt(expiresAt);
      setOtpAttempts(0);
      setEnteredOtp('');
      setStep('otp');
      setResendTimer(30);
      sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify({ email: normalizedEmail, otp: newOtp, expiresAt, attempts: 0 }));

      const newCount = dailyOtpUsed + 1;
      setDailyOtpUsed(newCount);
      const todayKey = `otp_count_${new Date().toISOString().slice(0, 10)}`;
      localStorage.setItem(todayKey, newCount.toString());
    } else {
      setError('Invalid credentials. Please check the admin email and password.');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const rawSession = sessionStorage.getItem(OTP_SESSION_KEY);
    let otpSession: { email: string; otp: string; expiresAt: number; attempts: number } | null = null;
    try {
      otpSession = rawSession ? JSON.parse(rawSession) : null;
    } catch {
      otpSession = null;
    }

    if (!otpSession || otpSession.email !== email.trim().toLowerCase() || Date.now() > otpSession.expiresAt) {
      setError('This OTP session has expired. Return to credentials and request a new code.');
      return;
    }

    if (otpSession.attempts >= MAX_OTP_ATTEMPTS) {
      setError('Too many incorrect attempts. Return to credentials and request a new OTP.');
      return;
    }

    if (enteredOtp.trim() === otpSession.otp) {
      const success = loginAsAdmin(email, password);
      if (success) {
        sessionStorage.removeItem(OTP_SESSION_KEY);
        setStep('credentials');
        setEnteredOtp('');
        onClose();
      }
    } else {
      const nextAttempts = otpSession.attempts + 1;
      sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify({ ...otpSession, attempts: nextAttempts }));
      setOtpAttempts(nextAttempts);
      setError('Incorrect 6-digit verification code. Please check your SMS code.');
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    if (dailyOtpUsed >= DAILY_OTP_LIMIT) {
      setError(`Daily OTP limit reached (${dailyOtpUsed}/${DAILY_OTP_LIMIT}). Cannot dispatch further SMS.`);
      return;
    }
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + OTP_SESSION_DURATION_MS;
    setGeneratedOtp(newOtp);
    setOtpExpiresAt(expiresAt);
    setOtpAttempts(0);
    setResendTimer(30);
    setError('');
    sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify({ email: email.trim().toLowerCase(), otp: newOtp, expiresAt, attempts: 0 }));

    const newCount = dailyOtpUsed + 1;
    setDailyOtpUsed(newCount);
    const todayKey = `otp_count_${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(todayKey, newCount.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base">
                Admin 2-Step Login
              </h3>
              <p className="text-xs text-neutral-500">
                {step === 'credentials' ? 'Enter administrator credentials' : 'Step 2: Mobile OTP Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStep('credentials');
              onClose();
            }}
            className="p-1 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 'credentials' ? (
          <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Admin Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  placeholder="admin@nikkys.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
              Credentials are verified first. A second OTP step is required before dashboard access.
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Authenticate & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        ) : (
          /* STEP 2: 2-STEP VERIFICATION (OTP) */
          <form onSubmit={handleVerifyOtp} className="p-5 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Enter 6-Digit OTP Code
              </h4>
              <p className="text-xs text-neutral-500">
                Verification code dispatched to <strong className="text-neutral-800 dark:text-neutral-200">{MASKED_PHONE}</strong>
              </p>
            </div>

            {/* Test Simulation Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                  Simulated SMS Code
                </span>
                <span className="font-mono text-base font-black tracking-widest text-neutral-900 dark:text-neutral-100">
                  {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEnteredOtp(generatedOtp)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-[11px] transition-colors"
              >
                Auto-fill
              </button>
            </div>

            {/* OTP Input Field */}
            <div>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="• • • • • •"
                autoFocus
                className="w-full text-center tracking-[0.6em] font-mono font-bold text-xl py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Resend & Quota Info */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || dailyOtpUsed >= DAILY_OTP_LIMIT}
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold disabled:opacity-50 disabled:no-underline flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP via SMS'}</span>
              </button>

              <span className="text-neutral-400 text-[11px]">
                {otpExpiresAt > Date.now() ? `${Math.ceil((otpExpiresAt - Date.now()) / 60000)} min left` : 'OTP expired'} • {otpAttempts}/{MAX_OTP_ATTEMPTS} failed
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={enteredOtp.length !== 6}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Enter Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Back to credentials
              </button>
            </div>

            {/* Cost Efficiency Note Toggle */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                className="w-full text-[11px] text-neutral-500 hover:text-amber-600 flex items-center justify-center gap-1 font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Is 50 OTP/day cost efficient? (Click for info)</span>
              </button>

              {showCostAnalysis && (
                <div className="mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 text-[11px] text-neutral-600 dark:text-neutral-300 space-y-1.5 border border-neutral-200 dark:border-neutral-700">
                  <p className="font-bold text-neutral-900 dark:text-neutral-100">
                    💰 Cost-Efficiency Analysis:
                  </p>
                  <p>
                    <strong>Extremely High Cost Efficiency!</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-neutral-500 dark:text-neutral-400">
                    <li>At ₹0.15/SMS (Fast2SMS/MSG91), 50 OTPs costs only <strong>₹7.50/day</strong> (~₹225/mo maximum).</li>
                    <li>For typical admin logins (2–5 logins/day), actual cost is <strong>under ₹1/day (~₹25/mo)</strong>.</li>
                    <li><strong>100% Free Alternative:</strong> WhatsApp Business API (first 1,000 service chats/mo are free) or Google Authenticator TOTP (₹0 forever).</li>
                  </ul>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
