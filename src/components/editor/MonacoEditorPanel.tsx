import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Sparkles,
  Bug,
  Lightbulb,
  Download,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  ChevronDown,
  Info
} from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import { api } from '../../services/api';
import { AIDebugResult } from '../../types/index';

interface MonacoEditorPanelProps {
  initialCode?: string;
  language?: 'cpp' | 'python' | 'javascript';
  targetBoard?: string;
  onCodeChange?: (code: string) => void;
  height?: string;
  challengeTitle?: string;
  challengeProblem?: string;
}

export const MonacoEditorPanel: React.FC<MonacoEditorPanelProps> = ({
  initialCode = `// Arduino C++ Robotics Code
#include <Servo.h>

Servo myServo;
const int ledPin = 13;
const int trigPin = 11;
const int echoPin = 12;

void setup() {
  Serial.begin(9600);
  pinMode(ledPin, OUTPUT);
  myServo.attach(9);
  myServo.write(90); // Center position
  Serial.println("Robotics system online.");
}

void loop() {
  // Blink status LED
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);

  // Sweep servo
  myServo.write(45);
  delay(400);
  myServo.write(135);
  delay(400);
}`,
  language = 'cpp',
  targetBoard = 'Arduino Uno',
  onCodeChange,
  height = '480px',
  challengeTitle,
  challengeProblem
}) => {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'editor' | 'ai-explain' | 'ai-debug' | 'hint'>('editor');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{ summary: string; lineByLine: any[]; concepts: string[] } | null>(null);
  const [aiDebugResult, setAiDebugResult] = useState<AIDebugResult | null>(null);
  const [aiHintText, setAiHintText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(targetBoard);

  const { state, runActions, appendLog } = useSimulation();

  const handleEditorChange = (value: string | undefined) => {
    const updated = value || '';
    setCode(updated);
    if (onCodeChange) onCodeChange(updated);
  };

  const handleRunIn3DLab = async () => {
    setIsInterpreting(true);
    appendLog('[COMPILER] Verifying and parsing code for hardware simulator...', 'info');
    try {
      const res = await api.interpretCode(code, language, state.obstacle.distanceToRobot);
      if (res.success && res.actions.length > 0) {
        appendLog(`[SIMULATOR] ${res.message}`, 'info');
        runActions(res.actions, res.logs);
      } else {
        appendLog(`[ERROR] ${res.message}`, 'error');
      }
    } catch (err: any) {
      appendLog(`[ERROR] Interpretation error: ${err.message}`, 'error');
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleExplainWithAi = async () => {
    setIsAiLoading(true);
    setActiveTab('ai-explain');
    try {
      const res = await api.aiExplainCode(code, language);
      setAiExplanation(res);
    } catch (err: any) {
      setAiExplanation({
        summary: `AI explanation unavailable: ${err?.message || 'the AI service could not be reached'}`,
        lineByLine: [],
        concepts: []
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDebugWithAi = async () => {
    setIsAiLoading(true);
    setActiveTab('ai-debug');
    try {
      const res = await api.aiDebugCode(code, language, undefined, selectedBoard);
      setAiDebugResult(res);
    } catch (err: any) {
      setAiDebugResult({
        problem: 'AI debugger is unavailable',
        cause: err?.message || 'The AI service could not be reached.',
        solution: 'Reconnect the AI service and run the debugger again.',
        correctedCode: code,
        explanation: 'No code change was generated because the AI service did not return a verified result.',
        confidence: 'Low',
        preventionTips: ['Check the API service status before applying an AI-generated fix.']
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGetHint = async () => {
    setIsAiLoading(true);
    setActiveTab('hint');
    try {
      const res = await api.aiHint(
        challengeTitle || 'Embedded Robotics Logic',
        challengeProblem || 'Control pins and sensors based on logic',
        code,
        1
      );
      setAiHintText(res.hint);
    } catch (err: any) {
      setAiHintText(`AI hint unavailable: ${err?.message || 'the AI service could not be reached'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = language === 'python' ? 'robot_firmware.py' : 'robot_sketch.ino';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Editor Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Arduino Uno" className="bg-slate-900 text-white">Arduino Uno R3</option>
              <option value="ESP32 NodeMCU" className="bg-slate-900 text-white">ESP32 NodeMCU</option>
              <option value="Raspberry Pi Pico" className="bg-slate-900 text-white">Raspberry Pi Pico</option>
            </select>
          </div>

          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {language.toUpperCase()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunIn3DLab}
            disabled={isInterpreting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isInterpreting ? 'Compiling...' : 'Run in 3D Lab'}
          </button>

          <button
            onClick={handleExplainWithAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Explain AI
          </button>

          <button
            onClick={handleDebugWithAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition"
          >
            <Bug className="w-3.5 h-3.5" />
            Debug AI
          </button>

          {challengeTitle && (
            <button
              onClick={handleGetHint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Hint
            </button>
          )}

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            title="Download Sketch"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Surface */}
      <div className="relative" style={{ height }}>
        <Editor
          height="100%"
          defaultLanguage={language === 'cpp' ? 'cpp' : language}
          language={language === 'cpp' ? 'cpp' : language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            fontFamily: "'Fira Code', monospace",
            tabSize: 2,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 12, bottom: 12 }
          }}
        />

        {/* AI Explain Modal / Overlay Drawer */}
        {activeTab === 'ai-explain' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 z-20 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-slate-100 text-base">Gemini AI Code Explanation</h3>
              </div>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Back to Code
              </button>
            </div>

            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-mono">Analyzing microcontroller firmware logic...</p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
                  <h4 className="font-semibold text-indigo-300 mb-1">Summary</h4>
                  <p className="leading-relaxed">{aiExplanation.summary}</p>
                </div>

                {aiExplanation.concepts && aiExplanation.concepts.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-2">Core Concepts:</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiExplanation.concepts.map((concept, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-cyan-300 font-medium">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiExplanation.lineByLine && aiExplanation.lineByLine.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-2">Line-by-Line Breakdown:</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {aiExplanation.lineByLine.map((item, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex gap-3">
                          <span className="font-mono text-cyan-400 font-bold">L{item.line || i + 1}</span>
                          <span className="text-slate-300">{item.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* AI Debug Modal / Overlay Drawer */}
        {activeTab === 'ai-debug' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 z-20 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-slate-100 text-base">Gemini AI Firmware Debugger</h3>
              </div>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Back to Code
              </button>
            </div>

            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-mono">Running AST and hardware conflict check...</p>
              </div>
            ) : aiDebugResult ? (
              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-amber-300">Problem Identified</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-200">
                      Confidence: {aiDebugResult.confidence}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium">{aiDebugResult.problem}</p>
                  <p className="text-xs text-slate-400 mt-1">{aiDebugResult.cause}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-emerald-300">Recommended Fix</h4>
                    <button
                      onClick={() => {
                        setCode(aiDebugResult.correctedCode);
                        if (onCodeChange) onCodeChange(aiDebugResult.correctedCode);
                        setActiveTab('editor');
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition"
                    >
                      Apply Fix to Editor
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-lg font-mono text-xs overflow-x-auto text-emerald-200 border border-slate-800">
                    {aiDebugResult.correctedCode}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* AI Hint Overlay */}
        {activeTab === 'hint' && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md p-6 z-20 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-slate-100 text-base">Socratic Hint</h3>
              </div>
              <button
                onClick={() => setActiveTab('editor')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Back to Code
              </button>
            </div>

            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400 font-mono">Generating conceptual clue...</p>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-slate-200">
                <p className="text-base leading-relaxed">{aiHintText}</p>
                <div className="mt-4 pt-4 border-t border-purple-900/40 flex justify-end">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold"
                  >
                    Got It, Let Me Try!
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 text-[11px] text-slate-400 border-t border-slate-800 font-mono">
        <div className="flex items-center gap-3">
          <span>Target: <strong className="text-slate-300">{selectedBoard}</strong></span>
          <span>Simulator: <strong className="text-cyan-400">Arduino C/C++ subset</strong></span>
        </div>
        <div>
          <span>Lines: {code.split('\n').length} | UTF-8</span>
        </div>
      </div>
    </div>
  );
};
