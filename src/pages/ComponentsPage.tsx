import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Search, CheckCircle2, ArrowRight, Database } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ElectronicComponent } from '../types/index';
import { WebComponentImage } from '../components/WebComponentImage';

const CATEGORIES = [
  { id: 'all', label: 'All 50' },
  { id: 'microcontrollers', label: 'Controllers' },
  { id: 'computing_boards', label: 'Compute / AI' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'actuators', label: 'Motors / Servos' },
  { id: 'communication', label: 'Telemetry / GPS' },
  { id: 'power', label: 'Drivers / Power' }
];

export const ComponentsPage: React.FC = () => {
  const { user, addXp } = useAuth();
  const [components, setComponents] = useState<ElectronicComponent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getComponents(
          selectedCategory === 'all' ? undefined : selectedCategory,
          selectedDifficulty === 'all' ? undefined : selectedDifficulty,
          searchQuery || undefined
        );
        if (active) setComponents(data);
      } catch (err) {
        console.error('Failed to load components', err);
        if (active) setComponents([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const handleMarkLearned = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.markComponentLearned(id);
      if (res.xpEarned > 0) addXp(res.xpEarned, 'Component Learned');
    } catch (err) {
      console.error(err);
    }
  };

  const isLearned = (id: string) => Boolean(user?.learnedComponents?.includes(id));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto w-full transition-colors duration-200">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Cpu className="w-4 h-4" /> Robotics Hardware Library
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 normal-case tracking-normal"><Database className="w-3 h-3" /> 50 core components</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Drone & Robotics Component Library</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl">A focused set of 50 core parts for autonomous robots, rovers, drones, embedded controllers and AI robotics. Photos use verified local assets when available and web reference images otherwise.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full"><Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ESP32, GPS, IMU, motor, ESC, servo..." className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-sm" /></div>
        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer shadow-sm"><option value="all">All Difficulties</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">{CATEGORIES.map((cat) => <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${selectedCategory === cat.id ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{cat.label}</button>)}</div>

      {!isLoading && <div className="text-xs text-slate-500 dark:text-slate-400 mb-5">Showing {components.length} of 50 core components</div>}

      {isLoading ? (
        <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-2 border-blue-600 dark:border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : components.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><p className="text-slate-500 dark:text-slate-400 text-sm">No components found matching your query.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((comp) => {
            const learned = isLearned(comp.id);
            const voltageSpec = Array.isArray(comp.specifications) ? comp.specifications.find(s => s.key.toLowerCase().includes('voltage'))?.value || 'See datasheet' : 'See datasheet';
            return (
              <Link key={comp.id} to={`/components/${comp.id}`} className="p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-500/50 transition group flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden">
                <div>
                  <div className="relative w-full h-44 mb-4 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                    <WebComponentImage id={comp.id} name={comp.name} />
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none"><span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-cyan-400 shadow-sm">{comp.category.replace('_', ' ')}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md bg-slate-900/80 text-white border border-slate-700/50">{comp.difficulty}</span></div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition mb-1">{comp.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{comp.tagline}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 mb-4"><div><span className="text-slate-400 dark:text-slate-500">Voltage:</span><strong className="text-slate-700 dark:text-slate-300 font-mono text-[10px] truncate block">{voltageSpec}</strong></div><div><span className="text-slate-400 dark:text-slate-500">Pins:</span><strong className="text-slate-700 dark:text-slate-300 font-mono text-[10px] block">{comp.pins?.length || 0} documented</strong></div></div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"><button onClick={(e) => handleMarkLearned(e, comp.id)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${learned ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}><CheckCircle2 className={`w-3.5 h-3.5 ${learned ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />{learned ? 'Learned' : '+30 XP'}</button><span className="text-xs font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition">Explore Specs <ArrowRight className="w-3.5 h-3.5" /></span></div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};