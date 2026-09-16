import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Cpu, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Code, Copy,
  Check, Box, Sparkles, BookOpen, ListChecks, Lightbulb, Wrench, Brain
} from 'lucide-react';
import { catalogEntryToComponent } from '../data/componentCatalog';
import { PDF_COMPONENT_CATALOG } from '../data/pdfComponentCatalog';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { ElectronicComponent } from '../types/index';
import { WebComponentImage } from '../components/WebComponentImage';

export const ComponentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, addXp } = useAuth();
  const { setSelected3DComponent } = useSimulation();
  const navigate = useNavigate();
  const [component, setComponent] = useState<ElectronicComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const entry = PDF_COMPONENT_CATALOG.find((item) => item.id === id);
    setComponent(entry ? catalogEntryToComponent(entry) : null);
    setIsLoading(false);
  }, [id]);

  const handleAskAi = async () => {
    if (!component || !aiQuestion.trim() || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const payload = await fetch('/api/ai/explain-component', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentId: component.id, question: aiQuestion.trim() })
      });
      if (!payload.ok) throw new Error('AI request failed');
      const result = await payload.json();
      setAiAnswer(result.explanation || 'No explanation returned.');
    } catch {
      setAiAnswer('Could not contact the AI hardware assistant. Try a more specific question.');
    } finally { setIsAiLoading(false); }
  };

  const handleMarkLearned = () => addXp(30, 'Component Learned');
  const handleOpenIn3DLab = () => { if (component) { setSelected3DComponent(component.id); navigate('/lab3d'); } };
  const isLearned = Boolean(user?.learnedComponents?.includes(id || ''));

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh] bg-slate-950 text-white"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!component) return <div className="p-8 text-center text-slate-400 min-h-[60vh] flex flex-col items-center justify-center bg-slate-950"><p>Component not found.</p><Link to="/components" className="mt-4 text-cyan-400 hover:underline">Back to Component Library</Link></div>;

  const guide = component.learningGuide;
  const code = component.codeExamples?.[0]?.code || '';
  const pdfNumber = id?.replace('pdf-', '').replace(/^0+/, '') || '';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link to="/components" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"><ArrowLeft className="w-4 h-4" /> Back to Components</Link>
        <div className="flex items-center gap-2">
          <button onClick={handleMarkLearned} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5" />{isLearned ? 'Learned' : 'Mark Learned (+30 XP)'}</button>
          <button onClick={handleOpenIn3DLab} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"><Box className="w-3.5 h-3.5" />View in 3D Lab</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-7">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 mb-2"><span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400">PDF #{pdfNumber}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{component.category.replace('_', ' ')}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{component.difficulty}</span></div>
          <h1 className="text-3xl font-black text-white">{component.name}</h1>
          <p className="text-slate-400 text-sm mt-1">{component.tagline}</p>
          <p className="text-xs text-slate-300 leading-relaxed mt-3">{component.description}</p>
        </div>
        <div className="lg:col-span-5 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800"><WebComponentImage id={component.id} name={component.name} /><div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] text-cyan-300">Original/reference web photo</div></div>
        </div>
      </div>

      <section className="mb-7">
        <div className="flex items-center gap-2 mb-4"><BookOpen className="w-5 h-5 text-cyan-400" /><h2 className="text-xl font-black text-white">Learn This Component</h2><span className="text-xs text-slate-500">Beginner-friendly hardware lesson</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-900/40"><h3 className="font-bold text-cyan-300 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" />What is it?</h3><p className="text-sm text-slate-300 leading-relaxed">{guide?.simpleExplanation || component.whatIsIt}</p></div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-900/40"><h3 className="font-bold text-indigo-300 mb-2 flex items-center gap-2"><Brain className="w-4 h-4" />Inputs & Outputs</h3><p className="text-sm text-slate-300 leading-relaxed">{guide?.inputsOutputs || component.internalWorking}</p></div>
        </div>
      </section>

      {guide && <>
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-7"><h3 className="text-base font-bold text-white flex items-center gap-2 mb-4"><ListChecks className="w-4 h-4 text-cyan-400" />How It Works — Step by Step</h3><div className="space-y-3">{guide.howItWorksStepByStep.map((step, index) => <div key={index} className="flex gap-3 items-start"><span className="w-7 h-7 shrink-0 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-black flex items-center justify-center">{index + 1}</span><p className="text-sm text-slate-300 leading-relaxed pt-1">{step}</p></div>)}</div></section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800"><h3 className="font-bold text-white flex items-center gap-2 mb-3"><Wrench className="w-4 h-4 text-emerald-400" />Where Is It Used?</h3><div className="flex flex-wrap gap-2">{guide.whereUsed.map((item) => <span key={item} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">{item}</span>)}</div></section>
          <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800"><h3 className="font-bold text-white mb-3">Key Concepts</h3><div className="flex flex-wrap gap-2">{guide.keyConcepts.map((item) => <span key={item} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">{item}</span>)}</div></section>
        </div>

        <section className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 mb-7"><h3 className="font-bold text-white mb-2">Mini Project</h3><p className="text-sm text-slate-300 leading-relaxed">{guide.miniProject}</p></section>

        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-7"><h3 className="font-bold text-white mb-4">Quick Quiz</h3><div className="space-y-5">{guide.quickQuiz.map((quiz, qIndex) => <Quiz key={qIndex} quiz={quiz} index={qIndex} />)}</div></section>

        <section className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40 mb-7"><h3 className="font-bold text-amber-300 mb-3">Remember</h3><ul className="space-y-2 text-sm text-slate-300">{guide.remember.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-400">•</span><span>{item}</span></li>)}</ul></section>
      </>}

      <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 mb-7"><h3 className="font-bold text-white mb-4">Starter Code</h3><div className="flex justify-end mb-2"><button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700">{copied ? 'Copied' : 'Copy Code'} <Copy className="inline w-3.5 h-3.5 ml-1" /></button></div><pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">{code}</pre></section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40"><h3 className="font-bold text-amber-300 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" />Common Mistakes</h3><ul className="space-y-2 text-sm text-slate-300">{component.commonMistakes.map((m, i) => <li key={i}>• {m}</li>)}</ul></div>
        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40"><h3 className="font-bold text-emerald-300 flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4" />Safety & Best Practices</h3><ul className="space-y-2 text-sm text-slate-300">{component.safetyRules.map((s, i) => <li key={i}>• {s}</li>)}</ul></div>
      </section>

      <section className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-indigo-800/40 shadow-xl"><div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-indigo-400" /><h3 className="text-base font-bold text-white">Ask AI About {component.name}</h3></div><p className="text-xs text-slate-400 mb-4">Ask for a simpler explanation, wiring concept, use case, or troubleshooting idea.</p><div className="flex gap-2"><input value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="e.g. Explain this like I am a beginner" className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500" /><button onClick={handleAskAi} disabled={isAiLoading || !aiQuestion.trim()} className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs">{isAiLoading ? 'Thinking...' : 'Ask AI'}</button></div>{aiAnswer && <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{aiAnswer}</div>}</section>
    </div>
  );
};

const Quiz: React.FC<{ quiz: { question: string; options: string[]; correctIndex: number; explanation: string }; index: number }> = ({ quiz, index }) => {
  const [selected, setSelected] = useState<number | null>(null);
  return <div className="p-4 rounded-xl bg-slate-950 border border-slate-800"><p className="text-sm font-semibold text-white mb-3">{index + 1}. {quiz.question}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{quiz.options.map((option, optionIndex) => { const answered = selected !== null; const correct = optionIndex === quiz.correctIndex; const chosen = optionIndex === selected; return <button key={option} onClick={() => setSelected(optionIndex)} className={`text-left p-3 rounded-lg border text-xs transition ${answered && correct ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' : answered && chosen ? 'border-rose-500/60 bg-rose-500/10 text-rose-300' : 'border-slate-800 hover:border-cyan-500/50 text-slate-300'}`}>{option}</button>; })}</div>{selected !== null && <p className="mt-3 text-xs text-slate-400">{selected === quiz.correctIndex ? '✅ Correct! ' : '💡 Not quite. '} {quiz.explanation}</p>}</div>;
};
