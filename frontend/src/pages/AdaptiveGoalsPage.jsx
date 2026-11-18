import React, { useState, useEffect } from 'react';
import { Target, TrendingDown, TrendingUp, Check, X, Edit3, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AdaptiveGoalsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [customVal, setCustomVal] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await api.getAdaptiveGoals();
      setData(res);
    } catch (err) {
      console.error('Failed to load adaptive goals', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (rec, action, customTarget = null) => {
    try {
      const payload = {
        action,
        habit_id: rec.habit_id,
        habit_title: rec.habit_title,
        target_value: customTarget || rec.recommended_target,
        unit: rec.unit,
        category: rec.category
      };
      const res = await api.applyGoalAction(payload);
      setActionMessage(res.message);
      setEditingGoal(null);
      loadGoals();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update goal');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Adaptive Goal Generator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Calibrated targets that step down after missed streaks and scale up as consistency strengthens.
            </p>
          </div>
        </div>

        <button
          onClick={loadGoals}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* User Autonomy Mandate Notice */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
          <span className="font-bold">Autonomous User Control:</span> HealthLoop never automatically alters your habit commitments without your express approval. You hold full sovereignty to Accept, Dismiss, or Customize every recommendation.
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 animate-fade-in">
          {actionMessage}
        </div>
      )}

      {/* Adaptive Recommendations */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-teal-500" />
          <span>Personalized Goal Recommendations</span>
        </h2>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Evaluating habit completion curves...</div>
        ) : data?.adaptive_recommendations?.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            All your habit targets are currently well-aligned with your performance velocity.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.adaptive_recommendations.map((rec) => {
              const isStepDown = rec.type === 'step_down_recovery';
              const isEditing = editingGoal === rec.id;

              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {rec.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                          {rec.habit_title}
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                          isStepDown
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                        }`}
                      >
                        {isStepDown ? (
                          <>
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Step-Down Recovery</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Level-Up Progression</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Target comparison */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-400 text-[10px]">Current Target</div>
                        <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {rec.current_target} {rec.unit}
                        </div>
                      </div>
                      <div className="text-slate-400">➔</div>
                      <div>
                        <div className="text-teal-600 dark:text-teal-400 font-bold text-[10px]">Suggested Target</div>
                        <div className="font-bold text-teal-600 dark:text-teal-400 mt-0.5 text-sm">
                          {rec.recommended_target} {rec.unit}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rec.rationale}
                    </p>
                  </div>

                  {/* Actions: Accept, Reject, Edit */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={customVal}
                          onChange={(e) => setCustomVal(e.target.value)}
                          placeholder="Custom value"
                          className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                        />
                        <button
                          onClick={() => handleAction(rec, 'modify', customVal)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingGoal(null)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleAction(rec, 'accept')}
                          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Target</span>
                        </button>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingGoal(rec.id);
                              setCustomVal(rec.recommended_target);
                            }}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition cursor-pointer"
                            title="Edit custom value"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction(rec, 'reject')}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="Dismiss recommendation"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
