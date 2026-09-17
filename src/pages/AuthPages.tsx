import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bot, Lock, Mail, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectAfterAuth = () => {
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from !== '/login' && from !== '/register' ? from : '/dashboard', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    try {
      await login(email.trim(), password);
      redirectAfterAuth();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-slate-50 p-4 text-slate-900 dark:bg-[#070b14] dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-500">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black">Welcome Back</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Sign in with your RoboLearn AI account</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-11 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading || !email.trim() || !password} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">Don't have an account? <Link to="/register" className="font-bold text-cyan-500 hover:underline">Create one</Link></p>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    try {
      await register({ username: username.trim(), email: email.trim(), password, fullName: fullName.trim(), experienceLevel, preferredProgrammingLanguage: 'cpp' });
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-slate-50 p-4 text-slate-900 dark:bg-[#070b14] dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-6 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-500"><Bot className="h-6 w-6" /></div><h2 className="text-2xl font-black">Create Maker Account</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Create a real RoboLearn AI account</p></div>
        {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-500 dark:text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950" />
          <input required minLength={3} pattern="[A-Za-z0-9_]+" autoComplete="username" value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, '_'))} placeholder="Username" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950" />
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950" />
          <div className="relative"><input type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-11 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400" aria-label="Toggle password visibility">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as typeof experienceLevel)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
          <button type="submit" disabled={isLoading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-sm font-bold text-slate-950 disabled:opacity-50">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : 'Create Account'}</button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">Already have an account? <Link to="/login" className="font-bold text-cyan-500 hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
};
