import React, { useState } from 'react';
import { Search, SlidersHorizontal, Bell, Sparkles, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleMobileMenu, onNavigate }) {
  const { user, profile, isGuest } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Hydration Goal Alert', time: '10:00 AM', text: 'Drink a glass of water to keep your 6-day streak alive!', unread: true },
    { id: 2, title: 'AI Health Coach Insight', time: 'Yesterday', text: 'Your 7.5h sleep score boosted recovery by 14%.', unread: false },
    { id: 3, title: 'Achievement Unlocked', time: '2 days ago', text: "You earned the '7-Day Streak' badge!", unread: false },
  ];

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Hamburger + Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Guest Demo Badge */}
        {isGuest && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>Evaluator Demo Mode (Sample Data Active)</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search habits, insights..."
            className="w-48 lg:w-64 pl-9 pr-4 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 border-none focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Reminders & Alerts
                </h4>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center space-x-2.5 pl-2 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover border-2 border-teal-500 shadow-xs"
          />
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {profile?.display_name || user?.username || 'Adam'}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              {profile?.level || 'Gold Explorer'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
