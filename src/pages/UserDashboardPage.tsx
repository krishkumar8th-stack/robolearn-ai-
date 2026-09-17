import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code2, Cpu, Trophy, Bot, Box, Flame, Target, CheckCircle2, FolderKanban, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const xpInLevel = user.xp % 200;
  const progress = Math.min(100, Math.round((xpInLevel / 200) * 100));

  const stats = [
    { label: 'Lessons completed', value: user.completedLessons.length, icon: CheckCircle2 },
    { label: 'Challenges solved', value: user.completedChallenges.length, icon: Target },
    { label: 'Projects completed', value: user.completedProjects.length, icon: FolderKanban },
    { label: 'Components learned', value: user.learnedComponents.length, icon: Cpu },
    { label: 'Achievements', value: user.achievements.length, icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#090e1a] sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Your RoboLearn space</p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Welcome, {user.fullName} 👋
              </h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">@{user.username} · {user.email}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">{user.experienceLevel}</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">{user.preferredProgrammingLanguage.toUpperCase()}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">Level {user.level}</span>
              </div>
            </div>
            <button onClick={logout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#090e1a]">
              <Icon className="h-5 w-5 text-cyan-500" />
              <p className="mt-4 text-3xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#090e1a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal progress</p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Level {user.level}</h2>
              </div>
              <div className="text-right"><p className="text-2xl font-black text-cyan-500">{user.xp} XP</p><p className="text-xs text-slate-500">{xpInLevel}/200 this level</p></div>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Flame className="h-4 w-4 text-orange-500" /> {user.streak} day learning streak
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#090e1a]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Continue learning</p>
            <div className="mt-4 grid gap-2">
              <Link to="/learn" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 font-bold hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800"><BookOpen className="h-5 w-5 text-blue-500" /> Learn Robotics</Link>
              <Link to="/programming" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 font-bold hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800"><Code2 className="h-5 w-5 text-emerald-500" /> Programming</Link>
              <Link to="/components" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 font-bold hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800"><Cpu className="h-5 w-5 text-purple-500" /> Components</Link>
              <Link to="/ai-tutor" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 font-bold hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800"><Bot className="h-5 w-5 text-pink-500" /> AI Tutor</Link>
              <Link to="/lab3d" className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 font-bold hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800"><Box className="h-5 w-5 text-cyan-500" /> 3D Lab</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
