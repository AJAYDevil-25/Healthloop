import React, { useState, useEffect } from 'react';
import { Activity, Sliders, Info, ShieldCheck, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';
import api from '../services/api';

export default function ImpactScorePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weights, setWeights] = useState({
    exercise: 25,
    water: 20,
    sleep: 20,
    nutrition: 15,
    meditation: 10,
    general: 10
  });

  useEffect(() => {
    loadScore();
  }, []);

  const loadScore = async () => {
    try {
      setLoading(true);
      const res = await api.getImpactScore();
      setData(res.impact_score);
      if (res.impact_score?.weights_used) {
        setWeights(res.impact_score.weights_used);
      }
    } catch (err) {
      console.error('Failed to load Healthy Impact Score', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWeights = async () => {
    try {
      await api.updateImpactWeights(weights);
      setShowWeightModal(false);
      loadScore();
    } catch (err) {
      alert(err.message || 'Failed to update weights');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Healthy Impact Score
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A transparent, mathematically balanced index of daily behavioral consistency.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWeightModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customize Habit Weights</span>
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-teal-200">
              Today's Evaluated Score
            </span>
            <div className="text-4xl md:text-5xl font-black mt-1">
              {data?.score ?? 0} <span className="text-xl font-normal text-teal-200">/ 100</span>
            </div>
            <p className="text-xs text-teal-100 max-w-xl mt-2 leading-relaxed">
              {data?.explanation || 'Score computed from active tracked habits.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs space-y-1">
            <div className="font-semibold text-teal-100">Formula Mandate:</div>
            <code className="block text-[11px] text-teal-50 font-mono bg-black/20 p-2 rounded-lg">
              (Weighted Sum / Total Weights) × 100
            </code>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Card */}
      {data?.weekly_trend && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span>7-Day Consistency Trend</span>
          </h2>
          <div className="grid grid-cols-7 gap-2">
            {data.weekly_trend.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-28 rounded-xl flex items-end justify-center p-1 relative overflow-hidden">
                  <div
                    className="w-full bg-teal-500 rounded-lg transition-all duration-500"
                    style={{ height: `${Math.max(8, t.score)}%` }}
                  />
                  <span className="absolute top-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {t.score}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {t.date.split('-').slice(1).join('/')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contributing Habits Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Contributing Habit Breakdown
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Missing data is never treated as punitive failure. Only active habits you choose to track contribute to total weights.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <th className="pb-3">Habit</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Target</th>
                <th className="pb-3">Completion</th>
                <th className="pb-3">Assigned Weight</th>
                <th className="pb-3 text-right">Weighted Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data?.contributing_habits?.length > 0 ? (
                data.contributing_habits.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{h.title}</td>
                    <td className="py-3 capitalize text-teal-600 dark:text-teal-400">{h.category}</td>
                    <td className="py-3">{h.target}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        h.completed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {Math.round(h.completion_ratio * 100)}%
                      </span>
                    </td>
                    <td className="py-3 font-medium">{h.weight} pts</td>
                    <td className="py-3 text-right font-bold text-teal-600 dark:text-teal-400">
                      +{h.weighted_contribution}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No active habits configured. Create habits to populate your score matrix.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Non-Medical Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
        ⚠️ {data?.disclaimer || 'The Healthy Impact Score is a behavioral consistency metric and not a medical health assessment.'}
      </div>

      {/* Modal: Customize Weights */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-scale-up">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Customize Habit Weights
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust how much each health category influences your daily Healthy Impact Score.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(weights).map(([cat, val]) => (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    <span>{cat}</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{val} pts</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={val}
                    onChange={(e) => setWeights({ ...weights, [cat]: parseInt(e.target.value) })}
                    className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWeights}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer"
              >
                Save Weights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
