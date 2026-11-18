import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GuestDemoPage({ onNavigate }) {
  const { guestLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLaunchGuest = async () => {
    try {
      setLoading(true);
      await guestLogin();
      if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (err) {
      alert(err.message || 'Failed to start guest demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Sandbox Evaluation</span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore HealthLoop 2.0
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Experience every innovative feature with rich pre-seeded realistic data. Zero registration required.
          </p>
        </div>

        {/* Feature Highlights List */}
        <div className="text-left space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>AI Habit Interruption Prediction & Risk Factors</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Three.js Personal Health Digital Twin & Scenario Simulator</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Interactive Three.js 3D Virtual Habit Garden</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Transparent Healthy Impact Score Calculation</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Web Speech API Voice Assistant Habit Check-in</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>Wearables Ingestion & Duplicate Detection Engine</span>
          </div>
        </div>

        {/* Guest Isolation Notice */}
        <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl text-[11px] text-teal-800 dark:text-teal-300 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Guest demo sessions are strictly isolated and never expose another user's records.</span>
        </div>

        <button
          onClick={handleLaunchGuest}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Spinning Up Sandboxed Workspace...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Instant Guest Demo</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
