import jwt from 'jsonwebtoken';
import { dbService, initDatabase } from '../../server/db/database.js';

const JWT_SECRET = process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');
const text = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured on the server.' });

  try {
    await initDatabase();
    const fullName = text(req.body?.fullName, 120);
    const username = text(req.body?.username, 40).toLowerCase();
    const email = text(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password || !fullName || !username) return res.status(400).json({ error: 'Please provide full name, username, email, and password.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters long.' });

    if (await dbService.findUserByEmail(email)) return res.status(409).json({ error: 'An account with this email address already exists.' });
    if (await dbService.findUserByUsername(username)) return res.status(409).json({ error: 'That username is already taken.' });

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
    } as any);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userWithoutPassword } = newUser;
    void passwordHash;
    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error?.code === 11000) return res.status(409).json({ error: 'That email or username is already registered.' });
    return res.status(500).json({ error: 'Unable to create your account right now. Please try again.' });
  }
}
