import React, { useState, useEffect } from 'react';
import {
  Flame,
  Moon,
  Footprints,
  Droplets,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Bot,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import confetti from 'canvas-confetti';
import CircularProgress from '../components/CircularProgress';
import MultiRingProgress from '../components/MultiRingProgress';
import DropDetectionBanner from '../components/DropDetectionBanner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage({ onNavigate }) {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [drops, setDrops] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('activity');
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, [selectedRange]);

  const loadDashboardData = async () => {
    try {
      const [sumRes, dropRes, analRes, aiRes] = await Promise.all([
        api.getTodaySummary(),
        api.getDropStatus(),
        api.getAnalytics(selectedRange),
        api.getAIDailySuggestions(),
      ]);

      if (sumRes && sumRes.summary) setSummary(sumRes.summary);
      if (dropRes && dropRes.active_drops) setDrops(dropRes.active_drops);
      if (analRes && analRes.analytics) setAnalytics(analRes.analytics);
      if (aiRes && aiRes.suggestions) setAiSuggestions(aiRes.suggestions);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId, currentCompleted) => {
    try {
      const newStatus = !currentCompleted;
      await api.logHabit(habitId, { completed: newStatus });
      if (newStatus) {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.6 },
        });
      }
      loadDashboardData();
    } catch (err) {
      console.error('Failed to log habit:', err);
    }
  };

  // Prepare Wave Line Chart Data matching reference image
  const chartLabels = analytics?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const runningData = analytics?.activity?.running_km || [8, 5, 4.2, 10, 5, 8.5, 4];
  const stepsData = (analytics?.activity?.steps || [5200, 6800, 7100, 5800, 8400, 9200, 6100]).map(
    (s) => Math.round((s / 1000) * 10) / 10
  );

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Running (km)',
        data: runningData,
        borderColor: '#a855f7', // purple curve
        backgroundColor: 'rgba(168, 85, 247, 0.08)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: '#a855f7',
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: 'Steps (k)',
        data: stepsData,
        borderColor: '#0284c7', // blue curve
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        tension: 0.45,
        fill: true,
        pointBackgroundColor: '#0284c7',
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 8,
          usePointStyle: true,
          font: { size: 11, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        ticks: { font: { size: 10 } },
      },
    },
  };

  // Calendar dates generation
  const daysInMonth = 30; // standard representation
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const activeDay = 24; // matching reference image

  const userName = profile?.display_name || user?.username || 'Adam';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Behaviour Drop Detection Alert Banner (Innovations Feature 7) */}
      <DropDetectionBanner drops={drops} onResolved={loadDashboardData} />

      {/* Main Grid: Left Main Analytics, Right Calendar & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
            {/* Welcome Greeting Banner matching reference */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Unlock Your Best Self, {userName}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                  Elevate the quality of your life and enhance your overall well-being by effortlessly tracking and cultivating positive habits with HealthLoop.
                </p>
              </div>

              {/* Healthy Impact Score & Quick Mood Action */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onNavigate('impact-score')}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 hover:opacity-95 transition flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Impact Score: {summary?.health_score || 88}/100</span>
                </button>
                <button
                  onClick={() => onNavigate('mood-checkin')}
                  className="px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Record Today's Mood"
                >
                  😊 Check In
                </button>
              </div>
            </div>

            {/* Quick Interactive Widgets: Virtual Garden Preview & AI Prediction Alert */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => onNavigate('virtual-garden')}
                className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between cursor-pointer hover:shadow-xs transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">Virtual Habit Garden</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Your Oak of Vitality is thriving. Tap to visit 3D sanctuary.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>

              <div
                onClick={() => onNavigate('habit-prediction')}
                className="p-4 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between cursor-pointer hover:shadow-xs transition"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔮</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">AI Habit Interruption Model</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Low risk tomorrow. 1 preventive recommendation active.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              </div>
            </div>

          {/* Activity Filters and Time Range Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* View category tabs */}
            <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-1">
              {[
                { id: 'activity', label: 'Activity history' },
                { id: 'sleep', label: 'Sleep history' },
                { id: 'science', label: 'Science history' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs sm:text-sm font-semibold pb-1 transition-all relative ${
                    activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time range pills */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {['today', '7d', '2w', '1m', 'all'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRange(r)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                    selectedRange === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Dual-Wave Line Chart */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div className="h-64 sm:h-72 w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Metric Circular Gauges Grid (6 Cards exactly matching reference image) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* 1. Calories */}
            <CircularProgress
              title="Calories"
              value={summary?.calories || 867}
              max={1500}
              unit="kcal"
              color="#3b82f6"
              icon={Flame}
            />

            {/* 2. Sleep time */}
            <CircularProgress
              title="Sleep time"
              value={summary?.sleep?.achieved || 7.5}
              max={summary?.sleep?.target || 8.0}
              unit="hours"
              color="#0284c7"
              icon={Moon}
              formatValue={(val) => val.toFixed(1)}
            />

            {/* 3. Steps */}
            <CircularProgress
              title="Steps"
              value={(summary?.steps?.achieved || 5800) / 1000}
              max={(summary?.steps?.target || 8000) / 1000}
              unit="Thousand"
              color="#0ea5e9"
              icon={Footprints}
              formatValue={(val) => val.toFixed(1)}
            />

            {/* 4. Activities Completion Percentage */}
            <CircularProgress
              title="Activities"
              value={summary?.completion_percentage || 72}
              max={100}
              showPercentage={true}
              color="#8b5cf6"
              icon={Puzzle}
            />

            {/* 5. Water Intake */}
            <CircularProgress
              title="Water"
              value={summary?.water?.achieved || 1865}
              max={summary?.water?.target || 2500}
              unit={`of ${summary?.water?.target || 2500} ml`}
              color="#06b6d4"
              icon={Droplets}
            />

            {/* 6. Concentric Mind Rings */}
            <MultiRingProgress
              items={[
                { title: 'Reading', percentage: 42, color: '#8b5cf6' },
                { title: 'Languages', percentage: 85, color: '#3b82f6' },
                { title: 'Chess', percentage: 44, color: '#06b6d4' },
                { title: 'Meditation', percentage: 81, color: '#10b981' },
              ]}
            />
          </div>

          {/* AI-Generated Daily Suggestions Card */}
          <div className="bg-linear-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 p-5 rounded-3xl border border-teal-200 dark:border-teal-800/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  AI Health Coach Suggestions For Today
                </h4>
              </div>
              <button
                onClick={() => onNavigate('ai-coach')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1"
              >
                <span>Chat with Coach</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {aiSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        {sug.badge}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{sug.title}</h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {sug.text}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('habits')}
                    className="mt-2.5 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center space-x-1"
                  >
                    <span>{sug.action}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar Widget & Schedule Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Card matching reference */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-xs">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                September 2026
              </h3>
              <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Numbers Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {/* Prior month trailing days */}
              <span className="p-2 text-slate-300 dark:text-slate-600">27</span>
              <span className="p-2 text-slate-300 dark:text-slate-600">28</span>
              <span className="p-2 text-slate-300 dark:text-slate-600">29</span>
              <span className="p-2 text-slate-300 dark:text-slate-600">30</span>
              <span className="p-2 text-slate-300 dark:text-slate-600">31</span>
              <span className="p-2 text-slate-600 dark:text-slate-400 font-medium">1</span>
              <span className="p-2 text-slate-600 dark:text-slate-400 font-medium">2</span>

              {calendarDays.slice(2, 28).map((day) => {
                const isSelected = day === activeDay;
                return (
                  <button
                    key={day}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Checklist matching reference image */}
          <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Schedule
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                24.09.2026
              </span>
            </div>

            {/* Schedule Items */}
            <div className="space-y-2.5">
              {[
                { id: 'h_meditation_4', title: 'Meditation', time: '07:30 AM', completed: true },
                { id: 'h_exercise_5', title: 'Gym & Strength', time: '02:30 PM', completed: false, highlight: true },
                { id: 'h_reading', title: 'Reading Books', time: '06:30 PM', completed: false },
                { id: 'h_spanish', title: 'Spanish Lesson', time: '08:30 PM', completed: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleHabit(item.id, item.completed)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    item.highlight
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : item.completed
                      ? 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                      : 'bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.completed ? (
                      <CheckCircle2 className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-emerald-500'}`} />
                    ) : (
                      <Circle className={`w-4 h-4 ${item.highlight ? 'text-white' : 'text-slate-400'}`} />
                    )}
                    <span className="text-xs font-semibold">{item.title}</span>
                  </div>
                  <span className={`text-[11px] font-medium ${item.highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('habits')}
              className="w-full mt-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all text-center block"
            >
              Manage All Habits & Daily Targets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
