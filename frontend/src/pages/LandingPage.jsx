import React from 'react';
import {
  Sparkles,
  Activity,
  Droplets,
  Moon,
  Footprints,
  Brain,
  ShieldCheck,
  Trophy,
  ArrowRight,
  CheckCircle2,
  HeartHandshake,
  Bot,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onNavigate }) {
  const { guestLogin } = useAuth();

  const handleGuestDemo = async () => {
    try {
      await guestLogin();
      onNavigate('dashboard');
    } catch (err) {
      console.error('Guest demo login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-cyan-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              HealthLoop
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">
              Behaviour AI
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleGuestDemo}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Try Guest Demo</span>
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 md:py-24 px-6 lg:px-12 max-w-6xl mx-auto text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Next-Generation AI Behavioural Monitoring & Motivation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Build Healthy Habits.{' '}
            <span className="bg-linear-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Sustain a Better Life.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            HealthLoop isn't just another passive activity logger. Powered by Google Gemini AI, it proactively detects habit drop-offs, provides compassionate micro-restart plans, and gamifies long-term physical and mental wellness.
          </p>

          {/* Dual CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGuestDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold text-sm shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Explore Instant Evaluator Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-100 font-semibold text-sm shadow-xs transition-all"
            >
              Create Personal Account
            </button>
          </div>

          {/* Core Feature Badges */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            {[
              { icon: Droplets, title: 'Intelligent Hydration', desc: 'Custom daily water intake tracking', color: 'text-cyan-500' },
              { icon: Footprints, title: 'Activity & Movement', desc: 'Daily steps & cardio endurance', color: 'text-emerald-500' },
              { icon: Moon, title: 'Sleep Architecture', desc: 'Circadian rhythm optimization', color: 'text-blue-500' },
              { icon: Brain, title: 'Mindful Wellness', desc: 'Stress reduction & meditation', color: 'text-purple-500' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/70 shadow-xs">
                  <Icon className={`w-5 h-5 ${f.color} mb-2`} />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Innovative Breakthroughs Section */}
        <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Core Innovations
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                Why HealthLoop Sustains Habits Where Others Fail
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 flex items-center justify-center mb-4">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Behaviour Drop Detection
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Most apps shame you when you miss a streak. HealthLoop uses behavioral pattern recognition to detect missed-day drops, offers zero-shame empathy, and suggests friction-free micro-goals to get you right back on track.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-300 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Google Gemini Health Coach
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Interactive behavioral AI synthesizes your real hydration, sleep, and exercise data to answer questions, suggest realistic habit stacking, and generate weekly digest summaries with built-in healthcare guardrails.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Gamification & Social Challenges
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Earn XP, unlock achievement badges (Water Champion, Sleep Master, Comeback Hero), climb tiers from Bronze Starter to Diamond Champion, and conquer 7-day, 21-day, and 30-day health challenges.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Disclaimer Banner */}
        <section className="py-8 px-6 lg:px-12 max-w-4xl mx-auto text-center">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-xs">
            <span className="font-bold">Medical Safety & Responsibility Notice:</span> HealthLoop and its AI Health Coach provide lifestyle coaching, habit architecture, and motivation only. It does not provide medical diagnoses, treatment plans, or clinical prescriptions.
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        <p>© 2026 HealthLoop – AI-Powered Healthy Behaviour Monitoring & Motivation System. All rights reserved.</p>
      </footer>
    </div>
  );
}
