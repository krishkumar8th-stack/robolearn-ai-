import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SimulationProvider } from './contexts/SimulationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Lab3DWorkbench } from './components/lab/Lab3DWorkbench';
import { AICodeGeneratorPage } from './pages/AICodeGeneratorPage';
import { AITutorPage } from './pages/AITutorPage';
import { ComponentsPage } from './pages/ComponentsPage';
import { ComponentDetailPage } from './pages/ComponentDetailPage';
import { RoboticsPage } from './pages/RoboticsPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { ProgrammingPage } from './pages/ProgrammingPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';

const RootRoute: React.FC = () => {
  const { user } = useAuth();
  return user ? <DashboardPage /> : <LandingPage />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <SimulationProvider>
              <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500/20 selection:text-cyan-700 transition-colors duration-200 dark:bg-[#070b14] dark:text-slate-100 dark:selection:text-cyan-300">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<RootRoute />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/lab3d" element={<Lab3DWorkbench />} />
                    <Route path="/ai-code" element={<AICodeGeneratorPage />} />
                    <Route path="/ai-tutor" element={<AITutorPage />} />
                    <Route path="/components" element={<ComponentsPage />} />
                    <Route path="/components/:id" element={<ComponentDetailPage />} />
                    <Route path="/learn" element={<RoboticsPage />} />
                    <Route path="/learn/:courseId/:lessonId" element={<LessonDetailPage />} />
                    <Route path="/programming" element={<ProgrammingPage />} />
                    <Route path="/challenges" element={<ChallengesPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
                <Footer />
              </div>
              <Analytics />
            </SimulationProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
