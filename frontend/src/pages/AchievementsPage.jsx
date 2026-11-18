import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  Droplets,
  Moon,
  Footprints,
  Shield,
  Medal,
  Crown,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const BADGE_ICONS = {
  Footprints,
  Flame,
  Droplets,
  Moon,
  Activity: Footprints,
  Award,
  Sparkles,
};

export default function AchievementsPage() {
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamification();
  }, []);

  const loadGamification = async () => {
    try {
      const [gamRes, leadRes] = await Promise.all([
        api.getGamification(),
        api.getLeaderboard(),
      ]);
      if (gamRes && gamRes.gamification) setGamification(gamRes.gamification);
      if (leadRes && leadRes.leaderboard) setLeaderboard(leadRes.leaderboard);
    } catch (err) {
      console.error('Failed to load gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCelebrate = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const badges = gamification?.badges || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gamification & Badges
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Celebrate progress milestones, unlock achievement badges, and level up your healthy identity.
        </p>
      </div>

      {/* Level & Points Hero Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-200 dark:border-amber-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div
            onClick={handleCelebrate}
            className="w-16 h-16 rounded-3xl bg-linear-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 cursor-pointer hover:scale-105 transition-transform"
            title="Click to celebrate!"
          >
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Current Level Tier
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-bold">
                {gamification?.level || 'Gold Explorer'}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {gamification?.points || 850} Total Health XP
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {gamification?.points_needed || 650} XP needed for {gamification?.next_level || 'Platinum Master'}
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Tier Progress</span>
            <span>{gamification?.progress_to_next_level || 56}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-amber-500 to-yellow-400 transition-all duration-700"
              style={{ width: `${gamification?.progress_to_next_level || 56}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Badges Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Achievement Badges ({gamification?.unlocked_count || 3} of {badges.length || 7} Unlocked)
            </h3>
            <span className="text-xs text-slate-400">Earn XP by completing habits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((b) => {
              const Icon = BADGE_ICONS[b.badge_icon] || Award;
              const isUnlocked = b.unlocked;

              return (
                <div
                  key={b.code}
                  className={`p-4 rounded-3xl border transition-all duration-200 flex items-start space-x-3.5 ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/60 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{b.title}</h4>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        +{b.points} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {b.description}
                    </p>
                    {isUnlocked && (
                      <div className="mt-2 flex items-center space-x-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Unlocked</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Medal className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Community Leaderboard
            </h3>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((u) => (
              <div
                key={u.rank}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      u.rank === 1
                        ? 'bg-amber-400 text-amber-950'
                        : u.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : u.rank === 3
                        ? 'bg-orange-300 text-orange-950'
                        : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {u.rank}
                  </span>
                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                      {u.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{u.level}</span>
                  </div>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400">{u.points} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
