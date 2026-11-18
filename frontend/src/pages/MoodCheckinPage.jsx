import React, { useState, useEffect } from 'react';
import { Smile, Frown, Meh, BatteryCharging, Zap, CloudRain, Heart, Send, Sparkles, AlertCircle, TrendingUp, Calendar } from 'lucide-react';
import api from '../services/api';

const MOODS = [
  { name: 'Happy', icon: Smile, color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' },
  { name: 'Energetic', icon: Zap, color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' },
  { name: 'Neutral', icon: Meh, color: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700' },
  { name: 'Tired', icon: BatteryCharging, color: 'text-indigo-500 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800' },
  { name: 'Stressed', icon: AlertCircle, color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800' },
  { name: 'Sad', icon: CloudRain, color: 'text-sky-500 bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800' }
];

export default function MoodCheckinPage() {
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [notes, setNotes] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getMoodHistory(15);
      setHistoryData(res);
    } catch (err) {
      console.error('Failed to load mood history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.checkinMood({
        mood: selectedMood,
        energy_level: energyLevel,
        notes: notes.trim(),
        tags: [selectedMood.toLowerCase()]
      });
      setLatestFeedback(res);
      setNotes('');
      fetchHistory();
    } catch (err) {
      alert(err.message || 'Failed to submit mood check-in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mood Check-in & Emotional Wellness
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track voluntary emotional states and receive evidence-informed AI coaching support.
            </p>
          </div>
        </div>
      </div>

      {/* Check-in Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
          <span>How are you feeling right now?</span>
        </h2>

        {/* Mood Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {MOODS.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMood === m.name;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => setSelectedMood(m.name)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                  isSelected
                    ? `${m.color} ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 font-semibold scale-102`
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-7 h-7" />
                <span className="text-xs">{m.name}</span>
              </button>
            );
          })}
        </div>

        {/* Energy Level Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300">
            <span>Energy Level:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
              {energyLevel} / 5
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
            className="w-full accent-teal-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>1 (Depleted)</span>
            <span>3 (Balanced)</span>
            <span>5 (Peak Vitality)</span>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Optional Reflections or Triggers
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Great workout this morning, took a restful walk in the park..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <span>Recording Check-in...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Record Mood Check-in</span>
            </>
          )}
        </button>
      </div>

      {/* Latest AI Feedback Banner */}
      {latestFeedback && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 space-y-3 animate-fade-in">
          <div className="flex items-center space-x-2 text-teal-800 dark:text-teal-300 font-semibold text-sm">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>AI Wellness Guidance</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {latestFeedback.ai_support}
          </p>
          {latestFeedback.crisis_support && (
            <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{latestFeedback.crisis_support}</span>
            </div>
          )}
        </div>
      )}

      {/* Mood Distribution & Correlation Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribution Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-teal-500" />
            <span>Recent Mood Distribution</span>
          </h3>
          {historyData?.distribution ? (
            <div className="space-y-3 pt-2">
              {Object.entries(historyData.distribution).map(([name, count]) => {
                const total = historyData.total_checkins || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span>{name}</span>
                      <span>{count} times ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-400 py-4 text-center">No distribution records yet.</div>
          )}
        </div>

        {/* Mood vs Habit Correlation Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-teal-500" />
            <span>Mood & Habit Adherence Correlation</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            See how your recorded mood aligns with your daily habit completion rate.
          </p>
          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {historyData?.correlations?.length > 0 ? (
              historyData.correlations.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{c.date}</span>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Mood: <span className="font-medium text-teal-600 dark:text-teal-400">{c.mood}</span> (Energy: {c.energy_level}/5)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                      {c.habit_completion_rate !== null ? `${c.habit_completion_rate}% Habits` : 'No logs'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">Log more moods and habits to generate correlations.</div>
            )}
          </div>
        </div>
      </div>

      {/* Non-Medical Disclaimer Banner */}
      <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400">
        ⚠️ HealthLoop is a wellness motivation platform. It does not diagnose mental health disorders, psychological conditions, or provide clinical psychotherapy.
      </div>
    </div>
  );
}
