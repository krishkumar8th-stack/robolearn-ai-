import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface State { hasError: boolean; message?: string }

export interface AppErrorBoundaryProps { children?: React.ReactNode }

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, State> {
  readonly props!: AppErrorBoundaryProps;
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : undefined };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.error('RoboLearn UI error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-6">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 text-center shadow-xl">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">The page hit an unexpected error. Your saved account data is unchanged.</p>
          {this.state.message && import.meta.env.DEV && <pre className="mt-4 max-h-24 overflow-auto rounded-lg bg-slate-100 dark:bg-slate-950 p-3 text-left text-xs">{this.state.message}</pre>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reload
            </button>
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <Home className="h-4 w-4" aria-hidden="true" /> Home
            </Link>
          </div>
        </section>
      </main>
    );
  }
}
