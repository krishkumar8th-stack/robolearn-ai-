import {
  User,
  ElectronicComponent,
  Course,
  CourseLesson,
  CodingChallenge,
  RoboticsProject,
  Achievement,
  AICodeGenerationResult,
  AIDebugResult,
  AIChatMessage,
  SimulationAction
} from '../types/index';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('roblearn_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Components
  async getComponents(category?: string, difficulty?: string, search?: string): Promise<ElectronicComponent[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/components?${params.toString()}`);
    return res.json();
  },

  async getComponentById(id: string): Promise<ElectronicComponent> {
    const res = await fetch(`${API_BASE}/components/${id}`);
    if (!res.ok) throw new Error('Component not found');
    return res.json();
  },

  async markComponentLearned(id: string): Promise<{ success: boolean; xpEarned: number; user: User }> {
    const res = await fetch(`${API_BASE}/components/${id}/learn`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch(`${API_BASE}/courses`);
    return res.json();
  },

  async getCourseById(id: string): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses/${id}`);
    return res.json();
  },

  async getLesson(courseId: string, lessonId: string): Promise<CourseLesson> {
    const res = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}`);
    return res.json();
  },

  async completeLesson(lessonId: string): Promise<{ success: boolean; xpEarned: number; user: User }> {
    const res = await fetch(`${API_BASE}/progress/complete-lesson`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ lessonId })
    });
    return res.json();
  },

  // Challenges
  async getChallenges(difficulty?: string): Promise<CodingChallenge[]> {
    const res = await fetch(`${API_BASE}/challenges${difficulty ? `?difficulty=${difficulty}` : ''}`);
    return res.json();
  },

  async getChallengeById(id: string): Promise<CodingChallenge> {
    const res = await fetch(`${API_BASE}/challenges/${id}`);
    return res.json();
  },

  async submitChallenge(id: string, code: string): Promise<any> {
    const res = await fetch(`${API_BASE}/challenges/${id}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    });
    return res.json();
  },

  // Projects
  async getProjects(): Promise<RoboticsProject[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async getProjectById(id: string): Promise<RoboticsProject> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    return res.json();
  },

  async completeProject(id: string): Promise<{ success: boolean; xpEarned: number; user: User }> {
    const res = await fetch(`${API_BASE}/projects/${id}/complete`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const res = await fetch(`${API_BASE}/achievements`);
    return res.json();
  },

  // AI Service Calls
  async aiCheckHealth(): Promise<{ status: string; hasKey: boolean; model: string }> {
    const res = await fetch(`${API_BASE}/ai/health`);
    return res.json();
  },

  async aiTutor(message: string, history?: AIChatMessage[], context?: any): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/ai/tutor`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history, context })
    });
    if (!res.ok) throw new Error('AI Tutor service unavailable');
    return res.json();
  },

  async aiGenerateCode(prompt: string, targetBoard = 'Arduino Uno', language = 'cpp'): Promise<AICodeGenerationResult> {
    const res = await fetch(`${API_BASE}/ai/generate-code`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, targetBoard, language })
    });
    if (!res.ok) throw new Error('AI Code Generation failed');
    return res.json();
  },

  async aiExplainCode(code: string, language = 'cpp'): Promise<{ summary: string; lineByLine: { line: number; explanation: string }[]; concepts: string[] }> {
    const res = await fetch(`${API_BASE}/ai/explain-code`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, language })
    });
    return res.json();
  },

  async aiDebugCode(code: string, language = 'cpp', errorMessage?: string, hardwareContext?: string): Promise<AIDebugResult> {
    const res = await fetch(`${API_BASE}/ai/debug-code`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, language, errorMessage, hardwareContext })
    });
    return res.json();
  },

  async aiExplainComponent(componentId: string, userQuestion?: string): Promise<{ explanation: string }> {
    const res = await fetch(`${API_BASE}/ai/explain-component`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ componentId, userQuestion })
    });
    return res.json();
  },

  async aiHint(challengeTitle: string, problem: string, currentCode: string, hintLevel = 1): Promise<{ hint: string }> {
    const res = await fetch(`${API_BASE}/ai/hint`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ challengeTitle, problem, currentCode, hintLevel })
    });
    return res.json();
  },

  // Code Simulation interpretation
  async interpretCode(code: string, language = 'cpp'): Promise<{ success: boolean; supported: boolean; message: string; actions: SimulationAction[]; logs: string[] }> {
    const res = await fetch(`${API_BASE}/simulation/interpret`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, language })
    });
    return res.json();
  }
};
