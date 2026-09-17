import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, CheckCircle2, ArrowRight, Database } from 'lucide-react';
import { catalogEntryToComponent } from '../data/componentCatalog';
import { PDF_COMPONENT_CATALOG } from '../data/pdfComponentCatalog';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { WebComponentImage } from '../components/WebComponentImage';

const CATEGORIES = [
  { id: 'all', label: 'All components' },
  { id: 'microcontrollers', label: 'Controllers' },
  { id: 'computing_boards', label: 'Compute / AI' },
  { id: 'robotics', label: 'Flight / Robotics' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'actuators', label: 'Motors / Servos' },
  { id: 'communication', label: 'Radio / GPS / Video' },
  { id: 'power', label: 'ESC / Power' },
  { id: 'displays', label: 'Displays' },
  { id: 'basic_electronics', label: 'Tools / Prototyping' }
];

export const ComponentsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const components = useMemo(() => {
    const list = PDF_COMPONENT_CATALOG.map(catalogEntryToComponent);
    return list.filter((comp) => {
      const categoryMatch = selectedCategory === 'all' || comp.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'all' || comp.difficulty === selectedDifficulty;
      const q = searchQuery.trim().toLowerCase();
      const textMatch = !q || comp.name.toLowerCase().includes(q) || comp.tagline.toLowerCase().includes(q) || comp.description.toLowerCase().includes(q);
      return categoryMatch && difficultyMatch && textMatch;
    });
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const handleMarkLearned = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    void (async () => {
      try {
        await api.markComponentLearned(id);
        await refreshUser();
      } catch {
        // Keep the card interactive even if persistence is temporarily unavailable.
      }
    })();
  };

  const isLearned = (id: string) => Boolean(user?.learnedComponents?.includes(id));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full transition-colors duration-200">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Cpu className="w-4 h-4" /> PDF Hardware Directory
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 normal-case tracking-normal"><Database className="w-3 h-3" /> {PDF_COMPONENT_CATALOG.length} components</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Robotics & Drone Components</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl">A curated robotics hardware directory with exact-name photo matching and reference sources. Component choices are based on common educational and robotics hardware, including parts listed by Robu.in.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Pixhawk, ESP32, IMU, GPS, BLDC, ESC, LiPo..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-sm" /></div>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-sm"><option value="all">All Difficulties</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">{CATEGORIES.map((cat) => <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${selectedCategory === cat.id ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{cat.label}</button>)}</div>

      <div className="text-xs text-slate-500 dark:text-slate-400 mb-5">Showing {components.length} of {PDF_COMPONENT_CATALOG.length} components</div>

      {components.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><p className="text-slate-500 dark:text-slate-400 text-sm">No components found matching your query.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((comp) => {
            const learned = isLearned(comp.id);
            return (
              <Link key={comp.id} to={`/components/${comp.id}`} className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-500/50 transition group flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden">
                <div>
                  <div className="relative w-full h-44 mb-4 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                    <WebComponentImage id={comp.id} name={comp.name} />
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none"><span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-cyan-400 shadow-sm">{comp.category.replace('_', ' ')}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md bg-slate-900/80 text-white border border-slate-700/50">{comp.difficulty}</span></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition mb-1">{comp.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{comp.tagline}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 mb-4"><div><span className="text-slate-400 dark:text-slate-500">Learning:</span><strong className="text-slate-700 dark:text-slate-300 font-mono text-[10px] truncate block">How it works + quiz</strong></div><div><span className="text-slate-400 dark:text-slate-500">Source:</span><strong className="text-slate-700 dark:text-slate-300 font-mono text-[10px] block">PDF #</strong></div></div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"><button onClick={(e) => handleMarkLearned(e, comp.id)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${learned ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}><CheckCircle2 className={`w-3.5 h-3.5 ${learned ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />{learned ? 'Learned' : '+30 XP'}</button><span className="text-xs font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition">Learn Component <ArrowRight className="w-3.5 h-3.5" /></span></div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
