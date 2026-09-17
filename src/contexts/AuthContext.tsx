import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { User } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  addXp: (amount: number, reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = 'roblearn_token';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

function validateAuthResponse(response: { token?: unknown; user?: unknown }) {
  if (!response || typeof response.token !== 'string' || !response.token.trim()) {
    throw new Error('Login succeeded on the server, but no valid session token was returned. Please try again.');
  }
  if (!response.user || typeof response.user !== 'object') {
    throw new Error('Login succeeded, but the server returned an invalid user response.');
  }
}

function syncDashboardStats(user: User | null) {
  if (typeof document === 'undefined' || !user || window.location.pathname !== '/dashboard') return;

  const root = document.querySelector('main');
  if (!root) return;

  const completedLessons = user.completedLessons?.length || 0;
  const completedChallenges = user.completedChallenges?.length || 0;
  const completedProjects = user.completedProjects?.length || 0;
  const learnedComponents = user.learnedComponents?.length || 0;
  const xp = Math.max(0, user.xp || 0);
  const level = Math.max(1, user.level || Math.floor(xp / 200) + 1);
  const streak = Math.max(0, user.streak || 0);
  const overallProgress = Math.min(100, Math.round((completedLessons / 50) * 100));
  const activeCourses = completedLessons > 0 ? 1 : 0;
  const progressNodes = Array.from(root.querySelectorAll('p'));

  const setStat = (label: string, value: string) => {
    const labelNode = progressNodes.find(node => node.textContent?.trim() === label);
    const valueNode = labelNode?.previousElementSibling as HTMLElement | null;
    if (valueNode && valueNode.textContent !== value) valueNode.textContent = value;
  };

  setStat('Overall Progress', `${overallProgress}%`);
  setStat('Current Course', String(activeCourses));
  setStat('Lessons Completed', String(completedLessons));
  setStat('Challenges Solved', String(completedChallenges));
  setStat('Projects Completed', String(completedProjects));
  setStat('XP Earned', String(xp));
  setStat('Day Streak', String(streak));

  const sidebarProgress = progressNodes.find(node => node.textContent?.trim() === 'Your Progress')?.parentElement;
  if (sidebarProgress) {
    const percentNode = Array.from(sidebarProgress.querySelectorAll('span')).find(node => /^\d+%$/.test(node.textContent?.trim() || ''));
    if (percentNode && percentNode.textContent !== `${overallProgress}%`) percentNode.textContent = `${overallProgress}%`;

    const levelNode = Array.from(sidebarProgress.querySelectorAll('p')).find(node => /^Level \d+ - /.test(node.textContent?.trim() || ''));
    const levelName = level >= 5 ? 'Builder' : level >= 3 ? 'Explorer' : 'Beginner';
    if (levelNode) levelNode.textContent = `Level ${level} - ${levelName}`;

    const xpNode = Array.from(sidebarProgress.querySelectorAll('p')).find(node => /XP$/.test(node.textContent?.trim() || ''));
    if (xpNode) xpNode.textContent = `${xp} XP`;

    const progressPath = sidebarProgress.querySelector('path[stroke-dasharray]') as SVGPathElement | null;
    if (progressPath) progressPath.setAttribute('stroke-dasharray', `${overallProgress}, 100`);
  }

  root.setAttribute('data-user-id', user.id);
  root.setAttribute('data-learned-components', String(learnedComponents));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.getMe();
      if (!res?.user) throw new Error('Invalid session response.');
      setUser(res.user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;
    syncDashboardStats(user);

    if (window.location.pathname !== '/dashboard') return;

    let scheduled = false;
    const observer = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        syncDashboardStats(user);
      });
    });

    const root = document.querySelector('main');
    if (root) observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [user]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email.trim(), pass);
      validateAuthResponse(res);
      localStorage.setItem(TOKEN_KEY, res.token as string);
      setUser(res.user as User);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      validateAuthResponse(res);
      localStorage.setItem(TOKEN_KEY, res.token as string);
      setUser(res.user as User);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    if (!res?.user) throw new Error('Profile update returned an invalid response.');
    setUser(res.user);
  };

  const addXp = (amount: number, reason?: string) => {
    if (!user || !Number.isFinite(amount) || amount <= 0) return;
    const oldLevel = user.level;
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 200) + 1;

    setUser(prev => prev ? { ...prev, xp: newXp, level: newLevel } : null);
    void api.updateProfile({ xp: newXp, level: newLevel }).then((res) => {
      if (res?.user) setUser(res.user);
    }).catch(() => {
      // The next authenticated refresh will restore the server value if this write fails.
    });

    if (newLevel > oldLevel) {
      try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch { /* visual only */ }
    }
    void reason;
  };

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, refreshUser, addXp }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
