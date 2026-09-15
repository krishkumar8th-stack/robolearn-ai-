import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  CheckCircle2,
  Cpu,
  Box,
  Code,
  ArrowRight,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { RoboticsProject } from '../types/index';
import { MEDIA } from '../assets/media';

export const ProjectsPage: React.FC = () => {
  const { user, addXp } = useAuth();
  const { runActions } = useSimulation();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<RoboticsProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<RoboticsProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getProjects();
        setProjects(list);
        if (list.length > 0) setSelectedProject(list[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleCompleteProject = async () => {
    if (!selectedProject) return;
    try {
      const res = await api.completeProject(selectedProject.id);
      if (res.xpEarned > 0) {
        addXp(res.xpEarned, 'Project Completed');
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch {}
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestInLab = () => {
    if (!selectedProject) return;
    if (selectedProject.simulationActions) {
      runActions(selectedProject.simulationActions);
    }
    navigate('/lab3d');
  };

  const isCompleted = (id: string) => {
    return Boolean(user?.completedProjects?.includes(id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" /> Real Hardware Builds
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Hands-on Robotics Projects
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Build end-to-end autonomous rovers, smart sensor monitors, and embedded IoT systems with complete schematics and code.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Project Cards */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Robotics Projects ({projects.length})
            </h3>
            {projects.map((p) => {
              const done = isCompleted(p.id);
              const isSelected = selectedProject?.id === p.id;
              const pImg = p.imageUrl || MEDIA.projects[p.id] || MEDIA.roboticsRover;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex gap-3 items-center overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={pImg}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        p.difficulty === 'Beginner' ? 'bg-emerald-950 text-emerald-400' :
                        p.difficulty === 'Intermediate' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {p.difficulty}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">+{p.xpReward} XP</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between truncate">
                      <span className="truncate">{p.title}</span>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.tagline || p.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Project Deep Dive */}
          {selectedProject && (
            <div className="lg:col-span-8 flex flex-col gap-5">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                {/* Project Real Photography Showcase Header */}
                <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-6 group">
                  <img
                    src={selectedProject.imageUrl || MEDIA.projects[selectedProject.id] || MEDIA.roboticsRover}
                    alt={selectedProject.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Physical Project Build
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-slate-700/60">
                        {selectedProject.category || 'Robotics'}
                      </span>
                      <h2 className="text-2xl font-black text-white mt-1.5 drop-shadow">{selectedProject.title}</h2>
                    </div>

                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-amber-950/90 text-amber-300 border border-amber-700/60">
                      +{selectedProject.xpReward} XP
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{selectedProject.description || selectedProject.tagline}</p>
                    {selectedProject.circuitOverview && (
                      <p className="text-xs text-cyan-400/90 mt-2 font-mono">
                        Circuit: {selectedProject.circuitOverview}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTestInLab}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-xs transition border border-slate-700 flex items-center gap-1.5"
                    >
                      <Box className="w-3.5 h-3.5" />
                      Test in 3D Lab
                    </button>

                    <button
                      onClick={handleCompleteProject}
                      disabled={isCompleted(selectedProject.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                        isCompleted(selectedProject.id)
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isCompleted(selectedProject.id) ? 'Completed (+XP)' : `Complete Project (+${selectedProject.xpReward} XP)`}
                    </button>
                  </div>
                </div>

                {/* Required Components Pills */}
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Hardware Parts Needed:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.componentsNeeded || selectedProject.componentsRequired || []).map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assembly Steps */}
                <div className="space-y-4 mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Step-by-Step Build Instructions:
                  </span>
                  {selectedProject.steps.map((step) => (
                    <div key={step.stepNumber} className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-mono font-bold flex items-center justify-center text-[10px] border border-cyan-800/40">
                          {step.stepNumber}
                        </span>
                        <h4 className="font-bold text-white text-sm">{step.title}</h4>
                      </div>
                      <p className="text-slate-300 leading-relaxed ml-7">{step.instruction || step.description}</p>
                    </div>
                  ))}
                </div>

                {/* Firmware Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Firmware Source Code:
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedProject.code || selectedProject.completeCode || '')}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      Copy Code
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed max-h-72">
                    {selectedProject.code || selectedProject.completeCode}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
