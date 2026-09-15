import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Download,
  Box,
  Cpu,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { useSimulation } from '../contexts/SimulationContext';
import { AICodeGenerationResult } from '../types/index';

const SAMPLE_PROMPTS = [
  'Make an Arduino robot detect an obstacle with ultrasonic sensor and turn left',
  'Blink an LED with 500ms intervals and print serial state',
  'Sweep an SG90 micro servo from 0 to 180 degrees smoothly',
  'Read analog temperature from TMP36 sensor and trigger buzzer above 30°C',
  'Control ESP32 onboard LED via Wi-Fi web server'
];

export const AICodeGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [targetBoard, setTargetBoard] = useState('Arduino Uno');
  const [language, setLanguage] = useState<'cpp' | 'python'>('cpp');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AICodeGenerationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { runActions, appendLog } = useSimulation();
  const navigate = useNavigate();

  const handleGenerate = async (queryText?: string) => {
    const textToRun = queryText || prompt;
    if (!textToRun.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.aiGenerateCode(textToRun, targetBoard, language);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate firmware code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToSimulator = () => {
    if (!result) return;
    if (result.simulationActions && result.simulationActions.length > 0) {
      appendLog(`[AI-GENERATOR] Loading AI-synthesized actions for: ${prompt}`, 'info');
      runActions(result.simulationActions, [
        `[GENERATED] Firmware for ${targetBoard} loaded into virtual MCU.`,
        `[CIRCUIT] Configured ${result.wiring.length} validated pin connections.`
      ]);
      navigate('/lab3d');
    } else {
      navigate('/lab3d');
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = language === 'python' ? 'generated_code.py' : 'generated_sketch.ino';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real Google Gemini Embedded AI Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Robotics & Firmware AI Code Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Prompt → Complete Microcontroller Firmware + Circuit Wiring Diagrams + Real-time 3D Simulation Commands.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            What behavior or robot do you want to build?
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Make an Arduino robot detect an obstacle with ultrasonic sensor, apply emergency brakes, and turn left..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            />
          </div>

          {/* Options Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Target Hardware:</span>
                <select
                  value={targetBoard}
                  onChange={(e) => setTargetBoard(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Arduino Uno">Arduino Uno R3</option>
                  <option value="ESP32 NodeMCU">ESP32 NodeMCU</option>
                  <option value="Raspberry Pi Pico">Raspberry Pi Pico</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Language:</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="cpp">Arduino C++</option>
                  <option value="python">MicroPython</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Firmware...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Code & Circuit</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
            <span className="text-[11px] text-slate-500 font-semibold shrink-0">Try Examples:</span>
            {SAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  handleGenerate(p);
                }}
                className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs whitespace-nowrap transition border border-slate-700/50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs mb-6">
          {error}
        </div>
      )}

      {/* Generated Result View */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Code Editor with Monaco */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 text-xs font-mono font-bold">
                    {language.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Ready for {targetBoard}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendToSimulator}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Box className="w-3.5 h-3.5" />
                    Send to 3D Simulator
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    title="Copy Code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="h-96 rounded-xl overflow-hidden border border-slate-800">
                <Editor
                  height="100%"
                  defaultLanguage={language === 'cpp' ? 'cpp' : 'python'}
                  language={language === 'cpp' ? 'cpp' : 'python'}
                  theme="vs-dark"
                  value={result.code}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'Fira Code', monospace",
                    readOnly: false,
                    padding: { top: 12 }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Wiring Guide & Explanation */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Wiring Table */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-cyan-400" /> Circuit Wiring Guide
              </h3>
              <div className="space-y-2">
                {result.wiring.map((w, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span className="text-cyan-400">{w.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-indigo-400">{w.to}</span>
                    </div>
                    {w.note && <p className="text-[11px] text-slate-400 mt-1">{w.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> How It Works
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {result.explanation}
              </p>

              {result.possibleErrors && result.possibleErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Watch Out:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {result.possibleErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
