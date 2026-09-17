import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Lock, ArrowRight, Clock, Trophy, Zap, Target, BrainCircuit, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { THREE_LEVEL_ROBOTICS, ROBOTICS_LEVEL_RULES, ROBOTICS_XP } from '../data/threeLevelRobotics';

const levelNames = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
const levelMeta = {
  BEGINNER: { icon: Cpu, description: 'Electronics, Arduino, C/C++, sensors and basic robot motion.', threshold: 0, pass: 70 },
  INTERMEDIATE: { icon: Target, description: 'Sensor fusion, motors, communication, PID and embedded control.', threshold: 3000, pass: 70 },
  ADVANCED: { icon: BrainCircuit, description: 'Computer vision, AI, navigation, ROS concepts and autonomous robotics.', threshold: 8000, pass: 75 }
} as const;

export const RoboticsPage: React.FC = () => {
  const { user } = useAuth();
  const xp = user?.xp ?? 0;
  const completedLessons = useMemo(() => new Set(user?.completedLessons ?? []), [user?.completedLessons]);

  const getLevelState = (level: number) => {
    if (level === 1) return 'unlocked';
    if (level === 2) return xp >= ROBOTICS_LEVEL_RULES.INTERMEDIATE.xp ? 'unlocked' : 'locked';
    return xp >= ROBOTICS_LEVEL_RULES.ADVANCED.xp ? 'unlocked' : 'locked';
  };

  const totalModules = THREE_LEVEL_ROBOTICS.reduce((sum, c) => sum + c.lessons.length, 0);
  const totalCompleted = THREE_LEVEL_ROBOTICS.reduce((sum, c) => sum + c.lessons.filter(l => completedLessons.has(l.id)).length, 0);
  const overallPct = Math.round((totalCompleted / totalModules) * 100);
  const nextThreshold = xp < 3000 ? 3000 : xp < 8000 ? 8000 : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2"><Cpu className="w-4 h-4" /> Robotics Mastery Path</div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div><h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Learn Robotics & Build Real Robots</h1><p className="text-slate-400 text-sm mt-2 max-w-2xl">A structured three-level path from first circuit to autonomous AI robotics.</p></div>
          <div className="rounded-2xl bg-slate-900 border border-slate-800 px-5 py-4 min-w-[250px]"><div className="flex justify-between text-xs text-slate-400"><span>Overall progress</span><span className="text-cyan-400 font-bold">{overallPct}%</span></div><div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${overallPct}%` }} /></div><div className="flex justify-between mt-2 text-[11px] text-slate-500"><span>{totalCompleted}/{totalModules} modules</span><span>{xp.toLocaleString()} XP</span></div></div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-8 max-w-3xl">
        {levelNames.map((name, index) => { const unlocked = getLevelState(index + 1) === 'unlocked'; const Icon = levelMeta[name].icon; return <div key={name} className={`rounded-xl border p-3 ${unlocked ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-slate-800 bg-slate-900/50'}`}><div className="flex items-center gap-2"><Icon className={`w-4 h-4 ${unlocked ? 'text-cyan-400' : 'text-slate-600'}`} /><span className="text-[10px] sm:text-xs font-black">{name}</span>{!unlocked && <Lock className="w-3 h-3 ml-auto text-slate-600" />}</div><div className="text-[10px] text-slate-500 mt-1">{index === 0 ? 'Start here' : `${levelMeta[name].threshold.toLocaleString()} XP`}</div></div>; })}
      </div>

      {nextThreshold && <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400 shrink-0" /><div><p className="text-sm font-bold text-amber-200">Next level unlock: {(nextThreshold - xp).toLocaleString()} XP remaining</p><p className="text-xs text-slate-400 mt-1">Complete modules, quizzes and practical challenges to earn XP.</p></div></div>}

      <div className="space-y-6">
        {THREE_LEVEL_ROBOTICS.map((course, index) => {
          const name = levelNames[index];
          const meta = levelMeta[name];
          const unlocked = getLevelState(course.level) === 'unlocked';
          const completed = course.lessons.filter(l => completedLessons.has(l.id)).length;
          const pct = Math.round((completed / course.lessons.length) * 100);
          const finalPass = meta.pass;
          return <section key={course.id} className={`rounded-2xl border overflow-hidden ${unlocked ? 'bg-slate-900 border-slate-800' : 'bg-slate-950 border-slate-900 opacity-80'}`}>
            <div className="p-5 sm:p-6 border-b border-slate-800/80"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><div className="flex items-center gap-2 mb-2"><span className={`text-xs font-black tracking-widest ${index === 0 ? 'text-emerald-400' : index === 1 ? 'text-amber-400' : 'text-rose-400'}`}>LEVEL {index + 1} · {name}</span>{!unlocked && <span className="text-[10px] rounded-full bg-slate-800 px-2 py-1 text-slate-500">LOCKED</span>}</div><h2 className="text-xl sm:text-2xl font-black text-white">{course.tagline}</h2><p className="text-sm text-slate-400 mt-1 max-w-2xl">{meta.description}</p></div><div className="md:min-w-[230px]"><div className="flex justify-between text-xs mb-2"><span className="text-slate-500">{completed}/{course.lessons.length} modules</span><span className="font-bold text-cyan-400">{pct}%</span></div><div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} /></div></div></div></div>

            <div className="p-4 sm:p-6 space-y-2">
              {course.lessons.map((module, moduleIndex) => { const done = completedLessons.has(module.id); const canOpen = unlocked && (moduleIndex === 0 || completedLessons.has(course.lessons[moduleIndex - 1].id)); return <Link key={module.id} to={canOpen ? `/learn/${course.id}/${module.id}` : '#'} onClick={e => { if (!canOpen) e.preventDefault(); }} className={`group flex items-center justify-between gap-4 p-4 rounded-xl border transition ${canOpen ? 'bg-slate-950/60 border-slate-800 hover:border-cyan-500/40' : 'bg-slate-950/30 border-slate-900 cursor-not-allowed'}`}><div className="flex items-center gap-3 min-w-0"><div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-emerald-950 text-emerald-400' : canOpen ? 'bg-slate-800 text-cyan-400' : 'bg-slate-900 text-slate-600'}`}>{done ? <CheckCircle2 className="w-4 h-4" /> : canOpen ? <BookOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</div><div className="min-w-0"><div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Module {moduleIndex + 1}</div><h3 className={`text-sm font-bold truncate ${canOpen ? 'text-slate-200 group-hover:text-cyan-400' : 'text-slate-600'}`}>{module.title}</h3><p className="text-[11px] text-slate-500 truncate mt-0.5">{module.learningObjective}</p></div></div><div className="flex items-center gap-3 shrink-0"><span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-500"><Clock className="w-3 h-3" /> {module.durationMinutes}m</span><span className="text-[10px] font-mono text-amber-400">+{ROBOTICS_XP.lesson} XP</span><ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" /></div></Link>; })}
            </div>

            <div className="mx-4 sm:mx-6 mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div className="flex items-start gap-3"><Trophy className="w-5 h-5 text-amber-400 mt-0.5" /><div className="flex-1"><h3 className="text-sm font-bold text-white">{name} Final Assessment</h3><p className="text-xs text-slate-500 mt-1">{index === 0 ? '30 questions · conceptual + code + practical' : index === 1 ? '35 questions · application + debugging + simulation' : '25 questions · problem solving + system design + capstone'}</p><div className="flex flex-wrap gap-2 mt-3"><span className="text-[10px] px-2 py-1 rounded bg-slate-900 text-slate-400">Pass ≥ {finalPass}%</span><span className="text-[10px] px-2 py-1 rounded bg-slate-900 text-slate-400">Retry allowed</span><span className="text-[10px] px-2 py-1 rounded bg-slate-900 text-amber-400">+{ROBOTICS_XP.finalTest} XP</span></div></div></div></div>
          </section>;
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="font-bold text-white">XP & Achievement System</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">{[['Lesson complete', ROBOTICS_XP.lesson], ['Module complete', ROBOTICS_XP.module], ['Quiz pass', ROBOTICS_XP.quiz], ['Challenge', ROBOTICS_XP.challenge]].map(([label, value]) => <div key={label as string} className="rounded-xl bg-slate-950 border border-slate-800 p-3"><div className="text-lg font-black text-amber-400">+{value}</div><div className="text-[10px] text-slate-500 mt-1">{label as string}</div></div>)}</div><p className="text-[11px] text-slate-500 mt-4">Badges unlock through milestones such as First Circuit, Arduino Rookie, Sensor Explorer, Motion Engineer, Vision Engineer, Robot AI Developer and Robotics Master.</p></div>
    </div>
  );
};
