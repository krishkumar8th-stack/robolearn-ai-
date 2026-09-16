import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Play, Copy, Check, Download, Box, Cpu, ArrowRight,
  AlertTriangle, Lightbulb, Bug, WandSparkles, RotateCcw, Send,
  CheckCircle2, Loader2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { useSimulation } from '../contexts/SimulationContext';
import { AICodeGenerationResult, AIDebugResult } from '../types/index';

const SAMPLE_PROMPTS = [
  'Make an Arduino robot detect an obstacle with ultrasonic sensor and turn left',
  'Blink an LED with 500ms intervals and print serial state',
  'Sweep an SG90 micro servo from 0 to 180 degrees smoothly',
  'Read analog temperature from TMP36 sensor and trigger buzzer above 30°C',
  'Control ESP32 onboard LED via Wi-Fi web server'
];

type ToolState = 'idle' | 'loading' | 'success' | 'error';

export const AICodeGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [targetBoard, setTargetBoard] = useState('Arduino Uno');
  const [language, setLanguage] = useState<'cpp' | 'python'>('cpp');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AICodeGenerationResult | null>(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toolState, setToolState] = useState<ToolState>('idle');
  const [toolMessage, setToolMessage] = useState('');
  const [debugResult, setDebugResult] = useState<AIDebugResult | null>(null);
  const [explanation, setExplanation] = useState<{ summary: string; lineByLine: { line: number; explanation: string }[]; concepts: string[] } | null>(null);
  const [activePanel, setActivePanel] = useState<'wiring' | 'explain' | 'debug'>('wiring');
  const [runState, setRunState] = useState<ToolState>('idle');

  const { runActions, appendLog } = useSimulation();
  const navigate = useNavigate();
  const editorLanguage = language === 'cpp' ? 'cpp' : 'python';

  const showTool = (state: ToolState, message: string) => {
    setToolState(state);
    setToolMessage(message);
  };

  const handleGenerate = async (queryText?: string) => {
    const textToRun = queryText || prompt;
    if (!textToRun.trim()) return;
    setIsLoading(true);
    setError(null);
    setDebugResult(null);
    setExplanation(null);
    try {
      const res = await api.aiGenerateCode(textToRun, targetBoard, language);
      setResult(res);
      setCode(res.code || '');
      showTool('success', 'Code and circuit plan generated successfully.');
    } catch (err: any) {
      const message = err?.message || 'Failed to generate firmware code. Please try again.';
      setError(message);
      showTool('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!code.trim()) return;
    showTool('loading', 'Gemini is explaining your code...');
    try {
      const res = await api.aiExplainCode(code, language);
      setExplanation(res);
      setActivePanel('explain');
      showTool('success', 'Code explanation ready.');
    } catch (err: any) {
      showTool('error', err?.message || 'Could not explain this code.');
    }
  };

  const handleDebug = async () => {
    if (!code.trim()) return;
    showTool('loading', 'Checking syntax, logic and hardware assumptions...');
    try {
      const res = await api.aiDebugCode(code, language, undefined, targetBoard);
      setDebugResult(res);
      setActivePanel('debug');
      showTool('success', 'AI debugging analysis ready.');
    } catch (err: any) {
      showTool('error', err?.message || 'Could not debug this code.');
    }
  };

  const handleImprove = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const improvementPrompt = `Improve the following ${language} firmware for ${targetBoard}. Preserve the requested behavior, fix obvious bugs, improve readability and reliability, and return a complete replacement program.\n\nCURRENT CODE:\n${code}`;
      const res = await api.aiGenerateCode(improvementPrompt, targetBoard, language);
      setResult(res);
      setCode(res.code || '');
      showTool('success', 'Improved firmware generated. Review the changes before using hardware.');
    } catch (err: any) {
      setError(err?.message || 'Could not improve the code.');
      showTool('error', err?.message || 'Could not improve the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunState('loading');
    try {
      const res = await api.interpretCode(code, language);
      if (res.success && res.actions?.length) {
        appendLog(`[AI-CODE] ${res.message}`, 'info');
        res.logs?.forEach(log => appendLog(`[SIM] ${log}`, 'info'));
        runActions(res.actions, [`[RUN] ${res.actions.length} simulation action(s) loaded.`]);
        setRunState('success');
      } else {
        setRunState('error');
        setToolMessage(res.message || 'This code is not currently supported by the simulator.');
      }
    } catch (err: any) {
      setRunState('error');
      setToolMessage(err?.message || 'Simulation request failed.');
    }
  };

  const handleSendToSimulator = () => {
    if (!result) return;
    appendLog(`[AI-GENERATOR] Loading generated firmware for ${targetBoard}.`, 'info');
    if (result.simulationActions?.length) {
      runActions(result.simulationActions, [
        `[GENERATED] Firmware for ${targetBoard} loaded into virtual MCU.`,
        `[CIRCUIT] ${result.wiring.length} pin connection(s) supplied by AI.`
      ]);
    }
    navigate('/lab3d');
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showTool('error', 'Clipboard access was blocked by the browser.');
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = language === 'python' ? 'generated_code.py' : 'generated_sketch.ino';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const wiringCount = useMemo(() => result?.wiring?.length || 0, [result]);

  return (
    <main className="min-h-screen w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-7 text-slate-100">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-800/50 bg-indigo-950/60 px-3 py-1 text-xs font-semibold text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" /> Real Gemini Embedded AI Engine
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight">Robotics & Firmware AI Code Generator</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">Prompt → firmware → circuit guidance → explain/debug → simulate. Edit the generated code before running it.</p>
      </header>

      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 shadow-xl">
        <label htmlFor="ai-code-prompt" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">What do you want to build?</label>
        <textarea
          id="ai-code-prompt"
          rows={3}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleGenerate(); }}
          placeholder="e.g. Make an Arduino robot detect an obstacle with ultrasonic sensor and turn left..."
          className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">Hardware
              <select value={targetBoard} onChange={e => setTargetBoard(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500">
                <option>Arduino Uno</option><option>ESP32 NodeMCU</option><option>Raspberry Pi Pico</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">Language
              <select value={language} onChange={e => setLanguage(e.target.value as 'cpp' | 'python')} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500">
                <option value="cpp">Arduino C++</option><option value="python">MicroPython</option>
              </select>
            </label>
          </div>
          <button onClick={() => handleGenerate()} disabled={isLoading || !prompt.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Synthesizing...</> : <><Sparkles className="h-4 w-4" /> Generate Code & Circuit</>}
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 py-1 text-[11px] font-semibold text-slate-500">Examples:</span>
          {SAMPLE_PROMPTS.map((sample, i) => <button key={i} onClick={() => { setPrompt(sample); handleGenerate(sample); }} className="shrink-0 rounded-lg border border-slate-700/70 bg-slate-800/80 px-3 py-1.5 text-left text-xs text-slate-300 transition hover:bg-slate-800">{sample}</button>)}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Tip: Ctrl/Cmd + Enter generates. Never connect generated wiring to hardware without checking the component datasheet.</p>
      </section>

      {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-xs text-rose-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {toolMessage && <div aria-live="polite" className="mb-5 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{toolMessage}</div>}

      {result && <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7 rounded-2xl border border-slate-800 bg-slate-900 p-3 sm:p-4 shadow-xl">
          <div className="mb-3 flex flex-col gap-3 border-b border-slate-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2"><span className="rounded bg-cyan-950 px-2.5 py-1 font-mono text-xs font-bold text-cyan-400">{language.toUpperCase()}</span><span className="text-xs text-slate-400">Editable • {targetBoard}</span></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleRun} disabled={runState === 'loading'} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"><Play className="h-3.5 w-3.5" /> {runState === 'loading' ? 'Running...' : 'Run Simulation'}</button>
              <button onClick={handleExplain} disabled={toolState === 'loading'} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"><Lightbulb className="h-3.5 w-3.5" /> Explain</button>
              <button onClick={handleDebug} disabled={toolState === 'loading'} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"><Bug className="h-3.5 w-3.5" /> Debug</button>
              <button onClick={handleImprove} disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-700/60 bg-indigo-950/50 px-3 py-2 text-xs font-semibold text-indigo-200 hover:bg-indigo-900/50"><WandSparkles className="h-3.5 w-3.5" /> Improve</button>
            </div>
          </div>
          <div className="h-[440px] overflow-hidden rounded-xl border border-slate-800 sm:h-[520px]">
            <Editor height="100%" language={editorLanguage} theme="vs-dark" value={code} onChange={value => setCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 13, automaticLayout: true, padding: { top: 12 }, scrollBeyondLastLine: false, wordWrap: 'on' }} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700">{copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy Code'}</button>
            <button onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"><Download className="h-3.5 w-3.5" /> Download</button>
            <button onClick={() => setCode(result.code)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700"><RotateCcw className="h-3.5 w-3.5" /> Restore Generated</button>
            <button onClick={handleSendToSimulator} className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400"><Send className="h-3.5 w-3.5" /> Open 3D Lab</button>
          </div>
        </div>

        <aside className="flex flex-col gap-5 xl:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <div className="mb-3 flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              {(['wiring', 'explain', 'debug'] as const).map(panel => <button key={panel} onClick={() => setActivePanel(panel)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${activePanel === panel ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{panel === 'wiring' ? `Wiring (${wiringCount})` : panel === 'explain' ? 'Explanation' : 'Debug'}</button>)}
            </div>

            {activePanel === 'wiring' && <div className="space-y-2">
              {result.wiring?.length ? result.wiring.map((w, idx) => <div key={idx} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"><div className="flex items-center justify-between gap-2 font-bold"><span className="text-cyan-400">{w.from}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" /><span className="text-indigo-400">{w.to}</span></div>{w.note && <p className="mt-1 text-[11px] text-slate-400">{w.note}</p>}</div>) : <p className="text-xs text-slate-500">No wiring connections were returned.</p>}
              <div className="mt-3 rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 text-[11px] text-amber-200">Verify voltage, polarity, current limits and pinout against the exact hardware before physical assembly.</div>
            </div>}

            {activePanel === 'explain' && <div className="space-y-3">
              {explanation ? <><p className="text-sm leading-relaxed text-slate-300">{explanation.summary}</p><div className="flex flex-wrap gap-1.5">{explanation.concepts?.map((c, i) => <span key={i} className="rounded-full bg-indigo-950 px-2 py-1 text-[11px] text-indigo-300">{c}</span>)}</div><div className="max-h-72 space-y-2 overflow-auto pr-1">{explanation.lineByLine?.map(item => <div key={item.line} className="rounded-lg bg-slate-950 p-2.5 text-xs"><span className="font-mono text-cyan-400">L{item.line}</span><span className="ml-2 text-slate-300">{item.explanation}</span></div>)}</div></> : <div className="py-8 text-center text-xs text-slate-500">Click Explain to analyze the current editor code.</div>}
            </div>}

            {activePanel === 'debug' && <div className="space-y-3">
              {debugResult ? <><div className="rounded-xl bg-rose-950/20 p-3"><p className="text-xs font-bold text-rose-300">Problem</p><p className="mt-1 text-xs text-slate-300">{debugResult.problem}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs font-bold text-amber-300">Cause</p><p className="mt-1 text-xs text-slate-300">{debugResult.cause}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs font-bold text-emerald-300">Solution</p><p className="mt-1 text-xs text-slate-300">{debugResult.solution}</p></div><button onClick={() => setCode(debugResult.correctedCode)} className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400">Use Corrected Code</button><p className="text-[11px] text-slate-500">Confidence: {debugResult.confidence}</p></> : <div className="py-8 text-center text-xs text-slate-500">Click Debug to inspect the current editor code.</div>}
            </div>}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold"><Cpu className="h-4 w-4 text-cyan-400" /> Required Components</h2>
            <div className="flex flex-wrap gap-2">{result.requiredComponents?.map((item, i) => <span key={i} className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-[11px] text-slate-300">{item}</span>)}</div>
            {result.possibleErrors?.length ? <div className="mt-4"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-300"><AlertTriangle className="h-3.5 w-3.5" /> Watch Out</h3><ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-400">{result.possibleErrors.map((item, i) => <li key={i}>{item}</li>)}</ul></div> : null}
          </div>
        </aside>
      </section>}
    </main>
  );
};
