import React, { useEffect, useState } from 'react';
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
  Bell,
  LayoutDashboard,
  Terminal
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentLanguage, currentMeta, setLanguage, languages, t } = useLanguage();
  const { effectiveTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const primaryLinks = [
    { name: t('nav.learn'), path: '/learn', icon: BookOpen },
    { name: t('nav.components'), path: '/components', icon: Cpu },
    { name: t('nav.lab3d'), path: '/lab3d', icon: Box, highlight: true },
    { name: t('nav.aiCode'), path: '/ai-code', icon: Sparkles },
    { name: t('nav.aiTutor'), path: '/ai-tutor', icon: MessageSquare }
  ];

  const secondaryLinks = [
    { name: t('nav.programming'), path: '/programming', icon: Terminal },
    { name: t('nav.challenges'), path: '/challenges', icon: Code },
    { name: t('nav.projects'), path: '/projects', icon: Trophy },
    { name: t('nav.achievements'), path: '/achievements', icon: Trophy },
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard }
  ];

  useEffect(() => {
    setIsLangOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLangOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/components?q=${encodeURIComponent(query)}`);
  };

  const isDark = effectiveTheme === 'dark';
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#070b14]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 flex items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label={t('brand.name')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1">
              RoboLearn <span className="text-cyan-600 dark:text-cyan-400">AI</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase -mt-1 hidden sm:inline">
              {t('brand.tagline')}
            </span>
          </div>
        </Link>

        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-sm xl:max-w-md mx-2 relative" role="search">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('components.search')}
            aria-label={t('components.search')}
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </form>

        <nav className="hidden xl:flex items-center gap-1" aria-label="Primary navigation">
          {primaryLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  active
                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                    : link.highlight
                    ? 'text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 bg-cyan-100/60 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user && (
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold font-mono" title="Active Daily Streak">
                <Flame className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                {user.streak}d
              </div>
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => { setIsLangOpen(!isLangOpen); setIsUserMenuOpen(false); }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs transition"
              title="Select Language"
              aria-label="Select Language"
              aria-haspopup="listbox"
              aria-expanded={isLangOpen}
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{currentMeta.flag}</span>
              <span className="hidden sm:inline font-medium">{currentMeta.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-56 max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-1.5 z-50" role="listbox" aria-label="Languages">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                  Select Language
                </div>
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang.code}
                    role="option"
                    aria-selected={currentLanguage === lang.code}
                    onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition text-left ${
                      currentLanguage === lang.code
                        ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2"><span>{lang.flag}</span><span>{lang.name}</span></span>
                    <span className="text-[11px] text-slate-400 font-mono">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition shadow-sm hover:border-cyan-500/40"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <Sun className={`w-3.5 h-3.5 ml-1 ${!isDark ? 'text-amber-500' : 'text-slate-500'}`} aria-hidden="true" />
            <span className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${isDark ? 'bg-cyan-500' : 'bg-slate-300'}`} aria-hidden="true">
              <span className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
            <Moon className={`w-3.5 h-3.5 mr-1 ${isDark ? 'text-cyan-300' : 'text-slate-400'}`} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="hidden md:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {user && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" aria-hidden="true" />}
          </button>

          {user ? (
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsLangOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs transition"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.fullName ? user.fullName.charAt(0) : 'K'}
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight pr-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[100px]">{user.fullName || 'User'}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Level {user.level || 1} • {user.experienceLevel || 'Explorer'}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50" role="menu">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-mono text-[9px] font-bold">Level {user.level || 1}</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">{user.xp || 0} XP</span>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" role="menuitem">
                    <User className="w-3.5 h-3.5" aria-hidden="true" /> {t('nav.dashboard')}
                  </Link>
                  <Link to="/achievements" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" role="menuitem">
                    <Trophy className="w-3.5 h-3.5" aria-hidden="true" /> {t('nav.achievements')}
                  </Link>
                  <button type="button" onClick={() => { logout(); setIsUserMenuOpen(false); navigate('/'); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left" role="menuitem">
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link to="/login" className="px-2 sm:px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white">{t('nav.login')}</Link>
              <Link to="/register" className="px-3 sm:px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm">{t('nav.register')}</Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] px-3 sm:px-4 py-3 space-y-1 shadow-lg" aria-label="Mobile navigation">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative mb-2" role="search">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('components.search')}
              aria-label={t('components.search')}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
          </form>

          {[...primaryLinks, ...secondaryLinks].map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-500" aria-hidden="true" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300" aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user ? (
              <button type="button" onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }} className="px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30">
                <LogOut className="w-4 h-4 inline mr-1" aria-hidden="true" />{t('nav.logout')}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};