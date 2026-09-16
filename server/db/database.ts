import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, ElectronicComponent, Course, CodingChallenge, RoboticsProject, Achievement, AIChatMessage } from '../../src/types/index.js';
import { SEED_COMPONENTS, SEED_COURSES, SEED_CHALLENGES, SEED_PROJECTS, SEED_ACHIEVEMENTS } from './seedData.js';
import { COMPONENT_CATALOG, catalogEntryToComponent } from '../../src/data/componentCatalog.js';

interface InMemoryStore {
  users: Map<string, User & { passwordHash: string }>;
  components: Map<string, ElectronicComponent>;
  courses: Map<string, Course>;
  challenges: Map<string, CodingChallenge>;
  projects: Map<string, RoboticsProject>;
  achievements: Map<string, Achievement>;
  conversations: Map<string, { id: string; userId: string; title: string; messages: AIChatMessage[]; updatedAt: string }>;
}

type StoredUser = User & { passwordHash: string };

const store: InMemoryStore = {
  users: new Map(),
  components: new Map(),
  courses: new Map(),
  challenges: new Map(),
  projects: new Map(),
  achievements: new Map(),
  conversations: new Map()
};

for (const comp of SEED_COMPONENTS) store.components.set(comp.id, comp);
for (const entry of COMPONENT_CATALOG) {
  if (!store.components.has(entry.id)) store.components.set(entry.id, catalogEntryToComponent(entry));
}
for (const course of SEED_COURSES) store.courses.set(course.id, course);
for (const chal of SEED_CHALLENGES) store.challenges.set(chal.id, chal);
for (const proj of SEED_PROJECTS) store.projects.set(proj.id, proj);
for (const ach of SEED_ACHIEVEMENTS) store.achievements.set(ach.id, ach);

const demoPasswordHash = bcrypt.hashSync('maker123', 10);
const demoUser: StoredUser = {
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

function usersCollection() {
  return mongoose.connection.db?.collection<StoredUser>('roblearn_users');
}

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      isMongoConnected = true;
      const collection = usersCollection();
      if (collection) {
        await collection.createIndex({ email: 1 }, { unique: true });
        await collection.updateOne({ _id: demoUser.id }, { $setOnInsert: { ...demoUser, _id: demoUser.id } }, { upsert: true });
      }
      console.log('MongoDB connected successfully; user data persistence enabled.');
    } catch (err: any) {
      isMongoConnected = false;
      console.warn('MongoDB connection failed; using in-memory fallback:', err.message);
    }
  } else {
    console.log(`No MONGODB_URI provided. Initialized local data store with ${store.components.size} component records.`);
  }
}

async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();
  if (isMongoConnected) {
    const found = await usersCollection()?.findOne({ email: normalized });
    if (found) return { ...found, id: found.id || String((found as any)._id) } as StoredUser;
    return null;
  }
  for (const user of store.users.values()) if (user.email.toLowerCase() === normalized) return user;
  return null;
}

async function findUserById(id: string): Promise<StoredUser | null> {
  if (isMongoConnected) {
    const found = await usersCollection()?.findOne({ _id: id });
    return found ? ({ ...found, id: found.id || id } as StoredUser) : null;
  }
  return store.users.get(id) || null;
}

async function saveUser(user: StoredUser): Promise<StoredUser> {
  if (isMongoConnected) {
    const collection = usersCollection();
    if (!collection) throw new Error('MongoDB is connected but its database handle is unavailable.');
    await collection.replaceOne({ _id: user.id }, { ...user, _id: user.id }, { upsert: true });
    return user;
  }
  store.users.set(user.id, user);
  return user;
}

export const dbService = {
  async findUserByEmail(email: string) { return findUserByEmail(email); },
  async findUserById(id: string) { return findUserById(id); },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'xp' | 'level' | 'streak' | 'completedLessons' | 'completedChallenges' | 'completedProjects' | 'learnedComponents' | 'achievements'> & { password: string }) {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) throw new Error('An account with this email address already exists.');

    const id = 'usr_' + Math.random().toString(36).substring(2, 10);
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const newUser: StoredUser = {
      id,
      fullName: userData.fullName.trim(),
      username: userData.username.trim(),
      email: normalizedEmail,
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
    return saveUser(newUser);
  },

  async updateUserProgress(userId: string, updates: Partial<User>) {
    const user = await findUserById(userId);
    if (!user) return null;
    const updated: StoredUser = { ...user, ...updates };
    if (updated.xp !== undefined) updated.level = Math.floor(updated.xp / 200) + 1;
    updated.lastActiveDate = new Date().toISOString();
    return saveUser(updated);
  },

  async getComponents(category?: string, difficulty?: string, search?: string) {
    let list = Array.from(store.components.values());
    if (category) list = list.filter(c => c.category === category);
    if (difficulty) list = list.filter(c => c.difficulty === difficulty);
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q));
    }
    return list;
  },
  async getComponentById(id: string) { return store.components.get(id) || null; },
  async getCourses() { return Array.from(store.courses.values()).sort((a, b) => a.level - b.level); },
  async getCourseById(id: string) { return store.courses.get(id) || null; },
  async getLessonById(courseId: string, lessonId: string) {
    const course = store.courses.get(courseId);
    return course?.lessons.find(l => l.id === lessonId) || null;
  },
  async getChallenges(difficulty?: string) {
    let list = Array.from(store.challenges.values());
    if (difficulty) list = list.filter(c => c.difficulty === difficulty);
    return list;
  },
  async getChallengeById(id: string) { return store.challenges.get(id) || null; },
  async getProjects() { return Array.from(store.projects.values()); },
  async getProjectById(id: string) { return store.projects.get(id) || null; },
  async getAchievements() { return Array.from(store.achievements.values()); },
  async getConversation(id: string) { return store.conversations.get(id) || null; },
  async saveConversation(id: string, userId: string, title: string, messages: AIChatMessage[]) {
    const conv = { id, userId, title, messages, updatedAt: new Date().toISOString() };
    store.conversations.set(id, conv);
    return conv;
  },
  async getUserConversations(userId: string) {
    return Array.from(store.conversations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
};
