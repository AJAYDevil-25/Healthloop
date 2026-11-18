import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, ShieldCheck, TrendingDown, TrendingUp, Info, Lightbulb, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function HabitPredictionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPredictions();
      setData(res.prediction_data);
    } catch (err) {
      setError(err.message || 'Failed to calculate predictions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Habit Interruption Prediction
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Statistical risk modeling to foresee habit disruptions before they happen.
            </p>
          </div>
        </div>

        <button
          onClick={loadPredictions}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recalculate Models</span>
        </button>
      </div>

      {/* Overview Stat Badges */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              data.overall_risk_level === 'High'
                ? 'bg-rose-500/10 text-rose-500'
                : data.overall_risk_level === 'Moderate'
                ? 'bg-amber-500/10 text-amber-500'
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tomorrow's Overall Risk</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{data.overall_risk_level} Risk</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average Consistency</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{data.average_consistency}%</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitored Habits</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{data.habits?.length || 0} Habits</div>
            </div>
          </div>
        </div>
      )}

      {/* Preventive Tips Box */}
      {data?.preventive_recommendations && (
        <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-5 border border-purple-200 dark:border-purple-800 shadow-xs space-y-2.5">
          <div className="flex items-center space-x-2 text-purple-900 dark:text-purple-300 font-semibold text-sm">
            <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Behavioral Preventive Actions</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
            {data.preventive_recommendations.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Habit-by-Habit Risk Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Habit Interruption Likelihood Matrix
        </h2>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Analyzing 30-day behavioral trajectories...
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-sm">
            {error}
          </div>
        ) : data?.habits?.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            No habits active to generate predictions. Create habits in the tracker first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.habits.map((h) => {
              const prob = h.interruption_probability_percent;
              const isHigh = prob >= 50;
              const isMod = prob >= 28 && prob < 50;

              return (
                <div
                  key={h.habit_id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {h.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {h.title}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isHigh
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          : isMod
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {prob}% Interruption Risk
                    </span>
                  </div>

                  {/* Probability Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Miss Likelihood ({h.target_day})</span>
                      <span>{prob}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>

                  {/* Baseline metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">30-Day Baseline</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {h.baseline_completion_rate}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-slate-400 text-[10px]">Recent 7-Day Trend</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                        {h.recent_7d_completion_rate}%
                      </div>
                    </div>
                  </div>

                  {/* Contributing Factors */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      Contributing Model Factors:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      {h.contributing_factors.map((f, idx) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Actionable Preventive Tip */}
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/80 text-xs text-teal-800 dark:text-teal-300">
                    <span className="font-semibold">Preventive Plan:</span> {h.actionable_recommendation}
                  </div>

                  {/* Confidence */}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right">
                    Statistical Confidence: {h.confidence}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scientific Transparency Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 text-teal-600" />
        {data?.disclaimer || 'Predictions are transparent statistical probability calculations derived from your self-reported habit logs. They are not clinical diagnoses or psychological predictions.'}
      </div>
    </div>
  );
}
