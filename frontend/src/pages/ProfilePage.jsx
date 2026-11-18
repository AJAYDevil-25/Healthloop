import React, { useState, useEffect } from 'react';
import {
  User,
  Heart,
  Droplets,
  Moon,
  Activity,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    age: 30,
    gender: 'male',
    height_cm: 178,
    weight_kg: 74.5,
    daily_water_target_ml: 2500,
    daily_sleep_target_hours: 8.0,
    daily_exercise_target_mins: 45,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || user?.username || '',
        bio: profile.bio || '',
        age: profile.age || 30,
        gender: profile.gender || 'male',
        height_cm: profile.height_cm || 178,
        weight_kg: profile.weight_kg || 74.5,
        daily_water_target_ml: profile.daily_water_target_ml || 2500,
        daily_sleep_target_hours: profile.daily_sleep_target_hours || 8.0,
        daily_exercise_target_mins: profile.daily_exercise_target_mins || 45,
      });
    }
  }, [profile, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // BMI calculation
  const heightM = (formData.height_cm || 175) / 100;
  const bmi = heightM > 0 ? ((formData.weight_kg || 70) / (heightM * heightM)).toFixed(1) : 22.5;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Health Profile
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your biometric profile and custom daily lifestyle thresholds.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile & Health targets updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-teal-500/30 shadow-md"
          />
          <div className="flex-1 w-full space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'adam@healthloop.ai'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bio / Personal Wellness Motto
              </label>
              <input
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Consistent habits over heroic bursts."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Biometrics & BMI */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Biometrics & Body Composition</span>
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold">
              BMI: {bmi} (Healthy Range)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-Binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height_cm"
                value={formData.height_cm}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Daily Target Thresholds */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daily Recommended Targets
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40">
              <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 mb-2">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-bold">Water Goal (ml)</span>
              </div>
              <input
                type="number"
                name="daily_water_target_ml"
                value={formData.daily_water_target_ml}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-cyan-200 dark:border-cyan-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
                <Moon className="w-4 h-4" />
                <span className="text-xs font-bold">Sleep Goal (hours)</span>
              </div>
              <input
                type="number"
                step="0.5"
                name="daily_sleep_target_hours"
                value={formData.daily_sleep_target_hours}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold">Exercise Goal (mins)</span>
              </div>
              <input
                type="number"
                name="daily_exercise_target_mins"
                value={formData.daily_exercise_target_mins}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Health Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
