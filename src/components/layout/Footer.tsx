import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Github, Heart, Cpu, Box, Code, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#070b14] py-12 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                RoboLearn <span className="text-cyan-600 dark:text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              Interactive AI-powered platform for mastering embedded systems, microcontroller firmware, and autonomous robotics with real-time 3D simulation.
            </p>
          </div>

          {/* Quick Learning Links */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Curriculum</h4>
            <ul className="space-y-2">
              <li><Link to="/learn" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">Robotics 10-Level Path</Link></li>
              <li><Link to="/components" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">Electronic Components (Arduino, ESP32)</Link></li>
              <li><Link to="/programming" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">C, C++ & Python Programming</Link></li>
              <li><Link to="/challenges" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">Embedded Coding Challenges</Link></li>
            </ul>
          </div>

          {/* AI & Simulation */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Simulators & AI</h4>
            <ul className="space-y-2">
              <li><Link to="/lab3d" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">3D Virtual Workbench Lab</Link></li>
              <li><Link to="/ai-code" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">AI Code Generator (Prompt → Hardware)</Link></li>
              <li><Link to="/ai-tutor" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">Gemini Socratic Tutor</Link></li>
              <li><Link to="/projects" className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition">Hands-on Hardware Projects</Link></li>
            </ul>
          </div>

          {/* Hardware & Compatibility */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Hardware Covered</h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Arduino Uno', 'ESP32', 'Raspberry Pi', 'HC-SR04', 'SG90 Servo', 'L298N', 'OLED I2C', 'MPU6050', 'PIR Motion', 'RGB LED'].map((item) => (
                <span key={item} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-mono">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} RoboLearn AI. Powered by Google Gemini & Three.js.</p>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Built for aspiring roboticists, students & makers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
