import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, Copy, RotateCcw, Send, User, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AIChatMessage } from '../types/index';

const STORAGE_KEY = 'roblearn_ai_tutor_history_v1';
const SAMPLE_QUESTIONS = [
  'Why do I need a current-limiting resistor with an LED?',
  'How does an HC-SR04 measure distance?',
  'Explain PWM on Arduino with duty cycle',
  'What is the difference between ESP32 and Arduino Uno?',
  'How do I debounce a mechanical pushbutton?'
];
const HARDWARE = ['Arduino Uno R3', 'ESP32', 'Raspberry Pi Pico', 'Generic robotics circuit'];

const welcome = (): AIChatMessage => ({
  id: 'msg-welcome', sender: 'assistant', timestamp: new Date().toISOString(),
  content: 'Hello! I am your **RoboLearn AI Tutor**.\n\nAsk me about robotics, electronics, sensors, embedded C++/Python, circuits, or debugging. I can give hints first or a direct solution.'
});

function renderContent(content: string, onCopy: (code: string) => void) {
  const parts = content.split(/```([\w+#.-]*)\n?([\s\S]*?)```/g);
  return parts.map((part, i) => {
    if (i % 3 === 1) return null;
    if (i % 3 === 2) {
      const code = part.trim();
      return (
        <div key={i} className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[10px] font-mono text-slate-500">
            <span>{parts[i - 1] || 'code'}</span>
            <button onClick={() => onCopy(code)} className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 text-slate-300" aria-label="Copy code"><Copy className="h-3 w-3" /> Copy</button>
          </div>
          <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-slate-200"><code>{code}</code></pre>
        </div>
      );
    }
    return <p key={i} className="whitespace-pre-wrap">{part.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
  });
}

export const AITutorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [welcome()];
    } catch { return [welcome()]; }
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'socratic' | 'direct'>('socratic');
  const [selectedHardware, setSelectedHardware] = useState('Arduino Uno R3');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60))); } catch { /* storage can be unavailable */ }
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const conversation = useMemo(() => messages.slice(-20), [messages]);

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { setCopied(false); }
  };

  const send = async (preset?: string) => {
    const text = (preset ?? inputText).trim();
    if (!text || isLoading) return;
    setError(null);
    const userMsg: AIChatMessage = { id: `u-${Date.now()}`, sender: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    try {
      const res = await api.aiTutor(text, conversation, {
        experienceLevel: user?.experienceLevel || 'Beginner',
        currentLesson: selectedHardware,
        hardware: selectedHardware,
        mode
      });
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, sender: 'assistant', content: res.reply, timestamp: new Date().toISOString() }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI Tutor is temporarily unavailable.');
      setMessages(prev => [...prev, { id: `e-${Date.now()}`, sender: 'assistant', content: 'I could not reach the AI service. Check your connection and try again.', timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  const clearChat = () => { setMessages([welcome()]); setError(null); };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col bg-slate-50 px-3 py-3 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 sm:px-6 sm:py-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500"><Bot className="h-6 w-6" /></div>
          <div><h1 className="flex items-center gap-2 text-lg font-bold">RoboLearn AI Tutor <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500">ONLINE</span></h1><p className="text-xs text-slate-500 dark:text-slate-400">Learn, debug and build with context-aware robotics guidance.</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="hardware">Hardware</label>
          <select id="hardware" value={selectedHardware} onChange={e => setSelectedHardware(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs dark:border-slate-700 dark:bg-slate-950">
            {HARDWARE.map(h => <option key={h}>{h}</option>)}
          </select>
          <div className="flex rounded-lg border border-slate-200 p-1 text-xs dark:border-slate-700">
            <button onClick={() => setMode('socratic')} className={`rounded px-2.5 py-1.5 font-semibold ${mode === 'socratic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}>Hints first</button>
            <button onClick={() => setMode('direct')} className={`rounded px-2.5 py-1.5 font-semibold ${mode === 'direct' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}>Direct</button>
          </div>
          <button onClick={clearChat} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" aria-label="Clear chat" title="Clear chat"><Trash2 className="h-4 w-4" /></button>
        </div>
      </header>

      {error && <div role="alert" className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-700 dark:text-amber-300">{error}</div>}
      <div className="flex-1 overflow-y-auto py-4 sm:py-5" aria-live="polite">
        <div className="space-y-4">
          {messages.map(msg => {
            const ai = msg.sender === 'assistant';
            return <div key={msg.id} className={`flex gap-2.5 ${ai ? 'justify-start' : 'justify-end'}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${ai ? 'bg-cyan-500/10 text-cyan-500' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'} ${!ai ? 'order-2' : ''}`} aria-hidden="true">{ai ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}</div>
              <article className={`max-w-[90%] rounded-2xl border p-3.5 text-sm leading-relaxed shadow-sm sm:max-w-[78%] ${ai ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900' : 'border-cyan-600 bg-cyan-600 text-white'}`}>
                {renderContent(msg.content, copyCode)}
                <time className={`mt-2 block text-[10px] ${ai ? 'text-slate-400' : 'text-cyan-100'}`} dateTime={msg.timestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              </article>
            </div>;
          })}
          {isLoading && <div className="flex gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/10 text-cyan-500"><Bot className="h-4 w-4" /></div><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-500" />Thinking through the circuit and your learning level…</div></div>}
          <div ref={endRef} />
        </div>
      </div>

      <div className="pb-2 pt-1">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {SAMPLE_QUESTIONS.map(q => <button key={q} onClick={() => send(q)} disabled={isLoading} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{q}</button>)}
        </div>
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg focus-within:border-cyan-500 dark:border-slate-800 dark:bg-slate-900">
          <input value={inputText} onChange={e => setInputText(e.target.value)} maxLength={2000} autoComplete="off" placeholder="Ask about robotics, circuits, C++, Python, sensors…" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400" aria-label="Message your AI tutor" />
          <button type="submit" disabled={isLoading || !inputText.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button>
        </form>
        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400"><span>AI responses can be imperfect—verify hardware ratings before wiring.</span>{copied && <span className="inline-flex items-center gap-1 text-emerald-500"><Check className="h-3 w-3" /> Copied</span>}</div>
      </div>
    </div>
  );
};
