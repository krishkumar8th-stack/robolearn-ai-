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
  quickDemoLogin: () => Promise<void>;
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

  const quickDemoLogin = async () => {
    await login('maker@roblearn.ai', 'maker123');
  };

  const addXp = (amount: number, reason?: string) => {
    if (!user || !Number.isFinite(amount) || amount <= 0) return;
    const oldLevel = user.level;
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 200) + 1;
    setUser(prev => prev ? { ...prev, xp: newXp, level: newLevel } : null);
    if (newLevel > oldLevel) {
      try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch { /* visual only */ }
    }
    void reason;
  };

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile, quickDemoLogin, refreshUser, addXp }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
