import React from 'react';
import {
  Trophy,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  Cpu,
  Code,
  Flame,
  Box,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: any;
  requirement: string;
  isUnlocked: (user: any) => boolean;
}

const BADGES: BadgeDefinition[] = [
  {
    id: 'first-spark',
    title: 'First Spark',
    description: 'Complete your first interactive lesson in the curriculum.',
    icon: Zap,
    requirement: '1 Completed Lesson',
    isUnlocked: (u) => (u?.completedLessons?.length || 0) >= 1
  },
  {
    id: 'silicon-scout',
    title: 'Silicon Scout',
    description: 'Explore and master the pinout specifications of 3 electronic components.',
    icon: Cpu,
    requirement: '3 Learned Components',
    isUnlocked: (u) => (u?.learnedComponents?.length || 0) >= 3
  },
  {
    id: 'firmware-ninja',
    title: 'Firmware Ninja',
    description: 'Pass verification on a robotics coding challenge.',
    icon: Code,
    requirement: '1 Challenge Solved',
    isUnlocked: (u) => (u?.completedChallenges?.length || 0) >= 1
  },
  {
    id: '3d-virtual-pilot',
    title: 'Virtual Robot Pilot',
    description: 'Run an autonomous rover simulation in the 3D lab.',
    icon: Box,
    requirement: 'Run 3D Simulation',
    isUnlocked: (u) => (u?.xp || 0) >= 100
  },
  {
    id: 'maker-streak-3',
    title: 'Consistent Tinkerer',
    description: 'Maintain an active learning streak for at least 3 consecutive days.',
    icon: Flame,
    requirement: '3 Day Streak',
    isUnlocked: (u) => (u?.streak || 0) >= 3
  },
  {
    id: 'master-roboticist',
    title: 'Robotics Pioneer',
    description: 'Reach Level 3 and achieve over 400 XP.',
    icon: Trophy,
    requirement: '400 XP Earned',
    isUnlocked: (u) => (u?.xp || 0) >= 400
  }
];

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();

  const unlockedCount = BADGES.filter(b => b.isUnlocked(user)).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" /> Badges & Milestones
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Maker Achievements
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Earn verified robotics badges by passing challenges, mastering hardware datasheets, and writing embedded code.
        </p>
      </div>

      {/* Progress banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Collection Progress</span>
          <h3 className="text-2xl font-black text-white mt-0.5">
            {unlockedCount} of {BADGES.length} Badges Unlocked
          </h3>
        </div>
        <div className="text-right font-mono text-cyan-400 text-2xl font-bold">
          {Math.round((unlockedCount / BADGES.length) * 100)}%
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {BADGES.map((badge) => {
          const unlocked = badge.isUnlocked(user);
          const Icon = badge.icon;

          return (
            <div
              key={badge.id}
              className={`p-6 rounded-2xl border transition relative flex flex-col justify-between ${
                unlocked
                  ? 'bg-slate-900 border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    unlocked ? 'bg-amber-950 text-amber-400 border border-amber-600/50' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {unlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white mb-1">{badge.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{badge.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                Requirement: <span className="text-slate-300">{badge.requirement}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
