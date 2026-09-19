import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bug, Check, ChevronDown, Clipboard, Code2, Download, ExternalLink, FileCode2, Lightbulb, Loader2, Play, RotateCcw, Send, Settings2, Sparkles, WandSparkles, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { useSimulation } from '../contexts/SimulationContext';
import { AICodeGenerationResult, AIDebugResult } from '../types/index';

const SAMPLE_PROMPTS = [
  'Build a responsive React todo app with local persistence',
  'Write a C++ program that sorts an array and explains the algorithm',
  'Create an Arduino obstacle-avoiding robot using an HC-SR04 and servo',
  'Make a Python script that reads a CSV and calculates summary statistics',
  'Build an ESP32 web server that controls an LED',
];

const LANGUAGES = [
  ['cpp', 'C++'], ['python', 'Python'], ['javascript', 'JavaScript'], ['typescript', 'TypeScript'],
  ['java', 'Java'], ['go', 'Go'], ['rust', 'Rust'], ['arduino', 'Arduino C++'],
];

const BOARDS = ['No hardware', 'Arduino Uno', 'ESP32 NodeMCU', 'Raspberry Pi Pico'];
type ToolState = 'idle' | 'loading' | 'success' | 'error';

export const AICodeGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { runActions, appendLog } = useSimulation();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [targetBoard, setTargetBoard] = useState('No hardware');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AICodeGenerationResult | null>(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Ready');
  const [activePanel, setActivePanel] = useState<'overview' | 'explain' | 'debug'>('overview');
  const [explanation, setExplanation] = useState<{ summary: string; lineByLine: { line: number; explanation: string }[]; concepts: string[] } | null>(null);
  const [debugResult, setDebugResult] = useState<AIDebugResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [runState, setRunState] = useState<ToolState>('idle');

  const editorLanguage = language === 'arduino' ? 'cpp' : language;
  const wiringCount = useMemo(() => result?.wiring?.length || 0, [result]);

  const generate = async (text?: string) => {
    const query = (text ?? prompt).trim();
    if (!query || isLoading) return;
    setPrompt(query);
    setIsLoading(true); setError(null); setStatus('Generating…'); setExplanation(null); setDebugResult(null);
    try {
      const res = await api.aiGenerateCode(query, targetBoard, language);
      setResult(res); setCode(res.code || ''); setStatus('Generated');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not generate code.';
      setError(message); setStatus('Error');
    } finally { setIsLoading(false); }
  };

  const explain = async () => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true); setError(null); setStatus('Explaining…');
    try { setExplanation(await api.aiExplainCode(code, language)); setActivePanel('explain'); setStatus('Explanation ready'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not explain the code.'); setStatus('Error'); }
    finally { setIsLoading(false); }
  };

  const debug = async () => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true); setError(null); setStatus('Checking code + asking AI…');
    try {
      // First run the same virtual-hardware interpreter used by the 3D Lab.
      // This gives the AI real simulator/compiler feedback instead of a generic review.
      let simulatorError: string | undefined;
      if (language === 'cpp' || language === 'c' || language === 'arduino') {
        try {
          const simulation = await api.interpretCode(code, editorLanguage);
          if (!simulation.success || !simulation.actions?.length) {
            simulatorError = simulation.message || 'The virtual hardware interpreter produced no executable actions.';
          }
        } catch (simulationFailure) {
          simulatorError = simulationFailure instanceof Error ? simulationFailure.message : 'Virtual simulator check failed.';
        }
      }
      setDebugResult(await api.aiDebugCode(code, language, simulatorError, targetBoard));
      setActivePanel('debug');
      setStatus(simulatorError ? 'AI debug + simulator issue found' : 'Debug analysis ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not debug the code.');
      setStatus('Error');
    } finally { setIsLoading(false); }
  };

  const improve = async () => {
    if (!code.trim() || isLoading) return;
    await generate(`Improve this ${language} program for ${targetBoard}. Preserve its intended behavior, fix clear bugs, improve readability and reliability, then return a complete replacement.\n\nCURRENT CODE:\n${code}`);
  };

  const runSimulation = async () => {
    if (!code.trim() || runState === 'loading') return;
    setRunState('loading');
    try {
      const res = await api.interpretCode(code, editorLanguage);
      if (res.success && res.actions?.length) {
        appendLog(`[AI-STUDIO] ${res.message}`, 'info');
        res.logs?.forEach(log => appendLog(`[SIM] ${log}`, 'info'));
        runActions(res.actions, [`[RUN] ${res.actions.length} simulation action(s) loaded.`]);
        setRunState('success');
      } else { setRunState('error'); setError(res.message || 'This code is not supported by the current simulator.'); }
    } catch (e) { setRunState('error'); setError(e instanceof Error ? e.message : 'Simulation failed.'); }
  };

  const copy = async () => {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setError('Clipboard access was blocked by the browser.'); }
  };

  const download = () => {
    if (!code) return;
    const ext = editorLanguage === 'python' ? 'py' : editorLanguage === 'typescript' ? 'ts' : editorLanguage === 'javascript' ? 'js' : editorLanguage === 'java' ? 'java' : editorLanguage === 'go' ? 'go' : editorLanguage === 'rust' ? 'rs' : editorLanguage === 'cpp' ? 'cpp' : 'ino';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `robolearn-generated.${ext}`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1500px] px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-5 sm:py-5">
      <header className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#0b1018] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500"><Code2 className="h-5 w-5" /></div><div><div className="flex items-center gap-2"><h1 className="text-base font-bold sm:text-lg">RoboLearn AI Code Studio</h1><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500">REAL AI</span></div><p className="text-[11px] text-slate-400">Describe any software or embedded task → get code, explanations and optional simulation.</p></div></div>
        <div className="flex items-center gap-2"><span className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${status === 'Error' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>{isLoading && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}{status}</span><button onClick={() => setShowSettings(v => !v)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" title="Settings"><Settings2 className="h-4 w-4" /></button></div>
      </header>

      {showSettings && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"><label className="text-xs font-semibold text-slate-500">Language <select value={language} onChange={e => setLanguage(e.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">{LANGUAGES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label className="text-xs font-semibold text-slate-500">Hardware <select value={targetBoard} onChange={e => setTargetBoard(e.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">{BOARDS.map(board => <option key={board}>{board}</option>)}</select></label><button onClick={() => setShowSettings(false)} className="ml-auto rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button></div>}

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-[#0b1018] sm:p-4">
        <div className="flex items-start gap-3"><div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-500"><Sparkles className="h-4 w-4" /></div><div className="min-w-0 flex-1"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate(); }} rows={3} maxLength={12000} placeholder="Describe what you want to build… e.g. Create a React dashboard with search, dark mode and local storage" className="w-full resize-none bg-transparent p-1 text-sm leading-6 outline-none placeholder:text-slate-400" /><div className="flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 gap-2 overflow-x-auto">{SAMPLE_PROMPTS.map(sample => <button key={sample} onClick={() => generate(sample)} className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-[11px] text-slate-600 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">{sample}</button>)}</div><button onClick={() => generate()} disabled={isLoading || !prompt.trim()} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-40"><Send className="h-3.5 w-3.5" /> Generate</button></div></div></div>
      </section>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-500"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      {!result && !isLoading && <section className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/30"><div className="max-w-md"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-500"><FileCode2 className="h-7 w-7" /></div><h2 className="mt-4 text-lg font-bold">Your code workspace</h2><p className="mt-2 text-xs leading-6 text-slate-500">Ask for an app, algorithm, script, API, website, embedded program or robotics firmware. The AI returns editable code and keeps hardware metadata separate when it applies.</p></div></section>}

      {(result || isLoading) && <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-[#0d1117] shadow-xl dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 px-3 py-2.5"><span className="rounded-md bg-cyan-500/10 px-2 py-1 font-mono text-[10px] font-bold text-cyan-400">{language}</span><span className="text-[10px] text-slate-500">{targetBoard}</span><div className="ml-auto flex flex-wrap gap-1.5"><button onClick={runSimulation} disabled={runState === 'loading' || !code} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-bold text-slate-950 disabled:opacity-40"><Play className="h-3 w-3" />{runState === 'loading' ? 'Running' : 'Run'}</button><button onClick={explain} disabled={isLoading || !code} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-slate-800 disabled:opacity-40"><Lightbulb className="h-3 w-3" />Explain</button><button onClick={debug} disabled={isLoading || !code} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-slate-800 disabled:opacity-40"><Bug className="h-3 w-3" />Debug</button><button onClick={improve} disabled={isLoading || !code} className="inline-flex items-center gap-1 rounded-lg border border-indigo-700/60 bg-indigo-950/40 px-2.5 py-1.5 text-[10px] text-indigo-200 disabled:opacity-40"><WandSparkles className="h-3 w-3" />Improve</button></div></div>
          <div className="h-[560px]"><Editor height="100%" language={editorLanguage} theme="vs-dark" value={code} onChange={value => setCode(value || '')} options={{ minimap: { enabled: true }, fontSize: 13, automaticLayout: true, padding: { top: 14 }, scrollBeyondLastLine: false, wordWrap: 'on', smoothScrolling: true }} loading={<div className="grid h-full place-items-center text-xs text-slate-500">Loading editor…</div>} /></div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 px-3 py-2.5"><button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-slate-700">{copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Clipboard className="h-3 w-3" />}{copied ? 'Copied' : 'Copy'}</button><button onClick={download} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-slate-700"><Download className="h-3 w-3" />Download</button>{result && <button onClick={() => setCode(result.code)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] text-slate-300 hover:bg-slate-700"><RotateCcw className="h-3 w-3" />Restore</button>}{result?.simulationSupported && <button onClick={() => navigate('/lab3d')} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20"><ExternalLink className="h-3 w-3" />3D Lab</button>}</div>
        </div>

        <aside className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0b1018]">
          <div className="flex border-b border-slate-200 dark:border-slate-800"><button onClick={() => setActivePanel('overview')} className={`flex-1 px-3 py-3 text-[11px] font-semibold ${activePanel === 'overview' ? 'border-b-2 border-cyan-500 text-cyan-500' : 'text-slate-500'}`}>Overview</button><button onClick={() => setActivePanel('explain')} className={`flex-1 px-3 py-3 text-[11px] font-semibold ${activePanel === 'explain' ? 'border-b-2 border-cyan-500 text-cyan-500' : 'text-slate-500'}`}>Explain</button><button onClick={() => setActivePanel('debug')} className={`flex-1 px-3 py-3 text-[11px] font-semibold ${activePanel === 'debug' ? 'border-b-2 border-cyan-500 text-cyan-500' : 'text-slate-500'}`}>Debug</button></div>
          <div className="max-h-[635px] overflow-y-auto p-4">
            {activePanel === 'overview' && result && <div className="space-y-5"><div><div className="mb-2 text-xs font-bold">What the AI built</div><p className="text-xs leading-6 text-slate-500 dark:text-slate-400">{result.explanation}</p></div><div><div className="mb-2 flex items-center justify-between text-xs font-bold"><span>Required</span><span className="text-[10px] font-normal text-slate-400">{result.requiredComponents?.length || 0}</span></div><div className="flex flex-wrap gap-1.5">{(result.requiredComponents || []).map(item => <span key={item} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-900 dark:text-slate-300">{item}</span>)}</div></div><div><div className="mb-2 flex items-center justify-between text-xs font-bold"><span>Wiring / connections</span><span className="text-[10px] font-normal text-slate-400">{wiringCount}</span></div>{result.wiring?.length ? <div className="space-y-2">{result.wiring.map((wire, i) => <div key={i} className="rounded-lg border border-slate-200 p-2.5 text-[10px] dark:border-slate-800"><div className="font-semibold">{wire.from} → {wire.to}</div><div className="mt-1 text-slate-500">{wire.description}</div></div>)}</div> : <p className="text-[10px] text-slate-500">No hardware wiring required.</p>}</div><div><div className="mb-2 text-xs font-bold">Functions & APIs</div><div className="flex flex-wrap gap-1.5">{(result.functionsUsed || []).map(item => <code key={item} className="rounded bg-slate-100 px-2 py-1 text-[10px] dark:bg-slate-900">{item}</code>)}</div></div><div><div className="mb-2 text-xs font-bold">Possible issues</div><div className="space-y-1.5">{(result.possibleErrors || []).map(item => <div key={item} className="text-[10px] text-slate-500">• {item}</div>)}</div></div></div>}
            {activePanel === 'overview' && !result && <div className="text-center text-xs text-slate-500">Generating workspace…</div>}
            {activePanel === 'explain' && <div className="space-y-4">{explanation ? <><div><h3 className="text-sm font-bold">Summary</h3><p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{explanation.summary}</p></div><div><h3 className="text-sm font-bold">Concepts</h3><div className="mt-2 flex flex-wrap gap-1.5">{explanation.concepts.map(c => <span key={c} className="rounded-lg bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-600 dark:text-cyan-300">{c}</span>)}</div></div><div><h3 className="text-sm font-bold">Line-by-line</h3><div className="mt-2 space-y-2">{explanation.lineByLine.slice(0, 80).map(item => <div key={item.line} className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800"><div className="font-mono text-[10px] text-cyan-500">Line {item.line}</div><p className="mt-1 text-[10px] leading-5 text-slate-500">{item.explanation}</p></div>)}</div></div></> : <div className="text-xs text-slate-500">Press Explain to ask the AI about the current editor contents.</div>}</div>}
            {activePanel === 'debug' && <div>{debugResult ? <div className="space-y-4"><div><h3 className="text-sm font-bold">Problem</h3><p className="mt-1 text-xs leading-6 text-slate-500">{debugResult.problem}</p></div><div><h3 className="text-sm font-bold">Likely cause</h3><p className="mt-1 text-xs leading-6 text-slate-500">{debugResult.cause}</p></div><div><h3 className="text-sm font-bold">Fix</h3><p className="mt-1 text-xs leading-6 text-slate-500">{debugResult.solution}</p></div><div><h3 className="text-sm font-bold">AI explanation</h3><p className="mt-1 text-xs leading-6 text-slate-500">{debugResult.explanation}</p></div>{debugResult.correctedCode && <button onClick={() => setCode(debugResult.correctedCode)} className="w-full rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400">Use corrected code</button>}</div> : <div className="text-xs text-slate-500">Press Debug to inspect the current code for syntax, logic and context-specific issues.</div>}</div>}
          </div>
        </aside>
      </section>}
    </main>
  );
};
