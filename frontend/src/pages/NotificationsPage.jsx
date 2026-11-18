import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ShieldCheck, Moon, Droplets, Footprints, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function NotificationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    inactivity_nudges: true,
    hydration_reminders: true,
    habit_recovery_nudges: true
  });
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setData(res);
      if (res.preferences) {
        setPrefs(res.preferences);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      loadNotifications();
    } catch (err) {
      alert(err.message || 'Failed to mark as read');
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await api.updateNotificationPreferences(prefs);
      setSaveStatus('Preferences saved successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save preferences');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Reminders & Adaptive Interventions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Just-in-Time Adaptive Interventions (JITAI) calibrated to your active hours and quiet windows.
            </p>
          </div>
        </div>

        {data?.unread_count > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 hover:bg-teal-100 text-xs font-semibold transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Non-Guilt Principle Notice */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
          <span className="font-bold">Compassionate Notification Policy:</span> HealthLoop never uses guilt-based, shaming, or spam notifications. Rate limiting restricts reminders to a maximum of 1 nudge per category every 3 hours, and quiet hours are strictly honored.
        </div>
      </div>

      {/* Quiet Hours & JITAI Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Quiet Hours & Intervention Preferences</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize when and how the adaptive intervention engine reaches out to you.
            </p>
          </div>
          {saveStatus && (
            <span className="text-xs text-emerald-600 font-bold animate-fade-in">{saveStatus}</span>
          )}
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quiet Hours Start</label>
              <input
                type="time"
                value={prefs.quiet_hours_start}
                onChange={(e) => setPrefs({ ...prefs, quiet_hours_start: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quiet Hours End</label>
              <input
                type="time"
                value={prefs.quiet_hours_end}
                onChange={(e) => setPrefs({ ...prefs, quiet_hours_end: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.inactivity_nudges}
                onChange={(e) => setPrefs({ ...prefs, inactivity_nudges: e.target.checked })}
                className="rounded-sm text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Inactivity Breaks</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.hydration_reminders}
                onChange={(e) => setPrefs({ ...prefs, hydration_reminders: e.target.checked })}
                className="rounded-sm text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Hydration Reminders</span>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.habit_recovery_nudges}
                onChange={(e) => setPrefs({ ...prefs, habit_recovery_nudges: e.target.checked })}
                className="rounded-sm text-teal-600 focus:ring-teal-500"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Micro-Habit Salvage</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs tracking-wide transition cursor-pointer"
          >
            Save Preferences
          </button>
        </form>
      </div>

      {/* Notification Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Notification Stream
        </h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading notifications...</div>
        ) : data?.notifications?.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            You are all caught up! No pending notifications.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleMarkOneRead(n._id)}
                className={`py-4 flex items-start justify-between gap-4 transition cursor-pointer ${
                  !n.is_read ? 'bg-teal-50/30 dark:bg-teal-950/20 px-3 rounded-xl' : 'px-3'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    n.category === 'hydration'
                      ? 'bg-sky-500/10 text-sky-600'
                      : n.category === 'movement'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-purple-500/10 text-purple-600'
                  }`}>
                    {n.category === 'hydration' ? (
                      <Droplets className="w-5 h-5" />
                    ) : (
                      <Footprints className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm ${!n.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
