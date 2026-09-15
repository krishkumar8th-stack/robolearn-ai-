import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Cpu,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Code,
  Copy,
  Check,
  Box,
  Sparkles,
  Send,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSimulation } from '../contexts/SimulationContext';
import { ElectronicComponent } from '../types/index';
import { MEDIA } from '../assets/media';

export const ComponentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, addXp } = useAuth();
  const { setSelected3DComponent } = useSimulation();
  const navigate = useNavigate();

  const [component, setComponent] = useState<ElectronicComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'python'>('cpp');
  const [copied, setCopied] = useState(false);

  // AI component inquiry state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await api.getComponentById(id);
        setComponent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleMarkLearned = async () => {
    if (!component) return;
    try {
      const res = await api.markComponentLearned(component.id);
      if (res.xpEarned > 0) {
        addXp(res.xpEarned, 'Component Learned');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAskAi = async () => {
    if (!component || !aiQuestion.trim() || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const res = await api.aiExplainComponent(component.id, aiQuestion);
      setAiAnswer(res.explanation);
    } catch {
      setAiAnswer('Could not contact the AI hardware assistant. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenIn3DLab = () => {
    if (!component) return;
    setSelected3DComponent(component.id);
    navigate('/lab3d');
  };

  const isLearned = Boolean(user?.learnedComponents?.includes(id || ''));

  const getSpec = (keyword: string, fallback: string) => {
    if (!component) return fallback;
    if (Array.isArray(component.specifications)) {
      const match = component.specifications.find(s => s.key.toLowerCase().includes(keyword.toLowerCase()));
      return match ? match.value : fallback;
    }
    return (component.specifications as any)?.[keyword] || fallback;
  };

  const compImage = component?.imageUrl || (component?.id ? MEDIA.components[component.id] : '') || MEDIA.arduinoUno;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-slate-950 text-white">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!component) {
    return (
      <div className="p-8 text-center text-slate-400 min-h-[60vh] flex flex-col items-center justify-center bg-slate-950">
        <p>Component not found.</p>
        <Link to="/components" className="mt-4 text-cyan-400 hover:underline">
          Back to Component Library
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Back Button & Top Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/components"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Components
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkLearned}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isLearned
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isLearned ? 'Learned' : 'Mark Learned (+30 XP)'}
          </button>

          <button
            onClick={handleOpenIn3DLab}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition shadow"
          >
            <Box className="w-3.5 h-3.5" />
            View in 3D Lab
          </button>
        </div>
      </div>

      {/* Hero Header & Real Photographic Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left: Text Details & Quick Specs */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                {component.category.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Difficulty: {component.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white">{component.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{component.tagline}</p>
            <p className="text-xs text-slate-300 leading-relaxed mt-3">{component.description}</p>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-4 border-t border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Voltage</span>
              <p className="text-xs font-bold text-cyan-400 mt-0.5 truncate">{getSpec('voltage', '5V DC')}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Current</span>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{getSpec('current', '20 mA')}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Microcontroller / IC</span>
              <p className="text-xs font-bold text-indigo-400 mt-0.5 truncate">{getSpec('microcontroller', getSpec('driver', 'Standard'))}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Pins / Leads</span>
              <p className="text-xs font-bold text-amber-400 mt-0.5">{component.pins ? component.pins.length : 0} Leads</p>
            </div>
          </div>
        </div>

        {/* Right: High-Res Real Macro Hardware Image Card */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800/80 p-3 flex flex-col justify-between shadow-xl">
          <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
            <img
              src={compImage}
              alt={component.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Real Hardware Lab Capture
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md p-2 rounded-lg border border-slate-800">
              <span className="font-mono text-cyan-400">Status: Active Bench Model</span>
              <button
                onClick={handleOpenIn3DLab}
                className="text-[10px] text-white font-bold bg-cyan-600 hover:bg-cyan-500 px-2 py-0.5 rounded transition flex items-center gap-1"
              >
                <Box className="w-3 h-3" /> Inspect 3D
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 px-1 text-center font-mono">
            High-fidelity physical macro capture for electronic component verification.
          </p>
        </div>
      </div>

      {/* Main Breakdown: What is it? & How it works? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" /> What is it?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {component.whatIsIt}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-indigo-400" /> How does it work?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {component.howItWorks}
          </p>
        </div>
      </div>

      {/* Pinout Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
        <h3 className="text-base font-bold text-white mb-4">Hardware Pinout Diagram & Function</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">Pin Name</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Function</th>
                <th className="pb-3 font-semibold">Voltage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {component.pins?.map((p: any, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2.5 font-bold font-mono text-cyan-400">{p.name || p.pinName || p.pinNumber}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {p.type || p.pinType || 'GPIO'}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{p.description}</td>
                  <td className="py-2.5 font-mono text-slate-400">{p.voltage || p.operatingVoltage || '5V'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Examples with Tabs */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" /> Working Firmware Code
            </h3>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setSelectedLanguage('cpp')}
                className={`px-3 py-1 rounded font-mono font-bold transition ${
                  selectedLanguage === 'cpp' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                C++ (Arduino)
              </button>
              <button
                onClick={() => setSelectedLanguage('python')}
                className={`px-3 py-1 rounded font-mono font-bold transition ${
                  selectedLanguage === 'python' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Python (MicroPython)
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              const code = selectedLanguage === 'cpp' ? component.codeExampleCpp : component.codeExamplePython;
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed">
          {selectedLanguage === 'cpp' ? component.codeExampleCpp : component.codeExamplePython}
        </pre>
      </div>

      {/* Common Mistakes & Safety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-800/40 shadow-xl">
          <h3 className="text-base font-bold text-amber-300 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Common Mistakes
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside">
            {component.commonMistakes.map((m, i) => (
              <li key={i} className="leading-relaxed">{m}</li>
            ))}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 shadow-xl">
          <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safety & Best Practices
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300 list-disc list-inside">
            {component.safetyGuidelines.map((s, i) => (
              <li key={i} className="leading-relaxed">{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ask AI about this component */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-indigo-800/40 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Ask Gemini About {component.name}</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Ask specific circuit calculations, integration with other sensors, or robotics design questions.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder={`e.g. How do I calibrate ${component.name} or connect it to an ESP32 safely?`}
            className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAskAi}
            disabled={isAiLoading || !aiQuestion.trim()}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition"
          >
            {isAiLoading ? 'Analyzing...' : 'Ask AI'}
          </button>
        </div>

        {aiAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {aiAnswer}
          </div>
        )}
      </div>
    </div>
  );
};
