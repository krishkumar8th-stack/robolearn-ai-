import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from '../db/database.js';
import { geminiService } from '../services/ai/gemini.service.js';
import { parseAndInterpretCode } from '../services/simulation/code-interpreter.js';
import { rateLimit } from '../middleware/security.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

function requireJwtSecret() {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is required in production. Configure the server secret before accepting authentication requests.');
  return JWT_SECRET;
}

// Express 4 does not automatically forward rejected async handlers. Wrap every
// route handler once so unexpected backend/API errors reach the JSON error handler.
const wrapAsync = (handler: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
  const original = (router as any)[method].bind(router);
  (router as any)[method] = (path: string, ...handlers: any[]) =>
    original(path, ...handlers.map(handler => typeof handler === 'function' ? wrapAsync(handler) : handler));
}

router.use(rateLimit({ windowMs: 60_000, max: 180 }));
const authLimiter = rateLimit({ windowMs: 5 * 60_000, max: 20, message: 'Too many authentication attempts. Please wait a few minutes.' });
const aiLimiter = rateLimit({ windowMs: 60_000, max: 30, message: 'AI request limit reached. Please wait a moment and try again.' });

function normalizeText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function authenticateUser(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token || !JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    return typeof decoded.id === 'string' && decoded.id ? decoded.id : null;
  } catch {
    return null;
  }
}

function requireUser(req: Request, res: Response): string | null {
  const userId = authenticateUser(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized. Please sign in again.' });
    return null;
  }
  return userId;
}

router.get('/health', async (_req: Request, res: Response) => {
  const ai = await geminiService.checkHealth();
  return res.json({
    status: 'ok',
    service: 'RoboLearn AI Engine',
    timestamp: new Date().toISOString(),
    ai: ai.status,
    aiModel: ai.model,
    database: 'connected'
  });
});

// ---------------- AUTHENTICATION ----------------
router.post('/auth/register', authLimiter, async (req: Request, res: Response) => {
  const fullName = normalizeText(req.body?.fullName, 120);
  const username = normalizeText(req.body?.username, 40).toLowerCase();
  const email = normalizeText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password || !fullName || !username) {
    return res.status(400).json({ error: 'Please provide full name, username, email, and password.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters long.' });

  const existingEmail = await dbService.findUserByEmail(email);
  if (existingEmail) return res.status(409).json({ error: 'An account with this email address already exists.' });
  const existingUsername = await dbService.findUserByUsername(username);
  if (existingUsername) return res.status(409).json({ error: 'That username is already taken.' });

  try {
    const newUser = await dbService.createUser({
      fullName,
      username,
      email,
      role: 'user',
      experienceLevel: req.body?.experienceLevel || 'Beginner',
      preferredProgrammingLanguage: req.body?.preferredProgrammingLanguage || 'cpp',
      preferredLanguage: req.body?.preferredLanguage || 'en',
      lastActiveDate: new Date().toISOString(),
      password
    });
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, requireJwtSecret(), { expiresIn: '7d' });
    const { passwordHash, ...userWithoutPassword } = newUser;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err: any) {
    if (err?.code === 11000) {
      const key = Object.keys(err?.keyPattern || {})[0];
      return res.status(409).json({ error: key === 'username' ? 'That username is already taken.' : 'An account with this email address already exists.' });
    }
    throw err;
  }
});

router.post('/auth/login', authLimiter, async (req: Request, res: Response) => {
  const email = normalizeText(req.body?.email, 160).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await dbService.findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, requireJwtSecret(), { expiresIn: '7d' });
  const { passwordHash, ...userWithoutPassword } = user;
  return res.json({ token, user: userWithoutPassword });
});

router.get('/auth/me', async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { passwordHash, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

router.put('/auth/profile', async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const updates = {
    fullName: req.body?.fullName ? normalizeText(req.body.fullName, 120) : undefined,
    experienceLevel: req.body?.experienceLevel,
    preferredProgrammingLanguage: req.body?.preferredProgrammingLanguage,
    preferredLanguage: req.body?.preferredLanguage
  };
  const updated = await dbService.updateUserProgress(userId, updates);
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  const { passwordHash, ...userWithoutPassword } = updated;
  return res.json({ user: userWithoutPassword });
});

// ---------------- COMPONENTS ----------------
router.get('/components', async (req: Request, res: Response) => {
  const category = normalizeText(req.query.category, 50) || undefined;
  const difficulty = normalizeText(req.query.difficulty, 30) || undefined;
  const search = normalizeText(req.query.search, 100) || undefined;
  const allowedDifficulties = new Set(['Beginner', 'Intermediate', 'Advanced']);
  if (difficulty && !allowedDifficulties.has(difficulty)) return res.status(400).json({ error: 'Invalid difficulty.' });
  const components = await dbService.getComponents(category, difficulty, search);
  return res.json(components);
});

router.get('/components/:id', async (req: Request, res: Response) => {
  const id = normalizeText(req.params.id, 150);
  const comp = await dbService.getComponentById(id);
  if (!comp) return res.status(404).json({ error: 'Component not found.' });
  return res.json(comp);
});

router.post('/components/:id/learn', async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const compId = normalizeText(req.params.id, 150);
  if (!(await dbService.getComponentById(compId))) return res.status(404).json({ error: 'Component not found.' });

  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const learned = new Set(user.learnedComponents || []);
  const xpGain = learned.has(compId) ? 0 : 30;
  learned.add(compId);
  const updated = await dbService.updateUserProgress(userId, { learnedComponents: Array.from(learned), xp: user.xp + xpGain });
  return res.json({ success: true, xpEarned: xpGain, user: updated });
});

// ---------------- COURSES & LESSONS ----------------
router.get('/courses', async (_req: Request, res: Response) => res.json(await dbService.getCourses()));
router.get('/courses/:id', async (req: Request, res: Response) => {
  const course = await dbService.getCourseById(normalizeText(req.params.id, 120));
  if (!course) return res.status(404).json({ error: 'Course not found.' });
  return res.json(course);
});
router.get('/courses/:courseId/lessons/:lessonId', async (req: Request, res: Response) => {
  const lesson = await dbService.getLessonById(normalizeText(req.params.courseId, 120), normalizeText(req.params.lessonId, 120));
  if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
  return res.json(lesson);
});
router.post('/progress/complete-lesson', async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const lessonId = normalizeText(req.body?.lessonId, 120);
  if (!lessonId) return res.status(400).json({ error: 'lessonId is required.' });
  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const completed = new Set(user.completedLessons || []);
  const xpGain = completed.has(lessonId) ? 0 : 50;
  completed.add(lessonId);
  const updated = await dbService.updateUserProgress(userId, { completedLessons: Array.from(completed), xp: user.xp + xpGain });
  return res.json({ success: true, xpEarned: xpGain, user: updated });
});

function validateChallenge(challenge: CodingChallenge, code: string) {
  const clearRun = parseAndInterpretCode(code, challenge.programmingLanguage, 42);
  const nearRun = parseAndInterpretCode(code, challenge.programmingLanguage, 15);
  const has = (actions: any[], type: string, predicate?: (action: any) => boolean) =>
    actions.some(action => action.type === type && (!predicate || predicate(action)));

  if (challenge.id === 'ch-1-led-on') {
    return has(clearRun.actions, 'LED_SET', a => String(a.pin) === '13' && a.state === 'ON');
  }

  if (challenge.id === 'ch-2-led-blink') {
    const ledActions = clearRun.actions.filter(a => a.type === 'LED_SET' && String(a.pin) === '13');
    const hasOn = ledActions.some(a => a.state === 'ON');
    const hasOff = ledActions.some(a => a.state === 'OFF');
    const hasOneSecondTiming = ledActions.some(a => Number(a.delayMs || a.duration) >= 1000);
    return hasOn && hasOff && hasOneSecondTiming;
  }

  if (challenge.id === 'ch-3-obstacle-avoidance') {
    const clearForward = has(clearRun.actions, 'ROBOT_MOVE', a => a.direction === 'FORWARD');
    const nearStop = has(nearRun.actions, 'ROBOT_STOP');
    const nearTurn = has(nearRun.actions, 'ROBOT_TURN', a => a.direction === 'LEFT' && Number(a.angle || 0) === 90);
    const nearSonar = has(nearRun.actions, 'ULTRASONIC_PING');
    return clearForward && nearSonar && nearStop && nearTurn;
  }

  return clearRun.success;
}

// ---------------- CHALLENGES ----------------
router.get('/challenges', async (req: Request, res: Response) => res.json(await dbService.getChallenges(normalizeText(req.query.difficulty, 30) || undefined)));
router.get('/challenges/:id', async (req: Request, res: Response) => {
  const challenge = await dbService.getChallengeById(normalizeText(req.params.id, 120));
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  return res.json(challenge);
});
router.post('/challenges/:id/submit', async (req: Request, res: Response) => {
  const challenge = await dbService.getChallengeById(normalizeText(req.params.id, 120));
  if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
  const code = typeof req.body?.code === 'string' ? req.body.code.slice(0, 100_000) : '';
  const interpretation = parseAndInterpretCode(code, challenge.programmingLanguage, 42);
  const passed = validateChallenge(challenge, code);
  const userId = authenticateUser(req);
  let user = null;
  let xpEarned = 0;
  if (userId) {
    const existingUser = await dbService.findUserById(userId);
    if (existingUser) {
      const completed = new Set(existingUser.completedChallenges || []);
      if (!completed.has(challenge.id) && passed) {
        completed.add(challenge.id);
        xpEarned = challenge.xpReward;
        user = await dbService.updateUserProgress(userId, { completedChallenges: Array.from(completed), xp: existingUser.xp + xpEarned });
      } else user = existingUser;
    }
  }
  return res.json({ success: passed, supported: interpretation.supported, message: passed ? 'All challenge checks passed.' : 'The submitted code did not satisfy all required challenge checks.', actions: interpretation.actions, logs: interpretation.logs, xpEarned, user });
});

// ---------------- PROJECTS ----------------
router.get('/projects', async (_req: Request, res: Response) => res.json(await dbService.getProjects()));
router.get('/projects/:id', async (req: Request, res: Response) => {
  const proj = await dbService.getProjectById(normalizeText(req.params.id, 120));
  if (!proj) return res.status(404).json({ error: 'Project not found.' });
  return res.json(proj);
});
router.post('/projects/:id/complete', async (req: Request, res: Response) => {
  const userId = requireUser(req, res);
  if (!userId) return;
  const proj = await dbService.getProjectById(normalizeText(req.params.id, 120));
  if (!proj) return res.status(404).json({ error: 'Project not found.' });
  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const completed = new Set(user.completedProjects || []);
  const xpGain = completed.has(proj.id) ? 0 : proj.xpReward;
  completed.add(proj.id);
  const updated = await dbService.updateUserProgress(userId, { completedProjects: Array.from(completed), xp: user.xp + xpGain });
  return res.json({ success: true, xpEarned: xpGain, user: updated });
});

// ---------------- ACHIEVEMENTS ----------------
router.get('/achievements', async (_req: Request, res: Response) => res.json(await dbService.getAchievements()));

// ---------------- REAL GEMINI AI APIS ----------------
router.get('/ai/health', async (_req: Request, res: Response) => res.json(await geminiService.checkHealth()));
router.post('/ai/tutor', aiLimiter, async (req: Request, res: Response) => {
  const message = normalizeText(req.body?.message, 12_000);
  if (!message) return res.status(400).json({ error: 'Message is required.' });
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];
  const reply = await geminiService.chatTutor(message, history, req.body?.context);
  return res.json({ reply });
});
router.post('/ai/generate-code', aiLimiter, async (req: Request, res: Response) => {
  const prompt = normalizeText(req.body?.prompt, 12_000);
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });
  return res.json(await geminiService.generateCode(prompt, normalizeText(req.body?.targetBoard, 100) || 'Arduino Uno', normalizeText(req.body?.language, 30) || 'cpp'));
});
router.post('/ai/explain-code', aiLimiter, async (req: Request, res: Response) => {
  const code = normalizeText(req.body?.code, 100_000);
  if (!code) return res.status(400).json({ error: 'Code is required.' });
  return res.json(await geminiService.explainCode(code, normalizeText(req.body?.language, 30) || 'cpp'));
});
router.post('/ai/debug-code', aiLimiter, async (req: Request, res: Response) => {
  const code = normalizeText(req.body?.code, 100_000);
  if (!code) return res.status(400).json({ error: 'Code is required.' });
  return res.json(await geminiService.debugCode(code, normalizeText(req.body?.language, 30) || 'cpp', normalizeText(req.body?.errorMessage, 8_000), normalizeText(req.body?.hardwareContext, 4_000)));
});
router.post('/ai/explain-component', aiLimiter, async (req: Request, res: Response) => {
  const componentId = normalizeText(req.body?.componentId, 150);
  if (!componentId) return res.status(400).json({ error: 'componentId is required.' });
  const component = await dbService.getComponentById(componentId);
  if (!component) return res.status(404).json({ error: 'Component not found.' });
  return res.json({ explanation: await geminiService.explainComponent(component, normalizeText(req.body?.userQuestion, 6_000)) });
});
router.post('/ai/hint', aiLimiter, async (req: Request, res: Response) => {
  return res.json({ hint: await geminiService.getHint(normalizeText(req.body?.challengeTitle, 300), normalizeText(req.body?.problem, 8_000), normalizeText(req.body?.currentCode, 80_000), Math.max(1, Math.min(3, Number(req.body?.hintLevel) || 1))) });
});

// ---------------- SIMULATION INTERPRETER ----------------
router.post('/simulation/interpret', async (req: Request, res: Response) => {
  const code = typeof req.body?.code === 'string' ? req.body.code.slice(0, 100_000) : '';
  if (!code) return res.status(400).json({ error: 'Code is required.' });
  const sensorDistance = Number(req.body?.sensorDistance);\n  const safeSensorDistance = Number.isFinite(sensorDistance) ? Math.max(2, Math.min(400, sensorDistance)) : 42;\n  return res.json(parseAndInterpretCode(code, normalizeText(req.body?.language, 30) || 'cpp', safeSensorDistance));
});

router.use((_req: Request, res: Response) => res.status(404).json({ error: 'API endpoint not found.' }));

export default router;
