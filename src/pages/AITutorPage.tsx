import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  Code,
  RotateCcw,
  BookOpen,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AIChatMessage } from '../types/index';

const SAMPLE_QUESTIONS = [
  'Why do I need a current-limiting resistor with an LED?',
  'What is the formula for converting HC-SR04 pulse duration to centimeters?',
  'Explain how PWM works on Arduino digital pins with duty cycle',
  'What is the difference between ESP32 and Arduino Uno?',
  'How do I debounce a mechanical pushbutton in code?'
];

export const AITutorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content: `Hello! I am your **RoboLearn AI Tutor**.\n\nI can help you understand microcontroller circuits, write embedded C++/Python code, calculate resistor values, or debug hardware problems.\n\nWhat are you working on today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'socratic' | 'direct'>('socratic');
  const [selectedHardware, setSelectedHardware] = useState('Arduino Uno R3');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.aiTutor(
        text,
        messages,
        {
          experienceLevel: user?.experienceLevel || 'Beginner',
          currentLesson: selectedHardware,
          mode
        }
      );

      const aiMsg: AIChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'assistant',
        content: res.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI brain. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        content: `Chat cleared. Ready for your next electronics or robotics question!`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 max-w-5xl mx-auto w-full p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              RoboLearn AI Tutor <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold">ONLINE</span>
            </h1>
            <p className="text-xs text-slate-400">Socratic guidance for robotics, firmware, sensors and electronics.</p>
          </div>
        </div>

        {/* Options */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setMode('socratic')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                mode === 'socratic' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Give hints first so you learn deeply"
            >
              Hints First
            </button>
            <button
              onClick={() => setMode('direct')}
              className={`px-2.5 py-1 rounded font-semibold transition ${
                mode === 'direct' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Direct answers and full code solutions"
            >
              Direct
            </button>
          </div>

          <button
            onClick={handleClearChat}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAi
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-cyan-600 text-white font-medium shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                <div className={`text-[10px] mt-2 font-mono ${isAi ? 'text-slate-500' : 'text-cyan-200'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Analyzing circuit physics and formulating pedagogical guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="flex items-center gap-2 overflow-x-auto py-2">
        <span className="text-[11px] text-slate-500 font-semibold shrink-0">Quick questions:</span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs whitespace-nowrap transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-cyan-500 transition shadow-xl"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your tutor anything about robotics, circuits, C++, or sensors..."
            className="flex-1 px-3 py-2 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
