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

const defaultDemoUser: User = {
  id: 'krish-kumar',
  username: 'krishkumar',
  fullName: 'Krish Kumar',
  email: 'kumarkrish88231@gmail.com',
  role: 'user',
  experienceLevel: 'Intermediate',
  preferredLanguage: 'en',
  preferredProgrammingLanguage: 'cpp',
  xp: 420,
  level: 3,
  streak: 5,
  lastActiveDate: new Date().toISOString(),
  completedLessons: ['intro-robotics', 'digital-pins', 'pwm-led', 'sonar-reading'],
  completedChallenges: ['chal-blink-sos', 'chal-reverse-sonar'],
  completedProjects: ['proj-smart-led', 'proj-rover'],
  learnedComponents: ['arduino-uno', 'ultrasonic-sensor', 'sg90-servo', 'dc-motor', 'esp32-devkit', 'ir-sensor'],
  achievements: ['First Program', 'Component Explorer', '10 Challenges', 'Robotics Beginner'],
  createdAt: new Date().toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultDemoUser);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch {
      setUser(defaultDemoUser);
      localStorage.removeItem('roblearn_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('roblearn_token');
    if (token) {
      refreshUser();
    } else {
      setUser(defaultDemoUser);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    localStorage.setItem('roblearn_token', res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('roblearn_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('roblearn_token');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const quickDemoLogin = async () => {
    await login('maker@roblearn.ai', 'maker123');
  };

  const addXp = (amount: number, reason?: string) => {
    if (!user) return;
    const oldLevel = user.level;
    const newXp = user.xp + amount;
    const newLevel = Math.floor(newXp / 200) + 1;

    setUser(prev => prev ? { ...prev, xp: newXp, level: newLevel } : null);

    if (newLevel > oldLevel) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe canvas fallback
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        quickDemoLogin,
        refreshUser,
        addXp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
