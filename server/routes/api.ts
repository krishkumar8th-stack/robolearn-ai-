import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbService } from '../db/database.js';
import { geminiService } from '../services/ai/gemini.service.js';
import { parseAndInterpretCode } from '../services/simulation/code-interpreter.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'roblearn-ai-jwt-secret-key-production';

// Helper for JWT authentication
function authenticateUser(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// ---------------- AUTHENTICATION ----------------
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password, experienceLevel, preferredProgrammingLanguage, preferredLanguage } = req.body;
    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ error: 'Please provide full name, username, email, and password.' });
    }

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = await dbService.createUser({
      fullName,
      username,
      email,
      role: 'user',
      experienceLevel: experienceLevel || 'Beginner',
      preferredProgrammingLanguage: preferredProgrammingLanguage || 'cpp',
      preferredLanguage: preferredLanguage || 'en',
      lastActiveDate: new Date().toISOString(),
      password
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userWithoutPassword } = newUser;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userWithoutPassword } = user;
    return res.json({ token, user: userWithoutPassword });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.get('/auth/me', async (req: Request, res: Response) => {
  const userId = authenticateUser(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword });
});

router.put('/auth/profile', async (req: Request, res: Response) => {
  const userId = authenticateUser(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { fullName, experienceLevel, preferredProgrammingLanguage, preferredLanguage } = req.body;
  const updated = await dbService.updateUserProgress(userId, {
    fullName,
    experienceLevel,
    preferredProgrammingLanguage,
    preferredLanguage
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...userWithoutPassword } = updated;
  return res.json({ user: userWithoutPassword });
});

// ---------------- COMPONENTS ----------------
router.get('/components', async (req: Request, res: Response) => {
  const { category, difficulty, search } = req.query;
  const components = await dbService.getComponents(
    category as string | undefined,
    difficulty as string | undefined,
    search as string | undefined
  );
  return res.json(components);
});

router.get('/components/:id', async (req: Request, res: Response) => {
  const comp = await dbService.getComponentById(req.params.id);
  if (!comp) return res.status(404).json({ error: 'Component not found' });
  return res.json(comp);
});

router.post('/components/:id/learn', async (req: Request, res: Response) => {
  const userId = authenticateUser(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const compId = req.params.id;
  const learned = new Set(user.learnedComponents || []);
  let xpGain = 0;
  if (!learned.has(compId)) {
    learned.add(compId);
    xpGain = 30;
  }

  const updated = await dbService.updateUserProgress(userId, {
    learnedComponents: Array.from(learned),
    xp: user.xp + xpGain
  });

  return res.json({ success: true, xpEarned: xpGain, user: updated });
});

// ---------------- COURSES & LESSONS ----------------
router.get('/courses', async (req: Request, res: Response) => {
  const courses = await dbService.getCourses();
  return res.json(courses);
});

router.get('/courses/:id', async (req: Request, res: Response) => {
  const course = await dbService.getCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  return res.json(course);
});

router.get('/courses/:courseId/lessons/:lessonId', async (req: Request, res: Response) => {
  const lesson = await dbService.getLessonById(req.params.courseId, req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  return res.json(lesson);
});

router.post('/progress/complete-lesson', async (req: Request, res: Response) => {
  const userId = authenticateUser(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { lessonId } = req.body;
  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const completed = new Set(user.completedLessons || []);
  let xpGain = 0;
  if (!completed.has(lessonId)) {
    completed.add(lessonId);
    xpGain = 50;
  }

  const updated = await dbService.updateUserProgress(userId, {
    completedLessons: Array.from(completed),
    xp: user.xp + xpGain
  });

  return res.json({ success: true, xpEarned: xpGain, user: updated });
});

// ---------------- CHALLENGES ----------------
router.get('/challenges', async (req: Request, res: Response) => {
  const challenges = await dbService.getChallenges(req.query.difficulty as string | undefined);
  return res.json(challenges);
});

router.get('/challenges/:id', async (req: Request, res: Response) => {
  const challenge = await dbService.getChallengeById(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  return res.json(challenge);
});

router.post('/challenges/:id/submit', async (req: Request, res: Response) => {
  const challenge = await dbService.getChallengeById(req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  const { code } = req.body;
  const interpretation = parseAndInterpretCode(code || '');

  const userId = authenticateUser(req);
  let user = null;
  let xpEarned = 0;

  if (userId) {
    const existingUser = await dbService.findUserById(userId);
    if (existingUser) {
      const completed = new Set(existingUser.completedChallenges || []);
      if (!completed.has(challenge.id) && interpretation.success) {
        completed.add(challenge.id);
        xpEarned = challenge.xpReward;
        user = await dbService.updateUserProgress(userId, {
          completedChallenges: Array.from(completed),
          xp: existingUser.xp + xpEarned
        });
      }
    }
  }

  return res.json({
    success: interpretation.success,
    supported: interpretation.supported,
    message: interpretation.message,
    actions: interpretation.actions,
    logs: interpretation.logs,
    xpEarned,
    user
  });
});

// ---------------- PROJECTS ----------------
router.get('/projects', async (req: Request, res: Response) => {
  const projects = await dbService.getProjects();
  return res.json(projects);
});

router.get('/projects/:id', async (req: Request, res: Response) => {
  const proj = await dbService.getProjectById(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  return res.json(proj);
});

router.post('/projects/:id/complete', async (req: Request, res: Response) => {
  const userId = authenticateUser(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const proj = await dbService.getProjectById(req.params.id);
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  const user = await dbService.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const completed = new Set(user.completedProjects || []);
  let xpGain = 0;
  if (!completed.has(proj.id)) {
    completed.add(proj.id);
    xpGain = proj.xpReward;
  }

  const updated = await dbService.updateUserProgress(userId, {
    completedProjects: Array.from(completed),
    xp: user.xp + xpGain
  });

  return res.json({ success: true, xpEarned: xpGain, user: updated });
});

// ---------------- ACHIEVEMENTS ----------------
router.get('/achievements', async (req: Request, res: Response) => {
  const achievements = await dbService.getAchievements();
  return res.json(achievements);
});

// ---------------- REAL GEMINI AI APIS ----------------
router.get('/ai/health', async (req: Request, res: Response) => {
  const health = await geminiService.checkHealth();
  return res.json(health);
});

router.post('/ai/tutor', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const reply = await geminiService.chatTutor(message, history || [], context);
    return res.json({ reply });
  } catch (err: any) {
    console.error('AI Tutor error:', err);
    return res.status(500).json({ error: err.message || 'AI Tutor request failed' });
  }
});

router.post('/ai/generate-code', async (req: Request, res: Response) => {
  try {
    const { prompt, targetBoard, language } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const result = await geminiService.generateCode(prompt, targetBoard, language);
    return res.json(result);
  } catch (err: any) {
    console.error('AI Code Generator error:', err);
    return res.status(500).json({ error: err.message || 'Code generation failed' });
  }
});

router.post('/ai/explain-code', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const result = await geminiService.explainCode(code, language);
    return res.json(result);
  } catch (err: any) {
    console.error('AI Explain Code error:', err);
    return res.status(500).json({ error: err.message || 'Code explanation failed' });
  }
});

router.post('/ai/debug-code', async (req: Request, res: Response) => {
  try {
    const { code, language, errorMessage, hardwareContext } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const result = await geminiService.debugCode(code, language, errorMessage, hardwareContext);
    return res.json(result);
  } catch (err: any) {
    console.error('AI Debugger error:', err);
    return res.status(500).json({ error: err.message || 'Code debugging failed' });
  }
});

router.post('/ai/explain-component', async (req: Request, res: Response) => {
  try {
    const { componentId, userQuestion } = req.body;
    const component = await dbService.getComponentById(componentId);
    if (!component) return res.status(404).json({ error: 'Component not found' });

    const reply = await geminiService.explainComponent(component, userQuestion);
    return res.json({ explanation: reply });
  } catch (err: any) {
    console.error('AI Component Explain error:', err);
    return res.status(500).json({ error: err.message || 'Component explanation failed' });
  }
});

router.post('/ai/hint', async (req: Request, res: Response) => {
  try {
    const { challengeTitle, problem, currentCode, hintLevel } = req.body;
    const hint = await geminiService.getHint(challengeTitle, problem, currentCode, hintLevel || 1);
    return res.json({ hint });
  } catch (err: any) {
    console.error('AI Hint error:', err);
    return res.status(500).json({ error: err.message || 'Hint request failed' });
  }
});

// ---------------- SIMULATION INTERPRETER ----------------
router.post('/simulation/interpret', async (req: Request, res: Response) => {
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const result = parseAndInterpretCode(code, language || 'cpp');
  return res.json(result);
});

export default router;
