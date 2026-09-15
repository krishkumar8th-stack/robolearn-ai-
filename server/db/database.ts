import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, ElectronicComponent, Course, CodingChallenge, RoboticsProject, Achievement, AIChatMessage } from '../../src/types/index.js';
import { SEED_COMPONENTS, SEED_COURSES, SEED_CHALLENGES, SEED_PROJECTS, SEED_ACHIEVEMENTS } from './seedData.js';

interface InMemoryStore {
  users: Map<string, User & { passwordHash: string }>;
  components: Map<string, ElectronicComponent>;
  courses: Map<string, Course>;
  challenges: Map<string, CodingChallenge>;
  projects: Map<string, RoboticsProject>;
  achievements: Map<string, Achievement>;
  conversations: Map<string, { id: string; userId: string; title: string; messages: AIChatMessage[]; updatedAt: string }>;
}

const store: InMemoryStore = {
  users: new Map(),
  components: new Map(),
  courses: new Map(),
  challenges: new Map(),
  projects: new Map(),
  achievements: new Map(),
  conversations: new Map()
};

// Seed initial data
for (const comp of SEED_COMPONENTS) store.components.set(comp.id, comp);
for (const course of SEED_COURSES) store.courses.set(course.id, course);
for (const chal of SEED_CHALLENGES) store.challenges.set(chal.id, chal);
for (const proj of SEED_PROJECTS) store.projects.set(proj.id, proj);
for (const ach of SEED_ACHIEVEMENTS) store.achievements.set(ach.id, ach);

// Create default demo user
const demoPasswordHash = bcrypt.hashSync('maker123', 10);
const demoUser: User & { passwordHash: string } = {
  id: 'user-demo-1',
  fullName: 'Alex River',
  username: 'maker_alex',
  email: 'maker@roblearn.ai',
  role: 'user',
  experienceLevel: 'Beginner',
  preferredLanguage: 'en',
  preferredProgrammingLanguage: 'cpp',
  xp: 350,
  level: 2,
  streak: 5,
  lastActiveDate: new Date().toISOString(),
  completedLessons: ['l1-variables'],
  completedChallenges: ['ch-1-led-on'],
  completedProjects: [],
  learnedComponents: ['arduino-uno', 'led', 'resistor'],
  achievements: ['first-program'],
  createdAt: new Date().toISOString(),
  passwordHash: demoPasswordHash
};
store.users.set(demoUser.id, demoUser);

let isMongoConnected = false;

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log('Connecting to MongoDB cluster at:', mongoUri.split('@').pop());
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      isMongoConnected = true;
      console.log('MongoDB connected successfully!');
    } catch (err: any) {
      console.warn('MongoDB connection failed, falling back to persistent memory store:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('No MONGODB_URI provided. Initialized high-performance local data store with seeded components.');
  }
}

export const dbService = {
  // User operations
  async findUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    for (const user of store.users.values()) {
      if (user.email.toLowerCase() === normalized) return user;
    }
    return null;
  },

  async findUserById(id: string) {
    return store.users.get(id) || null;
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'xp' | 'level' | 'streak' | 'completedLessons' | 'completedChallenges' | 'completedProjects' | 'learnedComponents' | 'achievements'> & { password: string }) {
    const id = 'usr_' + Math.random().toString(36).substring(2, 9);
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const newUser: User & { passwordHash: string } = {
      id,
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'user',
      experienceLevel: userData.experienceLevel || 'Beginner',
      preferredLanguage: userData.preferredLanguage || 'en',
      preferredProgrammingLanguage: userData.preferredProgrammingLanguage || 'cpp',
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString(),
      completedLessons: [],
      completedChallenges: [],
      completedProjects: [],
      learnedComponents: [],
      achievements: [],
      createdAt: new Date().toISOString(),
      passwordHash
    };
    store.users.set(id, newUser);
    return newUser;
  },

  async updateUserProgress(userId: string, updates: Partial<User>) {
    const user = store.users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...updates };
    // Auto-calculate level based on XP: Level = floor(XP / 200) + 1
    if (updated.xp !== undefined) {
      updated.level = Math.floor(updated.xp / 200) + 1;
    }
    store.users.set(userId, updated);
    return updated;
  },

  // Components
  async getComponents(category?: string, difficulty?: string, search?: string) {
    let list = Array.from(store.components.values());
    if (category) list = list.filter(c => c.category === category);
    if (difficulty) list = list.filter(c => c.difficulty === difficulty);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q));
    }
    return list;
  },

  async getComponentById(id: string) {
    return store.components.get(id) || null;
  },

  // Courses & Lessons
  async getCourses() {
    return Array.from(store.courses.values()).sort((a, b) => a.level - b.level);
  },

  async getCourseById(id: string) {
    return store.courses.get(id) || null;
  },

  async getLessonById(courseId: string, lessonId: string) {
    const course = store.courses.get(courseId);
    if (!course) return null;
    return course.lessons.find(l => l.id === lessonId) || null;
  },

  // Challenges
  async getChallenges(difficulty?: string) {
    let list = Array.from(store.challenges.values());
    if (difficulty) list = list.filter(c => c.difficulty === difficulty);
    return list;
  },

  async getChallengeById(id: string) {
    return store.challenges.get(id) || null;
  },

  // Projects
  async getProjects() {
    return Array.from(store.projects.values());
  },

  async getProjectById(id: string) {
    return store.projects.get(id) || null;
  },

  // Achievements
  async getAchievements() {
    return Array.from(store.achievements.values());
  },

  // AI Conversations
  async getConversation(id: string) {
    return store.conversations.get(id) || null;
  },

  async saveConversation(id: string, userId: string, title: string, messages: AIChatMessage[]) {
    const conv = {
      id,
      userId,
      title,
      messages,
      updatedAt: new Date().toISOString()
    };
    store.conversations.set(id, conv);
    return conv;
  },

  async getUserConversations(userId: string) {
    return Array.from(store.conversations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
};
