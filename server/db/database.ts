import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { User, ElectronicComponent, Course, CodingChallenge, RoboticsProject, Achievement, AIChatMessage } from '../../src/types/index.js';
import { SEED_COMPONENTS, SEED_COURSES, SEED_CHALLENGES, SEED_PROJECTS, SEED_ACHIEVEMENTS } from './seedData.js';
import { COMPONENT_CATALOG, catalogEntryToComponent } from '../../src/data/componentCatalog.js';

interface InMemoryStore {
  components: Map<string, ElectronicComponent>;
  courses: Map<string, Course>;
  challenges: Map<string, CodingChallenge>;
  projects: Map<string, RoboticsProject>;
  achievements: Map<string, Achievement>;
  conversations: Map<string, { id: string; userId: string; title: string; messages: AIChatMessage[]; updatedAt: string }>;
}

type StoredUser = User & { passwordHash: string };
type MongoStoredUser = StoredUser & { _id?: string };

const store: InMemoryStore = {
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

// Curated learning set: exactly 50 hardware references focused on drone,
// autonomous-robot, rover, and embedded-robotics projects.
const FEATURED_COMPONENTS: Array<{ name: string; alias?: string; category?: ElectronicComponent['category'] }> = [
  { name: 'Arduino Uno R3', category: 'microcontrollers' },
  { name: 'ESP32 DevKit V1', category: 'microcontrollers' },
  { name: 'STM32 Blue Pill', category: 'microcontrollers' },
  { name: 'Raspberry Pi Pico W', category: 'microcontrollers' },
  { name: 'Raspberry Pi 5 8GB', category: 'computing_boards' },
  { name: 'NVIDIA Jetson Orin Nano 8GB', category: 'computing_boards' },
  { name: 'HC-SR04 Ultrasonic Sensor', alias: 'HC-SR04 Ultrasonic Distance Sensor', category: 'sensors' },
  { name: 'VL53L0X ToF Sensor', category: 'sensors' },
  { name: 'TCRT5000 IR Sensor', category: 'sensors' },
  { name: 'MPU6050', category: 'sensors' },
  { name: 'MPU9250', category: 'sensors' },
  { name: 'ICM-20948', category: 'sensors' },
  { name: 'BNO085 IMU', category: 'sensors' },
  { name: 'BME280', category: 'sensors' },
  { name: 'BMP280', category: 'sensors' },
  { name: 'MS5611 Barometric Sensor', category: 'sensors' },
  { name: 'HMC5883L', category: 'sensors' },
  { name: 'AS5600 Magnetic Encoder', category: 'sensors' },
  { name: 'BNO055 Absolute Orientation', category: 'sensors' },
  { name: 'INA219 Current Sensor', category: 'sensors' },
  { name: 'ACS712 20A Current Sensor', category: 'sensors' },
  { name: 'SG90 Micro Servo', alias: 'SG90 Micro Servo Motor', category: 'actuators' },
  { name: 'MG996R High Torque Servo', category: 'actuators' },
  { name: 'Dynamixel XL-320', category: 'actuators' },
  { name: 'NEMA 17 Stepper Motor', category: 'actuators' },
  { name: 'TT DC Gear Motor', category: 'actuators' },
  { name: 'BO Gear Motor', category: 'actuators' },
  { name: 'N20 Micro Gear Motor', category: 'actuators' },
  { name: 'Brushless DC Motor 2212', category: 'actuators' },
  { name: 'Brushless DC Motor 2205', category: 'actuators' },
  { name: 'Brushless DC Motor 2306', category: 'actuators' },
  { name: 'ESC 30A Brushless Motor Controller', category: 'actuators' },
  { name: 'Brushless DC Motor 2812', category: 'actuators' },
  { name: 'L298N Motor Driver Module', category: 'power' },
  { name: 'TB6612FNG Motor Driver', category: 'power' },
  { name: 'BTS7960 Motor Driver', category: 'power' },
  { name: 'VNH2SP30 Motor Driver', category: 'power' },
  { name: 'PCA9685 16-Channel PWM Driver', category: 'power' },
  { name: 'A4988 Stepper Driver', category: 'power' },
  { name: 'TMC2209 Stepper Driver', category: 'power' },
  { name: 'Cytron MDD10A', category: 'power' },
  { name: 'TP4056 Li-Ion Charger Module', category: 'power' },
  { name: '3S LiPo Battery Pack', category: 'power' },
  { name: 'HC-05 Bluetooth Module', category: 'communication' },
  { name: 'nRF24L01+', category: 'communication' },
  { name: 'LoRa SX1278 Ra-02', category: 'communication' },
  { name: 'NEO-6M GPS Module', category: 'communication' },
  { name: 'MCP2515 CAN Module', category: 'communication' },
  { name: 'MAX485 RS485 Module', category: 'communication' },
  { name: 'W5500 Ethernet Module', category: 'communication' }
];

function normalizedName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function buildFeaturedComponents(): ElectronicComponent[] {
  const byName = new Map<string, ElectronicComponent[]>();
  for (const component of store.components.values()) {
    const key = normalizedName(component.name);
    const existing = byName.get(key) || [];
    existing.push(component);
    byName.set(key, existing);
  }

  return FEATURED_COMPONENTS.map((featured) => {
    const candidates = [featured.alias, featured.name].filter(Boolean) as string[];
    for (const candidate of candidates) {
      const found = byName.get(normalizedName(candidate))?.[0];
      if (found && (!featured.category || found.category === featured.category)) return found;
    }
    return null;
  }).filter((component): component is ElectronicComponent => Boolean(component));
}

const featuredComponents = buildFeaturedComponents();

let isMongoConnected = false;

function usersCollection() {
  return mongoose.connection.db?.collection<MongoStoredUser>('roblearn_users');
}

export async function initDatabase() {
  if (isMongoConnected) return;

  const mongoUri = process.env.MONGODB_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Configure MongoDB before starting RoboLearn AI.');
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    const collection = usersCollection();
    if (!collection) throw new Error('MongoDB connected but the users collection handle is unavailable.');

    await collection.createIndexes([
      { key: { email: 1 }, name: 'uniq_roblearn_user_email', unique: true },
      { key: { username: 1 }, name: 'uniq_roblearn_user_username', unique: true }
    ]);

    // Remove the legacy seeded demo account if an older deployment created it.
    await collection.deleteOne({ _id: 'user-demo-1' });
    isMongoConnected = true;
    console.log('MongoDB connected successfully; real user persistence enabled.');
  } catch (err: any) {
    isMongoConnected = false;
    try { await mongoose.disconnect(); } catch { /* cleanup only */ }
    throw new Error(`MongoDB connection failed: ${err?.message || 'unknown error'}`);
  }
}

function requireUsersCollection() {
  if (!isMongoConnected) throw new Error('MongoDB is not initialized. Configure MONGODB_URI and restart the API.');
  const collection = usersCollection();
  if (!collection) throw new Error('MongoDB connection is unavailable.');
  return collection;
}

async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.toLowerCase().trim();
  const found = await requireUsersCollection().findOne({ email: normalized });
  return found ? ({ ...found, id: found.id || String((found as any)._id) } as StoredUser) : null;
}

async function findUserByUsername(username: string): Promise<StoredUser | null> {
  const normalized = username.toLowerCase().trim();
  const found = await requireUsersCollection().findOne({ username: normalized });
  return found ? ({ ...found, id: found.id || String((found as any)._id) } as StoredUser) : null;
}

async function findUserById(id: string): Promise<StoredUser | null> {
  const found = await requireUsersCollection().findOne({ _id: id });
  return found ? ({ ...found, id: found.id || id } as StoredUser) : null;
}

async function saveUser(user: StoredUser): Promise<StoredUser> {
  const collection = requireUsersCollection();
  await collection.replaceOne({ _id: user.id }, { ...user, _id: user.id }, { upsert: true });
  return user;
}

export const dbService = {
  async findUserByEmail(email: string) { return findUserByEmail(email); },
  async findUserByUsername(username: string) { return findUserByUsername(username); },
  async findUserById(id: string) { return findUserById(id); },

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'xp' | 'level' | 'streak' | 'completedLessons' | 'completedChallenges' | 'completedProjects' | 'learnedComponents' | 'achievements'> & { password: string }) {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const normalizedUsername = userData.username.toLowerCase().trim();
    const existingEmail = await findUserByEmail(normalizedEmail);
    if (existingEmail) throw new Error('An account with this email address already exists.');
    const existingUsername = await findUserByUsername(normalizedUsername);
    if (existingUsername) throw new Error('That username is already taken.');

    const id = `usr_${randomUUID()}`;
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const newUser: StoredUser = {
      id,
      fullName: userData.fullName.trim(),
      username: normalizedUsername,
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
    let list = featuredComponents;
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
  async getAchievementById(id: string) { return store.achievements.get(id) || null; },
  async getConversations(userId: string) {
    return Array.from(store.conversations.values()).filter(c => c.userId === userId);
  },
  async getConversationById(id: string, userId: string) {
    const conversation = store.conversations.get(id);
    return conversation?.userId === userId ? conversation : null;
  },
  async saveConversation(conversation: { id: string; userId: string; title: string; messages: AIChatMessage[]; updatedAt: string }) {
    store.conversations.set(conversation.id, conversation);
    return conversation;
  }
};
