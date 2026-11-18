import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Bot,
  TrendingUp,
  Trophy,
  Users,
  Bell,
  User,
  Shield,
  Moon,
  Sun,
  LogOut,
  Sparkles,
  Heart,
  Brain,
  Cpu,
  Target,
  Activity,
  Mic,
  Watch,
  CalendarClock,
  Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ currentPage, onNavigate }) {
  const { logout, isGuest } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
        { id: 'habits', label: 'Daily Habit Tracker', icon: CheckSquare },
        { id: 'virtual-garden', label: 'Virtual Garden (3D)', icon: Sprout, badge: '3D' },
        { id: 'impact-score', label: 'Healthy Impact Score', icon: Activity },
      ]
    },
    {
      title: 'AI & INTELLIGENCE',
      items: [
        { id: 'ai-coach', label: 'AI Health Coach', icon: Bot, badge: 'AI' },
        { id: 'mood-checkin', label: 'Mood Check-in', icon: Heart },
        { id: 'habit-prediction', label: 'Habit Prediction', icon: Brain, badge: 'ML' },
        { id: 'digital-twin', label: 'Digital Twin (3D)', icon: Cpu, badge: '3D' },
        { id: 'adaptive-goals', label: 'Adaptive Goals', icon: Target },
        { id: 'routine-planner', label: 'Routine Planner', icon: CalendarClock },
        { id: 'voice-assistant', label: 'Voice Assistant', icon: Mic, badge: 'Voice' },
      ]
    },
    {
      title: 'ANALYTICS & SYNC',
      items: [
        { id: 'analytics', label: 'Behaviour Analytics', icon: TrendingUp },
        { id: 'wearables', label: 'Wearable Integration', icon: Watch },
        { id: 'notifications', label: 'Smart Notifications', icon: Bell },
        { id: 'challenges', label: 'Social Challenges', icon: Users },
        { id: 'achievements', label: 'Achievements', icon: Trophy },
      ]
    },
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        { id: 'profile', label: 'User Profile', icon: User },
        { id: 'privacy', label: 'Privacy & Security', icon: Shield },
      ]
    }
  ];

  return (
    <aside className="w-68 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 transition-colors duration-200 z-30 select-none">
      {/* Brand & Logo */}
      <div className="overflow-hidden flex flex-col h-full">
        <div className="p-5 pb-4 flex items-center space-x-3 shrink-0 border-b border-slate-100 dark:border-slate-800">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                HealthLoop 2.0
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Behavior & Motivation AI
            </p>
          </div>
        </div>

        {/* Scrollable Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 shrink-0">
        {/* Dark/Light mode toggle */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            {isDark ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className="text-[11px]">{isDark ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Toggle
          </button>
        </div>

        {/* Guest Badge / Sign Out */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs">
          {isGuest && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md">
              Guest Sandbox
            </span>
          )}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-rose-600 transition ml-auto text-[11px] font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
