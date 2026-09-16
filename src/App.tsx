import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Lab3DWorkbench = lazy(() => import('./components/lab/Lab3DWorkbench').then(m => ({ default: m.Lab3DWorkbench })));
const AICodeGeneratorPage = lazy(() => import('./pages/AICodeGeneratorPage').then(m => ({ default: m.AICodeGeneratorPage })));
const AITutorPage = lazy(() => import('./pages/AITutorPage').then(m => ({ default: m.AITutorPage })));
const ComponentsPage = lazy(() => import('./pages/ComponentsPage').then(m => ({ default: m.ComponentsPage })));
const ComponentDetailPage = lazy(() => import('./pages/ComponentDetailPage').then(m => ({ default: m.ComponentDetailPage })));
const RoboticsPage = lazy(() => import('./pages/RoboticsPage').then(m => ({ default: m.RoboticsPage })));
const LessonDetailPage = lazy(() => import('./pages/LessonDetailPage').then(m => ({ default: m.LessonDetailPage })));
const ProgrammingPage = lazy(() => import('./pages/ProgrammingPage').then(m => ({ default: m.ProgrammingPage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then(m => ({ default: m.ChallengesPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const LoginPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));

const RouteLoader = () => <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-label="Loading page"><div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500" /></div>;
const RootRoute: React.FC = () => { const { user } = useAuth(); return user ? <DashboardPage /> : <LandingPage />; };

export default function App() {
  return <BrowserRouter><AuthProvider><ThemeProvider><LanguageProvider><SimulationProvider><AppErrorBoundary><div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-700 dark:selection:text-cyan-300"><Navbar /><main className="flex-1"><Suspense fallback={<RouteLoader />}><Routes>
    <Route path="/" element={<RootRoute />} /><Route path="/landing" element={<LandingPage />} /><Route path="/lab3d" element={<Lab3DWorkbench />} /><Route path="/ai-code" element={<AICodeGeneratorPage />} /><Route path="/ai-tutor" element={<AITutorPage />} /><Route path="/components" element={<ComponentsPage />} /><Route path="/components/:id" element={<ComponentDetailPage />} /><Route path="/learn" element={<RoboticsPage />} /><Route path="/learn/:courseId/:lessonId" element={<LessonDetailPage />} /><Route path="/programming" element={<ProgrammingPage />} /><Route path="/challenges" element={<ChallengesPage />} /><Route path="/projects" element={<ProjectsPage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/achievements" element={<AchievementsPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></main><Footer /></div></AppErrorBoundary><Analytics /></SimulationProvider></LanguageProvider></ThemeProvider></AuthProvider></BrowserRouter>;
}
