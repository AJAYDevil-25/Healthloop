import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  Trophy,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Footprints,
  Droplet,
  Moon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

const ICONS_MAP = {
  Footprints: Footprints,
  Droplet: Droplet,
  Moon: Moon,
  Target: Target,
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await api.getChallenges();
      if (data && data.challenges) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (challengeId) => {
    try {
      await api.joinChallenge(challengeId);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      loadChallenges();
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-sm shadow-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Wellness & Social Challenges
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Join community challenges, stay motivated with peers, and earn bonus experience points.
        </p>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((c) => {
          const Icon = ICONS_MAP[c.icon] || Target;
          const isJoined = c.is_joined;
          const pct = c.progress_percentage || 0;

          return (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {c.duration_days} Days Challenge
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {c.title}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    +{c.xp_reward} XP
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                  {c.description}
                </p>

                <div className="mt-4 flex items-center space-x-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-500" />
                    <span>{c.target_description}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.participants_count} joined</span>
                  </div>
                </div>

                {isJoined && (
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Progress: Day {c.progress_days} of {c.duration_days}
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                {isJoined ? (
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enrolled & Tracking Daily</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Free to join anytime</span>
                )}

                <button
                  onClick={() => handleJoin(c.id)}
                  disabled={isJoined}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    isJoined
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20'
                  }`}
                >
                  <span>{isJoined ? 'Active Challenge' : 'Join Challenge'}</span>
                  {!isJoined && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
