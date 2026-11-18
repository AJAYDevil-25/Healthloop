import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Droplets,
  Footprints,
  Moon,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import api from '../services/api';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'water',
    scheduled_time: '10:00',
    days_of_week: [1, 2, 3, 4, 5, 6, 7],
  });

  useEffect(() => {
    loadReminders();
    checkNotificationPermission();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await api.getReminders();
      if (data && data.reminders) {
        setReminders(data.reminders);
      }
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    } else {
      setNotificationStatus('unsupported');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        new Notification('HealthLoop Notifications Enabled!', {
          body: 'You will receive timely habit & hydration cues without excessive distraction.',
          icon: '/logo.png',
        });
      }
    }
  };

  const handleToggleEnabled = async (reminder) => {
    try {
      await api.updateReminder(reminder.id, { enabled: !reminder.enabled });
      loadReminders();
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    }
  };

  const handleDelete = async (reminderId) => {
    try {
      await api.deleteReminder(reminderId);
      loadReminders();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createReminder(formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'water',
        scheduled_time: '10:00',
        days_of_week: [1, 2, 3, 4, 5, 6, 7],
      });
      loadReminders();
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  };

  const testLiveNotification = async () => {
    try {
      const data = await api.testNotification();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, { body: data.body });
      } else {
        alert(`${data.title}: ${data.body}`);
      }
    } catch (err) {
      console.error('Failed to test notification:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500 text-white flex items-center justify-center shadow-sm shadow-cyan-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart Reminder System
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure cues for hydration, workouts, meditation, and sleep hygiene. Non-intrusive by design.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={testLiveNotification}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs flex items-center space-x-1.5"
          >
            <Volume2 className="w-4 h-4 text-cyan-500" />
            <span>Test Cue</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      {notificationStatus !== 'granted' && (
        <div className="p-4 rounded-3xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-900 dark:text-cyan-200">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Enable browser push notifications to receive scheduled habit reminders in real-time.</span>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shrink-0 shadow-xs transition-all"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs flex items-center justify-between transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{r.title}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {r.scheduled_time}
                  </span>
                  <span>•</span>
                  <span>Every day</span>
                  <span>•</span>
                  <span className="capitalize text-teal-600 dark:text-teal-400">{r.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Toggle Enabled */}
              <button
                onClick={() => handleToggleEnabled(r)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
                  r.enabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    r.enabled ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>

              <button
                onClick={() => handleDelete(r.id)}
                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-700 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Create Smart Reminder
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Afternoon Water Glass & Stretch"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                  />
                </div>

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
                    <option value="exercise">Exercise</option>
                    <option value="sleep">Sleep Routine</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="nutrition">Healthy Food</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md transition-all"
                >
                  Create Cue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
