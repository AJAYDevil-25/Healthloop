import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Droplets,
  Moon,
  Footprints,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics(range);
      if (data && data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const labels = analytics?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 1. Completion Percentage Trend
  const completionData = {
    labels,
    datasets: [
      {
        label: 'Habit Completion (%)',
        data: analytics?.activity?.completion_percentages || [75, 82, 88, 70, 92, 85, 78],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
    ],
  };

  // 2. Water Intake Bar Chart
  const waterData = {
    labels,
    datasets: [
      {
        label: 'Water Intake (ml)',
        data: analytics?.activity?.water_ml || [2400, 2200, 2500, 1865, 2300, 2600, 2450],
        backgroundColor: '#06b6d4',
        borderRadius: 8,
      },
    ],
  };

  // 3. Sleep History Chart
  const sleepData = {
    labels,
    datasets: [
      {
        label: 'Sleep Duration (hrs)',
        data: analytics?.activity?.sleep_hours || [7.6, 7.2, 8.0, 7.5, 7.8, 8.2, 7.4],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  // 4. Doughnut Category Breakdown
  const categories = analytics?.category_breakdown || [
    { title: 'Hydration', percentage: 75, color: '#06b6d4' },
    { title: 'Fitness', percentage: 65, color: '#10b981' },
    { title: 'Sleep', percentage: 90, color: '#3b82f6' },
    { title: 'Mindfulness', percentage: 80, color: '#8b5cf6' },
  ];

  const doughnutData = {
    labels: categories.map((c) => c.title),
    datasets: [
      {
        data: categories.map((c) => c.percentage),
        backgroundColor: categories.map((c) => c.color),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Behaviour & Health Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven insights on habit retention, consistency scores, and recovery metrics.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-auto">
          {[
            { id: '7d', label: '7 Days' },
            { id: '2w', label: '14 Days' },
            { id: '1m', label: '1 Month' },
            { id: 'all', label: 'All Time' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                range === r.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Consistency Index */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Consistency Index</span>
            <span className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {analytics?.consistency_index?.score || 78}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {analytics?.consistency_index?.rating || 'Excellent'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on active logging across {range}</p>
        </div>

        {/* Average Water */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hydration Avg</span>
            <span className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Droplets className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">2,310</span>
            <span className="text-xs text-slate-500">ml / day</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">92% of target threshold met</p>
        </div>

        {/* Average Sleep */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sleep Average</span>
            <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Moon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">7.6</span>
            <span className="text-xs text-slate-500">hours / night</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Within optimal restorative range</p>
        </div>

        {/* Habit Recovery Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Drop Recovery Rate</span>
            <span className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {analytics?.recovery_stats?.recovery_rate_percentage || 100}%
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Bounced Back
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Assisted by AI micro-targets</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Completion Trend */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Daily Habit Completion Trend (%)
          </h3>
          <div className="h-64">
            <Line
              data={completionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { min: 0, max: 100 },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Water Intake History */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Hydration History (ml)
          </h3>
          <div className="h-64">
            <Bar
              data={waterData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Sleep Duration Trend */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Sleep Duration & Recovery (Hours)
          </h3>
          <div className="h-64">
            <Line
              data={sleepData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { min: 4, max: 10 },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Category Breakdown & Consistency Insights */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">
            Habit Category Distribution
          </h3>
          <div className="flex items-center justify-center h-48">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500">
            Balanced habits across hydration, sleep, and movement create highest long-term adherence.
          </div>
        </div>
      </div>
    </div>
  );
}
