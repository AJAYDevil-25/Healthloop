import React, { useState } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { login, guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = async () => {
    setError('');
    setGuestLoading(true);
    try {
      await guestLogin();
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message || 'Guest demo access failed.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-teal-500 selection:text-white">
      {/* Brand Header */}
      <div className="flex items-center space-x-3 mb-6 cursor-pointer" onClick={() => onNavigate('landing')}>
        <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="text-2xl font-extrabold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          HealthLoop
        </span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your health dashboard & habit consistency tracker
          </p>
        </div>

        {/* Quick Evaluator Guest Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-amber-500/10 via-teal-500/10 to-emerald-500/10 border border-teal-200 dark:border-teal-800/60 text-center">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Evaluating HealthLoop for submission?
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
            One-click entry as "Adam Mitchell" with 14 days of realistic health data.
          </p>
          <button
            type="button"
            onClick={handleGuestDemo}
            disabled={guestLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/25 flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>{guestLoading ? 'Loading Demo Workspace...' : 'Instant Evaluator Guest Access'}</span>
          </button>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="shrink mx-4 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Or Sign In With Email
          </span>
          <div className="grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotSent(!forgotSent)}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              />
            </div>
          </div>

          {forgotSent && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 text-xs border border-teal-200 dark:border-teal-800">
              Password reset simulation enabled. You can log in with any created account or test with Guest Mode anytime!
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
          >
            Create account
          </button>
        </p>
      </div>
    </div>
  );
}
