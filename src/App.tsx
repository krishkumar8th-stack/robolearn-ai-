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
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const Lab3DWorkbench = lazy(() => import('./components/lab/Lab3DWorkbench').then(m => ({ default: m.Lab3DWorkbench })));
const AICodeGeneratorPage = lazy(() => import('./pages/AICodeGeneratorPage').then(m => ({ default: m.AICodeGeneratorPage })));
const AITutorPage = lazy(() => import('./pages/AITutorPage').then(m => ({ default: m.AITutorPage })));
const ComponentsPage = lazy(() => import('./pages/ComponentsPage').then(m => ({ default: m.ComponentsPage })));
const ComponentDetailLearningPage = lazy(() => import('./pages/ComponentDetailLearningPage').then(m => ({ default: m.ComponentDetailLearningPage })));
const RoboticsPage = lazy(() => import('./pages/RoboticsPage').then(m => ({ default: m.RoboticsPage })));
const LessonDetailPage = lazy(() => import('./pages/LessonDetailPage').then(m => ({ default: m.LessonDetailPage })));
const ProgrammingPage = lazy(() => import('./pages/ProgrammingPage').then(m => ({ default: m.ProgrammingPage })));
const ChallengesPage = lazy(() => import('./pages/ChallengesPage').then(m => ({ default: m.ChallengesPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage').then(m => ({ default: m.UserDashboardPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));

const RouteLoader = () => <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-label="Loading page"><div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-500" /></div>;
const RootRoute: React.FC = () => { const { user, isLoading } = useAuth(); if (isLoading) return <RouteLoader />; return user ? <Navigate to="/dashboard" replace /> : <LandingPage />; };
const Protected: React.FC<{ children: React.ReactElement }> = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return <BrowserRouter><AuthProvider><ThemeProvider><LanguageProvider><SimulationProvider><AppErrorBoundary><div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-700 dark:selection:text-cyan-300"><Navbar /><main className="flex-1"><Suspense fallback={<RouteLoader />}><Routes>
    <Route path="/" element={<RootRoute />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/lab3d" element={<Protected><Lab3DWorkbench /></Protected>} />
    <Route path="/ai-code" element={<Protected><AICodeGeneratorPage /></Protected>} />
    <Route path="/ai-tutor" element={<Protected><AITutorPage /></Protected>} />
    <Route path="/components" element={<Protected><ComponentsPage /></Protected>} />
    <Route path="/components/:id" element={<Protected><ComponentDetailLearningPage /></Protected>} />
    <Route path="/learn" element={<Protected><RoboticsPage /></Protected>} />
    <Route path="/learn/:courseId/:lessonId" element={<Protected><LessonDetailPage /></Protected>} />
    <Route path="/programming" element={<Protected><ProgrammingPage /></Protected>} />
    <Route path="/challenges" element={<Protected><ChallengesPage /></Protected>} />
    <Route path="/projects" element={<Protected><ProjectsPage /></Protected>} />
    <Route path="/dashboard" element={<Protected><UserDashboardPage /></Protected>} />
    <Route path="/achievements" element={<Protected><AchievementsPage /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></main><Footer /></div></AppErrorBoundary><Analytics /></SimulationProvider></LanguageProvider></ThemeProvider></AuthProvider></BrowserRouter>;
}
