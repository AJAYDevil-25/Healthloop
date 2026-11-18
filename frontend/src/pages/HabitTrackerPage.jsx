import React, { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Droplets,
  Footprints,
  Moon,
  Sparkles,
  Apple,
  Tv,
  Trash2,
  Edit2,
  X,
  Target,
  Clock,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const CATEGORY_ICONS = {
  water: Droplets,
  exercise: Footprints,
  sleep: Moon,
  mindfulness: Sparkles,
  nutrition: Apple,
  screen_time: Tv,
  custom: Target,
};

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'water',
    target_value: 2000,
    unit: 'ml',
    reminder_time: '10:00',
    color: '#06b6d4',
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await api.getHabits();
      if (data && data.habits) {
        setHabits(data.habits);
      }
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (habit) => {
    try {
      const newStatus = !habit.today_completed;
      await api.logHabit(habit.id, { completed: newStatus });
      if (newStatus) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
      loadHabits();
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const handleIncrement = async (habit, delta) => {
    try {
      await api.logHabit(habit.id, { delta });
      loadHabits();
    } catch (err) {
      console.error('Failed to increment progress:', err);
    }
  };

  const handleDelete = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    try {
      await api.deleteHabit(habitId);
      loadHabits();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await api.updateHabit(editingHabit.id, formData);
      } else {
        await api.createHabit(formData);
      }
      setShowAddModal(false);
      setEditingHabit(null);
      setFormData({
        title: '',
        category: 'water',
        target_value: 2000,
        unit: 'ml',
        reminder_time: '10:00',
        color: '#06b6d4',
      });
      loadHabits();
    } catch (err) {
      console.error('Failed to save habit:', err);
    }
  };

  const openEditModal = (h) => {
    setEditingHabit(h);
    setFormData({
      title: h.title,
      category: h.category,
      target_value: h.target_value,
      unit: h.unit,
      reminder_time: h.reminder_time || '09:00',
      color: h.color || '#10b981',
    });
    setShowAddModal(true);
  };

  const filteredHabits = selectedCategory === 'all'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  const completedCount = habits.filter((h) => h.today_completed).length;
  const overallPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Habit Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build consistency through micro-routines, daily logging, and streak maintenance.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingHabit(null);
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* Overview Progress Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-200 dark:border-teal-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            Today's Progress Overview
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {completedCount} of {habits.length} Habits Completed ({overallPercentage}%)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every log builds neural momentum. Keep stacking your daily wins!
          </p>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Daily Goal</span>
            <span>{overallPercentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-teal-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Habits' },
          { id: 'water', label: 'Hydration' },
          { id: 'exercise', label: 'Exercise & Walking' },
          { id: 'sleep', label: 'Sleep & Rest' },
          { id: 'mindfulness', label: 'Mindfulness' },
          { id: 'nutrition', label: 'Healthy Eating' },
          { id: 'screen_time', label: 'Screen Time' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHabits.map((h) => {
          const Icon = CATEGORY_ICONS[h.category] || Target;
          const target = h.target_value || 1;
          const current = h.today_achieved || 0;
          const pct = Math.min(100, Math.round((current / target) * 100));

          return (
            <div
              key={h.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-800 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                h.today_completed
                  ? 'border-emerald-200 dark:border-emerald-900/60 ring-1 ring-emerald-500/20'
                  : 'border-slate-100 dark:border-slate-700/80'
              }`}
            >
              {/* Top row */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: h.color || '#06b6d4' }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{h.title}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{h.reminder_time || 'Daily'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Streak & Actions */}
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{h.streak || 0}d</span>
                    </div>
                    <button
                      onClick={() => openEditModal(h)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">
                      Logged: <span className="text-slate-800 dark:text-slate-100 font-bold">{current}</span> / {target} {h.unit}
                    </span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{pct}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: h.color || '#06b6d4',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick-Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                {/* Numeric increment helper */}
                {h.category === 'water' ? (
                  <button
                    onClick={() => handleIncrement(h, 250)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 transition-colors"
                  >
                    +250ml Glass
                  </button>
                ) : h.category === 'exercise' ? (
                  <button
                    onClick={() => handleIncrement(h, 15)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    +15 mins
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Daily goal: {target} {h.unit}</span>
                )}

                {/* Completion Toggle Button */}
                <button
                  onClick={() => handleToggleComplete(h)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    h.today_completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {h.today_completed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4" />
                      <span>Mark Done</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingHabit ? 'Edit Healthy Habit' : 'Create New Healthy Habit'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Evening Stretching & Mobility"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                  >
                    <option value="water">Hydration</option>
                    <option value="exercise">Exercise & Steps</option>
                    <option value="sleep">Sleep Routine</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="nutrition">Healthy Food</option>
                    <option value="screen_time">Screen Time</option>
                    <option value="custom">Custom Habit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={formData.reminder_time}
                    onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Target
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. ml, mins, steps"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {['#06b6d4', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        backgroundColor: c,
                        transform: formData.color === c ? 'scale(1.2)' : 'scale(1)',
                        border: formData.color === c ? '2px solid white' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all"
                >
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
