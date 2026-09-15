import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Cpu,
  BookOpen,
  Code,
  Box,
  MessageSquare,
  Trophy,
  Flame,
  Globe,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Search,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout, quickDemoLogin } = useAuth();
  const { currentLanguage, currentMeta, setLanguage, languages, t } = useLanguage();
  const { effectiveTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { name: t('nav.learn'), path: '/learn', icon: BookOpen },
    { name: t('nav.components'), path: '/components', icon: Cpu },
    { name: t('nav.lab3d'), path: '/lab3d', icon: Box, highlight: true },
    { name: t('nav.aiCode'), path: '/ai-code', icon: Sparkles },
    { name: t('nav.aiTutor'), path: '/ai-tutor', icon: MessageSquare },
    { name: t('nav.challenges'), path: '/challenges', icon: Code },
    { name: t('nav.projects'), path: '/projects', icon: Trophy }
  ];

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/components?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isDark = effectiveTheme === 'dark';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1">
              RoboLearn <span className="text-cyan-600 dark:text-cyan-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase -mt-1 hidden sm:inline">
              Learn • Code • Simulate • Build
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-2 lg:mx-4 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components, lessons, projects, or anything..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
          />
        </form>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                    : link.highlight
                    ? 'text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 bg-cyan-100/60 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak & XP Badge if logged in */}
          {user && (
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <div
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold font-mono"
                title="Active Daily Streak"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                {user.streak}d
              </div>
            </div>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs transition"
              title="Select Language (30 Languages Supported)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs">{currentMeta.flag}</span>
              <span className="hidden sm:inline font-medium">{currentMeta.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  Select Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition text-left ${
                      currentLanguage === lang.code
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Pill Toggle (Sun + Pill Switch + Moon) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition shadow-sm hover:border-cyan-500/40"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            <Sun className={`w-3.5 h-3.5 ml-1 transition-colors ${!isDark ? 'text-amber-500' : 'text-slate-500'}`} />
            <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
              isDark ? 'bg-cyan-500' : 'bg-slate-300'
            }`}>
              <div
                className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  isDark ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <Moon className={`w-3.5 h-3.5 mr-1 transition-colors ${isDark ? 'text-cyan-300' : 'text-slate-400'}`} />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition relative"
              title="3 Unread Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>
          </div>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs transition"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.fullName ? user.fullName.charAt(0) : 'K'}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight pr-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[100px]">
                    {user.fullName || 'Krish Kumar'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Level {user.level || 3} • {user.experienceLevel || 'Explorer'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-mono text-[9px] font-bold">
                        Level {user.level || 3}
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                        {user.xp || 420} XP
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-white"
                  >
                    <User className="w-3.5 h-3.5" /> Dashboard & Stats
                  </Link>
                  <Link
                    to="/achievements"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 dark:hover:text-white"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Achievements
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={quickDemoLogin}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition"
              >
                Demo
              </button>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-white"
              >
                <Icon className="w-4 h-4 text-cyan-500" />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
