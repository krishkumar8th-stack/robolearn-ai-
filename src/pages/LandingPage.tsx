import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Cpu,
  BookOpen,
  Code,
  Box,
  MessageSquare,
  Trophy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Play
} from 'lucide-react';
import { ThreeSimulatorCanvas } from '../components/simulator/ThreeSimulatorCanvas';
import { useLanguage } from '../contexts/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Powered by Real Google Gemini AI & 3D WebGL Simulation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Learn Robotics. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 dark:from-cyan-400 dark:via-teal-300 dark:to-blue-500">
              Code Anything.
            </span>{' '}
            See It Come Alive.
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/lab3d"
              className="px-6 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold rounded-xl text-sm border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 shadow-sm"
            >
              <Box className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              {t('hero.explore3D')}
            </Link>

            <Link
              to="/ai-code"
              className="px-6 py-3.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200 font-bold rounded-xl text-sm border border-indigo-200 dark:border-indigo-700/60 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              AI Code Generator
            </Link>
          </div>
        </div>

        {/* Live Interactive 3D Lab Preview directly in Hero */}
        <div className="relative mx-auto max-w-5xl rounded-3xl p-2 bg-gradient-to-b from-slate-200 dark:from-slate-800/80 to-slate-100 dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="absolute -top-3 left-6 px-3 py-0.5 bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow">
            Live 3D Hardware Simulation Bench
          </div>
          <ThreeSimulatorCanvas heightClass="h-[480px] sm:h-[540px]" showToolbar={true} />
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything You Need to Master Robotics & Embedded AI
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">
              From your first blinking LED to building autonomous rovers and computer vision firmware.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 group-hover:scale-110 transition">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Real 3D Virtual Hardware</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Simulate Arduino Uno, ESP32, HC-SR04 sonar, servos, and 2WD differential drive chassis in real-time. Test your code safely without physical components.
              </p>
              <Link to="/lab3d" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline">
                Open 3D Simulator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Prompt → Code → 3D Simulation</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Describe any robotics behavior in plain English. Gemini generates working C++ code, pin wiring guides, and automatically maps it to 3D simulation actions.
              </p>
              <Link to="/ai-code" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                Try AI Generator <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition group shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">25+ Verified Components</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Explore deep pinouts, operating voltages, wiring diagrams, common mistakes, and safety guidelines for microcontrollers, sensors, and actuators.
              </p>
              <Link to="/components" className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline">
                Explore Parts Library <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Level Robotics Learning Roadmap Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Structured Curriculum</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              The 10-Level Robotics Mastery Journey
            </h2>
          </div>
          <Link
            to="/learn"
            className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500"
          >
            View all courses & lessons <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { lvl: 1, title: 'Basics & Electronics', desc: 'Voltage, Current, Breadboards & LEDs', tag: 'Beginner' },
            { lvl: 2, title: 'Microcontrollers', desc: 'Arduino Architecture & GPIO Pins', tag: 'Beginner' },
            { lvl: 3, title: 'Sensors & Inputs', desc: 'Ultrasonic, IR, Buttons & Analog ADC', tag: 'Intermediate' },
            { lvl: 4, title: 'Motors & Motion', desc: 'DC Motors, Servos & H-Bridge Drivers', tag: 'Intermediate' },
            { lvl: 5, title: 'Autonomous Rovers', desc: 'Obstacle Evasion & Line Tracking', tag: 'Advanced' }
          ].map((item) => (
            <div key={item.lvl} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-black text-cyan-600 dark:text-cyan-400">LEVEL 0{item.lvl}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">{item.tag}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <Link
                to="/learn"
                className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center justify-between"
              >
                <span>Start Level</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 text-white shadow-2xl">
          <h2 className="text-3xl font-black text-white mb-3">
            Ready to Build Your First Robot?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
            Join thousands of makers, students, and engineers mastering embedded firmware and autonomous robotics through real-time 3D simulation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
            >
              Get Started Now — Open Dashboard
            </Link>
            <Link
              to="/ai-tutor"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm border border-slate-700 transition"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
