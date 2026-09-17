import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService, initDatabase } from '../../server/db/database.js';

const JWT_SECRET =
  process.env.JWT_SECRET?.trim() ||
  (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await initDatabase();

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'Server authentication is not configured. Set JWT_SECRET in Vercel.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...safeUser } = user;
    return res.status(200).json({ token, user: safeUser });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: process.env.NODE_ENV === 'production'
        ? 'Unable to sign in. Please check the server configuration.'
        : (error?.message || 'Unable to sign in.'),
    });
  }
}
