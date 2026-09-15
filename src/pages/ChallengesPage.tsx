import React, { useEffect, useState } from 'react';
import {
  Code,
  CheckCircle2,
  Trophy,
  Play,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { MonacoEditorPanel } from '../components/editor/MonacoEditorPanel';
import { CodingChallenge } from '../types/index';
import { MEDIA } from '../assets/media';

export const ChallengesPage: React.FC = () => {
  const { user, addXp } = useAuth();
  const { runActions } = useSimulation();
  const [challenges, setChallenges] = useState<CodingChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge | null>(null);
  const [activeCode, setActiveCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; logs: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getChallenges();
        setChallenges(list);
        if (list.length > 0) {
          setSelectedChallenge(list[0]);
          setActiveCode(list[0].starterCode);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectChallenge = (c: CodingChallenge) => {
    setSelectedChallenge(c);
    setActiveCode(c.starterCode);
    setSubmitResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await api.submitChallenge(selectedChallenge.id, activeCode);
      setSubmitResult({
        success: res.success,
        message: res.message,
        logs: res.logs || []
      });

      if (res.success) {
        if (res.actions && res.actions.length > 0) {
          runActions(res.actions, res.logs);
        }
        if (res.xpEarned > 0) {
          addXp(res.xpEarned, 'Challenge Solved');
        }
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.message || 'Submission failed.',
        logs: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = (id: string) => {
    return Boolean(user?.completedChallenges?.includes(id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Code className="w-4 h-4" /> Firmware Puzzles & Verification
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Robotics Coding Challenges
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Write microcontroller code to solve hardware puzzles. Pass simulation verification tests and earn XP.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Challenges List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Available Challenges ({challenges.length})
            </h3>
            {challenges.map((c) => {
              const done = isCompleted(c.id);
              const isSelected = selectedChallenge?.id === c.id;
              const cImg = c.imageUrl || MEDIA.challenges[c.id] || MEDIA.arduinoUno;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectChallenge(c)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center gap-3 overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={cImg}
                      alt={c.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        c.difficulty === 'Beginner' ? 'bg-emerald-950 text-emerald-400' :
                        c.difficulty === 'Intermediate' ? 'bg-amber-950 text-amber-400' : 'bg-rose-950 text-rose-400'
                      }`}>
                        {c.difficulty}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-400">+{c.xpReward} XP</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between truncate">
                      <span className="truncate">{c.title}</span>
                      {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{c.problem || c.problemDescription}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Active Challenge & Monaco Editor */}
          {selectedChallenge && (
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                {/* Visual Challenge Header with Hardware Photography */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 shrink-0 shadow">
                      <img
                        src={selectedChallenge.imageUrl || MEDIA.challenges[selectedChallenge.id] || MEDIA.arduinoUno}
                        alt={selectedChallenge.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-cyan-400 font-mono">
                          Board: {selectedChallenge.targetBoard || 'Arduino Uno R3'}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-amber-400 font-mono">+{selectedChallenge.xpReward} XP</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {isSubmitting ? 'Evaluating Simulation...' : 'Submit & Test Hardware'}
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                  {selectedChallenge.problem || selectedChallenge.problemDescription}
                </p>

                {/* Test Cases Checklist */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                    Acceptance Verification Test Cases:
                  </span>
                  <div className="space-y-1">
                    {selectedChallenge.testCases.map((tc: any, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><strong>{tc.description || tc.name || `Case ${idx+1}`}:</strong> Expects {tc.expectedAction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submission Result Notification */}
              {submitResult && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    submitResult.success
                      ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-700/60 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {submitResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{submitResult.success ? 'Challenge Passed!' : 'Verification Failed'}</span>
                  </div>
                  <p>{submitResult.message}</p>
                </div>
              )}

              {/* Code Editor */}
              <MonacoEditorPanel
                key={selectedChallenge.id}
                initialCode={activeCode}
                onCodeChange={(c) => setActiveCode(c)}
                language="cpp"
                targetBoard={selectedChallenge.targetBoard}
                challengeTitle={selectedChallenge.title}
                challengeProblem={selectedChallenge.problemDescription}
                height="420px"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
