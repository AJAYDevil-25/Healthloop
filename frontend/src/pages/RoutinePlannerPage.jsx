import React, { useState, useEffect } from 'react';
import { CalendarClock, Sun, Sunset, Moon, Coffee, Sparkles, Check, Edit2, Plus, Clock } from 'lucide-react';
import api from '../services/api';

export default function RoutinePlannerPage() {
  const [routinesData, setRoutinesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Preference parameters
  const [wakeTime, setWakeTime] = useState('06:30');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:30');

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const res = await api.getRoutines();
      setRoutinesData(res);
    } catch (err) {
      console.error('Failed to load routines', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.generateRoutine({
        wake_time: wakeTime,
        sleep_time: sleepTime,
        work_start: workStart,
        work_end: workEnd,
        focus_areas: ['Hydration', 'Circadian Light', 'Desk Mobility', 'Digital Sunset']
      });
      loadRoutines();
    } catch (err) {
      alert(err.message || 'Failed to generate routine');
    } finally {
      setGenerating(false);
    }
  };

  const active = routinesData?.active_routine;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <CalendarClock className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Smart Healthy Routine Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Structure your day into circadian-aligned wellness blocks tailored to your personal availability.
          </p>
        </div>
      </div>

      {/* Routine Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>Generate Circadian-Optimized Schedule</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Input your preferred schedule constraints. The engine synchronizes your active habits with optimal biological windows.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wake Up Time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work/Study Start</label>
            <input
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work/Study End</label>
            <input
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sleep Target Time</label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          {generating ? 'Calculating Constraints...' : 'Generate Personalized Daily Routine'}
        </button>
      </div>

      {/* Routine Display Blocks */}
      {active ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {active.title}
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              Active Routine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Morning Routine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm">
                <Sun className="w-5 h-5" />
                <span>Morning Routine (Awakening & Energy)</span>
              </div>
              <div className="space-y-3">
                {active.morning_routine?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{item.title}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-mono">{item.time} ({item.duration_min}m)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Afternoon Routine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-sky-500 font-bold text-sm">
                <Coffee className="w-5 h-5" />
                <span>Afternoon Routine (Sustained Focus & Pacing)</span>
              </div>
              <div className="space-y-3">
                {active.afternoon_routine?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{item.title}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-mono">{item.time} ({item.duration_min}m)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evening Routine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-indigo-500 font-bold text-sm">
                <Sunset className="w-5 h-5" />
                <span>Evening Routine (Decompression & Physical Release)</span>
              </div>
              <div className="space-y-3">
                {active.evening_routine?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{item.title}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-mono">{item.time} ({item.duration_min}m)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sleep Prep Routine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-purple-500 font-bold text-sm">
                <Moon className="w-5 h-5" />
                <span>Sleep Preparation (Circadian Wind-Down)</span>
              </div>
              <div className="space-y-3">
                {active.sleep_prep_routine?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{item.title}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-mono">{item.time} ({item.duration_min}m)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-400">
          Click the "Generate Personalized Daily Routine" button above to create your circadian wellness plan.
        </div>
      )}
    </div>
  );
}
