import React, { useState } from 'react';
import { Sparkles, HeartHandshake, CheckCircle2, ChevronRight, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function DropDetectionBanner({ drops = [], onResolved }) {
  const [activeDrop, setActiveDrop] = useState(null);
  const [selectedReason, setSelectedReason] = useState('Busy work or personal schedule');
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!drops || drops.length === 0 || dismissed) {
    return null;
  }

  const drop = drops[0];

  const handleOpenModal = () => {
    setActiveDrop(drop);
  };

  const handleResolve = async () => {
    setLoading(true);
    try {
      await api.resolveDrop(drop.id, {
        reason: selectedReason,
        accept_micro_target: true,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setActiveDrop(null);
      if (onResolved) onResolved();
    } catch (err) {
      console.error('Failed to resolve drop:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Banner */}
      <div className="relative overflow-hidden mb-6 p-4 rounded-3xl bg-linear-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-teal-200 dark:border-teal-800/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                  Adaptive Habit Support
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {drop.missed_days_count} days pause detected
                </span>
              </div>
              <h4 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">
                Gentle Check-in for: <span className="text-teal-600 dark:text-teal-400">{drop.habit_title}</span>
              </h4>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                {drop.recovery_suggestion}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 text-xs md:text-sm font-medium rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <span>Explore Micro-Restart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Dismiss for today"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recovery Modal */}
      {activeDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveDrop(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Friction-Free Habit Recovery
                </h3>
                <p className="text-xs text-slate-500">
                  Behavioral psychology: micro-habits restore neural momentum.
                </p>
              </div>
            </div>

            <div className="mb-5 bg-teal-50/70 dark:bg-teal-950/30 p-4 rounded-2xl border border-teal-100 dark:border-teal-900/50">
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                Recommended Micro-Target
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                {activeDrop.micro_target_action}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
                <span>Original: {activeDrop.original_target} {activeDrop.unit}</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-500" />
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  Today's Easy Goal: {activeDrop.recovery_target} {activeDrop.unit}
                </span>
              </div>
            </div>

            {/* Optional Reason */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                What felt like the biggest hurdle recently? (Optional)
              </label>
              <div className="space-y-2">
                {[
                  'Busy work or personal schedule',
                  'Felt exhausted, low energy, or unwell',
                  'Original target felt too intense or demanding',
                  'Forgot or fell out of the normal daily rhythm',
                  'Traveling / away from home environment',
                ].map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 text-teal-900 dark:text-teal-100 font-medium'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveDrop(null)}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Skip for Now
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={loading}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center space-x-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Activating...' : 'Activate Micro-Goal & Earn +25 XP'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
