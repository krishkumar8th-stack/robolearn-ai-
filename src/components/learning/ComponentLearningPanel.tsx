import React, { useState } from 'react';
import { BookOpen, Brain, CheckCircle2, Lightbulb, ListChecks, Target, Rocket } from 'lucide-react';
import type { ComponentLearningGuide } from '../../types/index';

interface Props {
  componentName: string;
  guide?: ComponentLearningGuide;
}

export const ComponentLearningPanel: React.FC<Props> = ({ componentName, guide }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!guide) return null;

  const score = guide.quickQuiz.reduce((total, question, index) => total + (answers[index] === question.correctIndex ? 1 : 0), 0);

  return (
    <section className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-800/40 shadow-xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4" /> Learn This Component
          </div>
          <h2 className="text-2xl font-black text-white">{componentName}, made easy</h2>
          <p className="text-sm text-slate-400 mt-1">Learn the idea first, then use it in a real robotics or drone project.</p>
        </div>
        <Brain className="w-9 h-9 text-indigo-400 shrink-0" />
      </div>

      <div className="space-y-5">
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
          <h3 className="font-bold text-white flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-cyan-400" /> What is it?</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{guide.simpleExplanation}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><ListChecks className="w-4 h-4 text-indigo-400" /> How does it work?</h3>
            <div className="space-y-3">
              {guide.howItWorksStepByStep.map((step, index) => (
                <div key={step} className="flex gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-indigo-500/15 text-indigo-300 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-emerald-400" /> Input & Output</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{guide.inputsOutputs}</p>
            <h4 className="font-bold text-white mt-5 mb-2">Where is it used?</h4>
            <div className="flex flex-wrap gap-2">
              {guide.whereUsed.map(item => <span key={item} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">{item}</span>)}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
          <h3 className="font-bold text-white mb-3">🧠 Key concepts</h3>
          <div className="flex flex-wrap gap-2">
            {guide.keyConcepts.map(item => <span key={item} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-semibold">{item}</span>)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-2"><Rocket className="w-4 h-4" /> Mini project</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{guide.miniProject}</p>
          </div>
          <div className="p-5 rounded-xl bg-violet-950/30 border border-violet-800/40">
            <h3 className="font-bold text-violet-300 mb-2">📌 Remember</h3>
            <div className="space-y-2">{guide.remember.map(item => <p key={item} className="text-sm text-slate-300">• {item}</p>)}</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-bold text-white flex items-center gap-2"><Brain className="w-4 h-4 text-violet-400" /> Quick quiz</h3><p className="text-xs text-slate-500 mt-1">Test what you just learned.</p></div>
            <span className="text-xs font-bold text-violet-300">Score: {score}/{guide.quickQuiz.length}</span>
          </div>
          <div className="space-y-5">
            {guide.quickQuiz.map((question, qIndex) => (
              <div key={question.question}>
                <p className="text-sm font-semibold text-white mb-3">{qIndex + 1}. {question.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option, optionIndex) => (
                    <button key={option} type="button" onClick={() => setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }))} className={`p-3 rounded-lg border text-left text-xs transition ${answers[qIndex] === optionIndex ? 'border-cyan-500 bg-cyan-500/10 text-cyan-200' : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'}`}>
                      <span className="font-bold mr-2">{String.fromCharCode(65 + optionIndex)}.</span>{option}
                    </button>
                  ))}
                </div>
                {answers[qIndex] !== undefined && <div className={`mt-2 flex gap-2 text-xs ${answers[qIndex] === question.correctIndex ? 'text-emerald-300' : 'text-amber-300'}`}><CheckCircle2 className="w-4 h-4 shrink-0" />{answers[qIndex] === question.correctIndex ? 'Correct! ' : 'Not quite. '}{question.explanation}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
