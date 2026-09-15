import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Cpu,
  Code,
  Bot,
  Sparkles,
  Box,
  Trophy,
  User as UserIcon,
  Settings,
  Flame,
  CheckCircle2,
  ArrowRight,
  Search,
  ChevronRight,
  Play,
  Square,
  RotateCcw,
  Maximize2,
  Eye,
  Send,
  Paperclip,
  Mic,
  Star,
  Radio,
  Clock,
  Layers,
  Zap,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { MEDIA } from '../assets/media';
import { ThreeSimulatorCanvas } from '../components/simulator/ThreeSimulatorCanvas';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // Component Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [componentSearch, setComponentSearch] = useState<string>('');
  
  // 3D Lab Simulation State
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);
  const [simPerspective, setSimPerspective] = useState<'Perspective' | 'Top' | 'Front'>('Perspective');

  // AI Tutor Quick Interaction State
  const [tutorInput, setTutorInput] = useState<string>('');
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; action?: string }>>([
    {
      role: 'user',
      text: 'Explain how an ultrasonic sensor works in simple words.'
    },
    {
      role: 'assistant',
      text: 'An ultrasonic sensor works by sending out high-frequency sound waves (ultrasonic waves) and listening for the echo.\n\n1. It sends a short burst of ultrasonic sound (TRIG pin high for 10µs).\n2. The sound hits an obstacle and bounces back.\n3. The sensor measures how long the echo takes (ECHO pin pulse length).\n4. Using time and speed of sound (343 m/s), it calculates distance = (time × speed) / 2.'
    }
  ]);

  const handleSendTutorMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tutorInput.trim()) return;

    const userText = tutorInput.trim();
    setTutorMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setTutorInput('');

    // Responsive AI tutor response
    setTimeout(() => {
      setTutorMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Great question about "${userText}". In embedded robotics, this requires configuring the digital pins, setting the baud rate to 9600, and writing a non-blocking loop with millis(). Would you like to view the wiring diagram or test the firmware sketch in the 3D lab?`
        }
      ]);
    }, 600);
  };

  const handleQuickPrompt = (promptText: string) => {
    setTutorMessages((prev) => [
      ...prev,
      { role: 'user', text: promptText },
      {
        role: 'assistant',
        text: `Here is the code sketch for your Arduino:\n\nconst int trigPin = 9;\nconst int echoPin = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(trigPin, OUTPUT);\n  pinMode(echoPin, INPUT);\n}`
      }
    ]);
  };

  // Component categories
  const categories = ['All', 'Electronics', 'Sensors', 'Motors', 'Microcontrollers', 'Robotics', 'Communication'];

  const componentCards = [
    {
      id: 'arduino-uno',
      name: 'Arduino Uno',
      category: 'Microcontrollers',
      type: 'Microcontroller',
      image: MEDIA.arduinoUno,
      link: '/components/arduino-uno'
    },
    {
      id: 'ultrasonic-sensor',
      name: 'Ultrasonic Sensor',
      category: 'Sensors',
      type: 'Sensor',
      image: MEDIA.sonarRadar,
      link: '/components/ultrasonic-sensor'
    },
    {
      id: 'sg90-servo',
      name: 'Servo Motor',
      category: 'Motors',
      type: 'Actuator',
      image: MEDIA.servo,
      link: '/components/sg90-servo'
    },
    {
      id: 'dc-motor',
      name: 'DC Motor',
      category: 'Motors',
      type: 'Actuator',
      image: MEDIA.rover,
      link: '/components/dc-motor'
    },
    {
      id: 'esp32',
      name: 'ESP32',
      category: 'Microcontrollers',
      type: 'Microcontroller',
      image: MEDIA.esp32,
      link: '/components/esp32'
    },
    {
      id: 'ir-sensor',
      name: 'IR Sensor',
      category: 'Sensors',
      type: 'Sensor',
      image: MEDIA.ledCircuit,
      link: '/components/ir-sensor'
    },
    {
      id: 'l298n',
      name: 'Motor Driver',
      category: 'Electronics',
      type: 'Driver',
      image: MEDIA.l298n,
      link: '/components/l298n'
    },
    {
      id: 'chassis',
      name: 'Robot Chassis',
      category: 'Robotics',
      type: 'Robotics',
      image: MEDIA.rover,
      link: '/projects/proj-obstacle-avoiding-rover'
    }
  ];

  const filteredComponents = componentCards.filter((comp) => {
    const matchesCategory = selectedCategory === 'All' || comp.category === selectedCategory;
    const matchesSearch = comp.name.toLowerCase().includes(componentSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* LEFT PERSISTENT SIDEBAR */}
      <aside className="w-64 shrink-0 hidden xl:flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090e1a] p-4 space-y-6 transition-colors duration-200">
        <div className="space-y-6">
          {/* Nav List */}
          <nav className="space-y-1">
            <Link
              to="/dashboard"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition bg-blue-50 dark:bg-blue-600/15 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-500/30"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <span>Dashboard</span>
              </div>
            </Link>

            <Link
              to="/learn"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400" />
                <span>Learn</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/components"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400" />
                <span>Components</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/programming"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400" />
                <span>Programming</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/ai-tutor"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500" />
                <span>AI Tutor</span>
              </div>
            </Link>

            <Link
              to="/ai-code"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-pink-500" />
                <span>AI Code Generator</span>
              </div>
            </Link>

            <Link
              to="/lab3d"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400" />
                <span>3D Lab</span>
              </div>
            </Link>

            <Link
              to="/challenges"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-amber-500" />
                <span>Challenges</span>
              </div>
            </Link>

            <Link
              to="/projects"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500" />
                <span>Projects</span>
              </div>
            </Link>

            <Link
              to="/achievements"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-amber-500" />
                <span>Achievements</span>
              </div>
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group"
            >
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500" />
                <span>Profile</span>
              </div>
            </Link>

            <button
              onClick={() => alert('Settings: Theme, notifications, and language can be adjusted from the top bar!')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white transition group text-left"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar Widgets */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Progress Radial Widget */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Progress</span>
            <div className="relative w-16 h-16 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 dark:text-cyan-400 stroke-current"
                  strokeDasharray="42, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-slate-900 dark:text-white font-mono">42%</span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">Level 3 - Explorer</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">420 / 1000 XP</p>
          </div>

          {/* Today's Challenge Widget */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Challenge</span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Build a Distance Measuring System</p>
            <Link
              to="/challenges"
              className="block text-center w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              Try Now
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 overflow-hidden">
        {/* TOP WELCOME HERO BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Welcome back, {user?.fullName || 'Krish Kumar'} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Keep learning, keep building. You're doing great! Level up your microcontroller firmware, circuit design, and 3D robotics skills today.
              </p>
            </div>

            {/* Mascot / Robot Avatar */}
            <div className="shrink-0 flex items-center justify-center relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-xl shadow-cyan-500/20 bg-slate-900/60">
                <img
                  src={MEDIA.hero}
                  alt="RoboLearn Robot Assistant"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 7 HORIZONTAL STAT CARDS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Stat 1: Overall Progress */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <Radio className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">42%</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Overall Progress</p>
            </div>
          </div>

          {/* Stat 2: Current Course */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">3</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Current Course</p>
            </div>
          </div>

          {/* Stat 3: Lessons Completed */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">12</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Lessons Completed</p>
            </div>
          </div>

          {/* Stat 4: Challenges Solved */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">5</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Challenges Solved</p>
            </div>
          </div>

          {/* Stat 5: Projects Completed */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <Box className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">2</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Projects Completed</p>
            </div>
          </div>

          {/* Stat 6: XP */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="w-7 h-7 rounded-xl bg-yellow-50 dark:bg-yellow-950/80 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-2">
              <Star className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">420</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">XP Earned</p>
            </div>
          </div>

          {/* Stat 7: Day Streak */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-mono">5</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Day Streak</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
            <Link to="/learn" className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              to="/components"
              className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Learn Components</span>
            </Link>

            <Link
              to="/programming"
              className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Code className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Start Coding</span>
            </Link>

            <Link
              to="/ai-tutor"
              className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Tutor</span>
            </Link>

            <Link
              to="/ai-code"
              className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/40 hover:border-pink-300 dark:hover:border-pink-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-pink-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Code Generator</span>
            </Link>

            <Link
              to="/lab3d"
              className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/40 hover:border-cyan-300 dark:hover:border-cyan-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Open 3D Lab</span>
            </Link>

            <Link
              to="/challenges"
              className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Daily Challenge</span>
            </Link>
          </div>
        </div>

        {/* MIDDLE SECTION: CONTINUE LEARNING, RECOMMENDED, ACHIEVEMENTS, DAILY CHALLENGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Continue Learning */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Continue Learning</h3>
                <Link to="/learn" className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 mb-3 bg-slate-100 dark:bg-slate-950">
                <img
                  src={MEDIA.arduinoUno}
                  alt="Arduino Basics"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Arduino Basics</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2">Lesson 4: Digital Pins</p>

              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full w-[60%]" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono">60%</span>
              </div>
            </div>

            <Link
              to="/learn/course-3-arduino/l4-digital-pins"
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recommended Lessons */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recommended Lessons</h3>
                <Link to="/learn" className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Ultrasonic Sensor</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Sensors • 15 min</p>
                    </div>
                  </div>
                  <Link
                    to="/learn/course-4-sensors/l1-ultrasonic"
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-cyan-300 text-[11px] font-bold transition"
                  >
                    Start
                  </Link>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold font-mono">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Servo Motor</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Motors • 20 min</p>
                    </div>
                  </div>
                  <Link
                    to="/learn/course-5-motors/l1-servo"
                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-300 text-[11px] font-bold transition"
                  >
                    Start
                  </Link>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Loops in C++</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Programming • 25 min</p>
                    </div>
                  </div>
                  <Link
                    to="/programming"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold transition"
                  >
                    Start
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Achievements</h3>
                <Link to="/achievements" className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md mb-1.5 ring-2 ring-amber-300 dark:ring-amber-500/40">
                    🥇
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">First Program</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">+100 XP</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md mb-1.5 ring-2 ring-blue-300 dark:ring-blue-500/40">
                    🎖️
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Component Explorer</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">+200 XP</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-red-500 flex items-center justify-center text-white font-black text-sm shadow-md mb-1.5 ring-2 ring-rose-300 dark:ring-rose-500/40">
                    🏆
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">10 Challenges</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">+500 XP</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md mb-1.5 ring-2 ring-cyan-300 dark:ring-cyan-500/40">
                    🤖
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Robotics Beginner</p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">+300 XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-cyan-400 mb-2">
                <Trophy className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Daily Challenge</h3>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">Build a Smart LED System</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Create an Arduino firmware program to automatically turn on an LED in low ambient light conditions using an LDR sensor.
              </p>
            </div>

            <Link
              to="/challenges"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              Start Challenge <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* COMPONENT LIBRARY SECTION */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Component Library</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Explore authentic hardware sensors, actuators, and controllers with wiring and code.</p>
            </div>
            <Link to="/components" className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={componentSearch}
                onChange={(e) => setComponentSearch(e.target.value)}
                placeholder="Search components..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Component Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
            {filteredComponents.map((comp) => (
              <Link
                key={comp.id}
                to={comp.link}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-500 transition group flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-full h-20 rounded-xl overflow-hidden mb-2 bg-white dark:bg-slate-900 p-1 flex items-center justify-center">
                  <img
                    src={comp.image}
                    alt={comp.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">{comp.name}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{comp.type}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 3D LAB & AI TUTOR SPLIT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: 3D Lab Preview Box (7 Cols) */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">3D Lab Simulator</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Autonomous 4WD Obstacle Avoiding Rover Testbench</p>
                  </div>
                </div>
                <Link to="/lab3d" className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                  Full Lab <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* 3D Viewport Box with Controls */}
              <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                {/* Embedded Three.js Simulator Canvas */}
                <ThreeSimulatorCanvas />

                {/* Active Components List Overlay */}
                <div className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 space-y-1 z-10 pointer-events-none">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Arduino Uno</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Ultrasonic Sensor</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Motor Driver</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> DC Motor</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400"></span> 4x Wheels</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Battery 9V</div>
                </div>

                {/* Bottom Control Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/80 z-10">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsSimRunning(!isSimRunning)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isSimRunning
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isSimRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isSimRunning ? 'Stop' : 'Run'}
                    </button>

                    <button
                      onClick={() => setIsSimRunning(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={simPerspective}
                      onChange={(e) => setSimPerspective(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 outline-none font-medium cursor-pointer"
                    >
                      <option value="Perspective">Perspective</option>
                      <option value="Top">Top View</option>
                      <option value="Front">Front View</option>
                    </select>

                    <button
                      onClick={() => navigate('/lab3d')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Open Full 3D Lab"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Tutor Gemini Box (5 Cols) */}
          <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      AI Tutor <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold">Gemini</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Socratic Hardware & Firmware Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setTutorMessages([])}
                  className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  New Chat
                </button>
              </div>

              {/* Chat Thread */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                {tutorMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Action Prompt Chips */}
              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
                <button
                  onClick={() => handleQuickPrompt('Show me the complete C++ code for Ultrasonic obstacle avoidance.')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-700 text-blue-600 dark:text-cyan-300 text-[11px] font-medium whitespace-nowrap transition"
                >
                  Show Code
                </button>
                <button
                  onClick={() => handleQuickPrompt('How does the ultrasonic sensor trigger pulse work in 3D?')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 border border-purple-200 dark:border-slate-700 text-purple-600 dark:text-purple-300 text-[11px] font-medium whitespace-nowrap transition"
                >
                  Show 3D Demo
                </button>
                <button
                  onClick={() => handleQuickPrompt('Give me a hint for calculating distance with microseconds.')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-300 text-[11px] font-medium whitespace-nowrap transition"
                >
                  Give Hint
                </button>
              </div>
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendTutorMessage} className="mt-3 relative flex items-center">
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask anything..."
                className="w-full pl-3 pr-20 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Attach File"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  title="Voice Prompt"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* BOTTOM ROW: LANGUAGES, LEARNING JOURNEY, RECENT ACTIVITY, UPCOMING PROJECT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Programming Languages */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Programming Languages</h3>
              <Link to="/programming" className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">C</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Embedded</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono">C++</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Arduino</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">Python</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Raspberry Pi</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-black text-rose-600 dark:text-rose-400 font-mono">Java</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Robotics</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-black text-cyan-600 dark:text-cyan-400 font-mono">TypeScript</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">IoT Web</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex items-center justify-center">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">+14 More</p>
              </div>
            </div>
          </div>

          {/* Learning Journey Stepper */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Learning Journey</h3>
            <div className="flex items-center justify-between text-center">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-1 text-[11px] font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Learn</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-1 text-[11px] font-bold">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Explore</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1 text-[11px] font-bold">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Code</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1 text-[11px] font-bold">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Simulate</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700 text-xs">→</span>

              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300">Build</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent Activity</h3>
              <span className="text-[10px] text-slate-400">Live</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-slate-800 dark:text-slate-200">Completed lesson: Digital Pins</span>
                </div>
                <span className="text-[10px] text-slate-400">2h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-800 dark:text-slate-200">Solved challenge: LED Blink</span>
                </div>
                <span className="text-[10px] text-slate-400">5h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-slate-800 dark:text-slate-200">Earned badge: First Program</span>
                </div>
                <span className="text-[10px] text-slate-400">1d ago</span>
              </div>
            </div>
          </div>

          {/* Upcoming Project */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Upcoming Project</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold font-mono">
                  In Progress
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200 dark:border-slate-800">
                  <img
                    src={MEDIA.rover}
                    alt="Obstacle Avoiding Robot"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Obstacle Avoiding Robot</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Level: Intermediate</p>
                </div>
              </div>
            </div>

            <Link
              to="/projects/proj-obstacle-avoiding-rover"
              className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              Continue Project <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
