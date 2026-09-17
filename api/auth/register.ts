import jwt from 'jsonwebtoken';
import { dbService, initDatabase } from '../../server/db/database.js';

const JWT_SECRET =
  process.env.JWT_SECRET?.trim() ||
  (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await initDatabase();

    const fullName = text(req.body?.fullName, 120);
    const username = text(req.body?.username, 40).toLowerCase();
    const email = text(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password || !fullName || !username) {
      return res.status(400).json({ error: 'Please provide full name, username, email, and password.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'Server authentication is not configured. Set JWT_SECRET in Vercel.' });
    }

    if (await dbService.findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }
    if (await dbService.findUserByUsername(username)) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    const user = await dbService.createUser({
      fullName,
      username,
      email,
      role: 'user',
      experienceLevel: req.body?.experienceLevel || 'Beginner',
      preferredProgrammingLanguage: req.body?.preferredProgrammingLanguage || 'cpp',
      preferredLanguage: req.body?.preferredLanguage || 'en',
      lastActiveDate: new Date().toISOString(),
      password,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...safeUser } = user;
    return res.status(201).json({ token, user: safeUser });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error?.code === 11000) {
      const key = Object.keys(error?.keyPattern || {})[0];
      return res.status(409).json({
        error: key === 'username'
          ? 'That username is already taken.'
          : 'An account with this email address already exists.',
      });
    }
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Unable to create account. Please check the server configuration.'
        : (error?.message || 'Unable to create account.'),
    });
  }
}
