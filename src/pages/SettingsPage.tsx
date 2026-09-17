import React, { useState } from 'react';
import { Save, Moon, Sun, Globe, User, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const { effectiveTheme, setTheme } = useTheme();
  const [name, setName] = useState(user?.fullName || '');
  const [experience, setExperience] = useState(user?.experienceLevel || 'Beginner');
  const [programming, setProgramming] = useState(user?.preferredProgrammingLanguage || 'cpp');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(() => localStorage.getItem('roblearn_notifications') !== 'off');

  if (!user) return null;

  const save = async () => {
    await updateProfile({ fullName: name.trim() || user.fullName, experienceLevel: experience as any, preferredProgrammingLanguage: programming, preferredLanguage: currentLanguage });
    localStorage.setItem('roblearn_notifications', notifications ? 'on' : 'off');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#090e1a] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-500">RoboLearn AI</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your profile, learning preferences and app experience.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#090e1a]">
          <h2 className="flex items-center gap-2 font-black text-slate-900 dark:text-white"><User className="h-5 w-5 text-cyan-500"/> Profile & Learning</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">Full name<input value={name} onChange={e=>setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"/></label>
            <label className="block text-sm font-semibold">Experience<select value={experience} onChange={e=>setExperience(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
            <label className="block text-sm font-semibold">Programming language<select value={programming} onChange={e=>setProgramming(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"><option value="cpp">C++</option><option value="c">C</option><option value="python">Python</option><option value="javascript">JavaScript</option></select></label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#090e1a]">
          <h2 className="flex items-center gap-2 font-black text-slate-900 dark:text-white"><Globe className="h-5 w-5 text-cyan-500"/> Language</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">{languages.map(lang=><button key={lang.code} onClick={()=>setLanguage(lang.code)} className={`rounded-xl border p-3 text-left text-sm ${currentLanguage===lang.code?'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40':'border-slate-200 dark:border-slate-700'}`}><span className="mr-2">{lang.flag}</span>{lang.name}</button>)}</div>
          <h2 className="mt-7 flex items-center gap-2 font-black text-slate-900 dark:text-white"><Sun className="h-5 w-5 text-amber-500"/> Theme</h2>
          <div className="mt-3 flex gap-2"><button onClick={()=>setTheme('light')} className={`flex-1 rounded-xl border p-3 ${effectiveTheme==='light'?'border-cyan-500 bg-cyan-50':'border-slate-200 dark:border-slate-700'}`}>Light</button><button onClick={()=>setTheme('dark')} className={`flex-1 rounded-xl border p-3 ${effectiveTheme==='dark'?'border-cyan-500 bg-cyan-950/40':'border-slate-200 dark:border-slate-700'}`}><Moon className="mx-auto h-4 w-4"/></button></div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#090e1a] md:col-span-2">
          <h2 className="flex items-center gap-2 font-black text-slate-900 dark:text-white"><Bell className="h-5 w-5 text-amber-500"/> Notifications</h2>
          <label className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><span><span className="block font-bold">Learning notifications</span><span className="text-xs text-slate-500">Keep reminders and achievement alerts enabled.</span></span><input type="checkbox" checked={notifications} onChange={e=>setNotifications(e.target.checked)} className="h-5 w-5"/></label>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600"><ShieldCheck className="h-4 w-4"/> Account preferences are stored for your signed-in session.</div>
        </section>
      </div>
      <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-black text-slate-950 hover:bg-cyan-400"><Save className="h-4 w-4"/>{saved?'Saved ✓':'Save changes'}</button>
    </div>
  </div>