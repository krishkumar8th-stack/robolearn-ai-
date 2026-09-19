import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, ChevronDown, Copy, MessageSquarePlus, RotateCcw, Send, Settings2, Trash2, User, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AIChatMessage } from '../types/index';
import { useLanguage } from '../contexts/LanguageContext';

const STORAGE_KEY = 'roblearn_ai_tutor_history_v2';
const SAMPLE_QUESTIONS = [
  'Explain recursion like I am a beginner',
  'Write a C++ program to find the largest number',
  'How does an HC-SR04 ultrasonic sensor work?',
  'Help me debug this Arduino code',
  'What is the difference between TCP and UDP?',
  'Create a 7-day plan to learn C++ basics',
];
const HARDWARE = ['No hardware context', 'Arduino Uno R3', 'ESP32', 'Raspberry Pi Pico', 'Generic robotics circuit'];

type Chat = { id: string; title: string; messages: AIChatMessage[]; createdAt: string };

const createWelcome = (): AIChatMessage => ({
  id: 'msg-welcome',
  sender: 'assistant',
  timestamp: new Date().toISOString(),
  content: 'Hi! I\'m **RoboLearn AI**. Ask me anything—coding, robotics, electronics, maths, science, study planning, debugging, writing, or general questions.\n\nI will answer in a clear, conversational way and can give code when you need it.',
});

const makeChat = (): Chat => ({ id: `chat-${Date.now()}`, title: 'New chat', messages: [createWelcome()], createdAt: new Date().toISOString() });

function renderContent(content: string, onCopy: (code: string) => void) {
  const pieces = content.split(/```([^\n]*)\n?([\s\S]*?)```/g);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < pieces.length; i += 3) {
    if (pieces[i]) {
      nodes.push(
        <div key={`text-${i}`} className="whitespace-pre-wrap break-words">
          {pieces[i].split(/\*\*(.*?)\*\*/g).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </div>,
      );
    }
    const lang = pieces[i + 1];
    const code = pieces[i + 2];
    if (code !== undefined) {
      nodes.push(
        <div key={`code-${i}`} className="my-3 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117]">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500">
            <span>{lang || 'code'}</span>
            <button onClick={() => onCopy(code.trim())} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800" aria-label="Copy code"><Copy className="h-3 w-3" />Copy</button>
          </div>
          <pre className="max-h-[520px] overflow-auto p-3 text-[12px] leading-relaxed text-slate-200"><code>{code.trim()}</code></pre>
        </div>,
      );
    }
  }
  return nodes;
}

export const AITutorPage: React.FC = () => {
  const { user } = useAuth();
  const { currentMeta } = useLanguage();
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [makeChat()];
      const parsed = JSON.parse(saved) as Chat[];
      return Array.isArray(parsed) && parsed.length ? parsed : [makeChat()];
    } catch { return [makeChat()]; }
  });
  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'socratic' | 'direct'>('direct');
  const [selectedHardware, setSelectedHardware] = useState('No hardware context');
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(chat => chat.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];
  const recentHistory = useMemo(() => messages.slice(-18), [messages]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, 20))); } catch { /* storage may be unavailable */ }
  }, [chats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const updateActiveChat = (updater: (chat: Chat) => Chat) => {
    setChats(prev => prev.map(chat => chat.id === activeChat?.id ? updater(chat) : chat));
  };

  const newChat = () => {
    const chat = makeChat();
    setChats(prev => [chat, ...prev].slice(0, 20));
    setActiveChatId(chat.id);
    setInputText('');
    setError(null);
  };

  const clearCurrentChat = () => {
    if (!activeChat) return;
    updateActiveChat(chat => ({ ...chat, title: 'New chat', messages: [createWelcome()] }));
    setError(null);
  };

  const copyCode = async (code: string) => {
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1200); } catch { setCopied(false); }
  };

  const send = async (preset?: string) => {
    const text = (preset ?? inputText).trim();
    if (!text || isLoading || !activeChat) return;
    setError(null);
    const userMsg: AIChatMessage = { id: `u-${Date.now()}`, sender: 'user', content: text, timestamp: new Date().toISOString() };
    const historyBeforeReply = activeChat.messages.slice(-18);
    updateActiveChat(chat => ({
      ...chat,
      title: chat.title === 'New chat' ? text.slice(0, 42) + (text.length > 42 ? '…' : '') : chat.title,
      messages: [...chat.messages, userMsg],
    }));
    setInputText('');
    setIsLoading(true);
    try {
      const res = await api.aiTutor(text, historyBeforeReply, {
        experienceLevel: user?.experienceLevel || 'Beginner',
        currentLesson: 'General AI learning assistant',
        hardware: selectedHardware,
        mode,
        language: currentMeta.name,
      });
      updateActiveChat(chat => ({
        ...chat,
        messages: [...chat.messages, { id: `a-${Date.now()}`, sender: 'assistant', content: res.reply, timestamp: new Date().toISOString() }],
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'AI service is temporarily unavailable.';
      setError(message);
    } finally { setIsLoading(false); }
  };

  const regenerate = async () => {
    if (!activeChat || isLoading) return;
    const prior = [...activeChat.messages];
    const lastUser = [...prior].reverse().find(m => m.sender === 'user');
    if (!lastUser) return;
    const withoutLastAssistant = prior.slice(0, Math.max(1, prior.length - 1));
    setChats(prev => prev.map(chat => chat.id === activeChat.id ? { ...chat, messages: withoutLastAssistant } : chat));
    setIsLoading(true);
    setError(null);
    try {
      const history = withoutLastAssistant.filter(m => m.id !== lastUser.id).slice(-18);
      const res = await api.aiTutor(lastUser.content, history, {
        experienceLevel: user?.experienceLevel || 'Beginner',
        currentLesson: 'General AI learning assistant',
        hardware: selectedHardware,
        mode,
        language: currentMeta.name,
      });
      updateActiveChat(chat => ({ ...chat, messages: [...withoutLastAssistant, { id: `a-${Date.now()}`, sender: 'assistant', content: res.reply, timestamp: new Date().toISOString() }] }));
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not regenerate the answer.'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1440px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-800 dark:bg-[#0b0f17] dark:text-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-[#090d15] lg:flex">
        <button onClick={newChat} className="mb-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"><MessageSquarePlus className="h-4 w-4" /> New chat</button>
        <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent chats</div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {chats.map(chat => <button key={chat.id} onClick={() => setActiveChatId(chat.id)} className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${chat.id === activeChatId ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300' : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'}`}><div className="truncate font-medium">{chat.title}</div><div className="mt-0.5 text-[10px] text-slate-400">{chat.messages.filter(m => m.sender === 'user').length} message(s)</div></button>)}
        </div>
        <div className="mt-3 border-t border-slate-200 pt-3 text-[10px] text-slate-400 dark:border-slate-800">Powered by RoboLearn AI · {user?.experienceLevel || 'Beginner'} mode</div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-500"><Bot className="h-5 w-5" /></div>
            <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-sm font-bold sm:text-base">RoboLearn AI</h1><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-500">AI ONLINE</span></div><p className="truncate text-[11px] text-slate-400">General-purpose AI + robotics coding tutor</p></div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={newChat} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" title="New chat"><MessageSquarePlus className="h-4 w-4" /></button>
            <button onClick={() => setShowSettings(v => !v)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="AI settings"><Settings2 className="h-4 w-4" /></button>
            <button onClick={clearCurrentChat} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Clear chat"><Trash2 className="h-4 w-4" /></button>
          </div>
        </header>

        {showSettings && <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-5"><div className="flex flex-wrap items-center gap-3"><label className="text-xs font-semibold text-slate-500">Answer style <select value={mode} onChange={e => setMode(e.target.value as 'socratic' | 'direct')} className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"><option value="direct">Direct answers</option><option value="socratic">Hints first</option></select></label><label className="text-xs font-semibold text-slate-500">Hardware <select value={selectedHardware} onChange={e => setSelectedHardware(e.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950">{HARDWARE.map(h => <option key={h}>{h}</option>)}</select></label><button onClick={() => setShowSettings(false)} className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button></div></div>}

        {error && <div role="alert" className="mx-4 mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">{error}</div>}

        <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            {messages.map((msg, index) => {
              const ai = msg.sender === 'assistant';
              return <div key={msg.id} className={`flex gap-3 ${ai ? 'justify-start' : 'justify-end'}`}>
                {ai && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-500"><Bot className="h-4 w-4" /></div>}
                <div className={`${ai ? 'max-w-[92%]' : 'max-w-[88%]'} rounded-2xl ${ai ? 'pt-1' : 'bg-cyan-600 px-4 py-3 text-white'}`}>
                  <div className="text-sm leading-7">{renderContent(msg.content, copyCode)}</div>
                  <div className={`mt-1 flex items-center gap-3 text-[10px] ${ai ? 'text-slate-400' : 'text-cyan-100'}`}><time dateTime={msg.timestamp}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>{ai && index === messages.length - 1 && !isLoading && <button onClick={regenerate} className="inline-flex items-center gap-1 hover:text-cyan-500"><RotateCcw className="h-3 w-3" /> Regenerate</button>}</div>
                </div>
                {!ai && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><User className="h-4 w-4" /></div>}
              </div>;
            })}
            {isLoading && <div className="flex gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-500/10 text-cyan-500"><Bot className="h-4 w-4" /></div><div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">Thinking…</div></div>}
            <div ref={endRef} />
          </div>
        </div>

        {messages.length <= 1 && <div className="px-3 sm:px-6"><div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">{SAMPLE_QUESTIONS.map(q => <button key={q} onClick={() => send(q)} disabled={isLoading} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs text-slate-600 hover:border-cyan-400 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">{q}</button>)}</div></div>}

        <div className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">
          <form onSubmit={e => { e.preventDefault(); send(); }} className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-300 bg-white p-2 shadow-lg focus-within:border-cyan-500 dark:border-slate-700 dark:bg-[#111722]">
            <textarea value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} maxLength={12000} rows={2} autoComplete="off" placeholder="Message RoboLearn AI…" className="max-h-40 min-h-[46px] w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400" aria-label="Message RoboLearn AI" />
            <div className="flex items-center justify-between px-1"><span className="text-[10px] text-slate-400">Enter to send · Shift+Enter for a new line</span><button type="submit" disabled={isLoading || !inputText.trim()} className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-40" aria-label="Send message"><Send className="h-4 w-4" /></button></div>
          </form>
          <div className="mx-auto mt-2 flex w-full max-w-3xl items-center justify-between text-[10px] text-slate-400"><span>AI can make mistakes. Verify important facts and hardware details.</span>{copied && <span className="inline-flex items-center gap-1 text-emerald-500"><Check className="h-3 w-3" /> Copied</span>}</div>
        </div>
      </section>
    </div>
  );
};
