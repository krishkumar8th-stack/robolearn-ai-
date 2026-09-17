import jwt from 'jsonwebtoken';
import { dbService, initDatabase } from '../../server/db/database.js';

const JWT_SECRET =
  process.env.JWT_SECRET?.trim() ||
  (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    await initDatabase();
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ') || !JWT_SECRET) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });
    }
    const token = auth.slice(7).trim();
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!decoded.id) return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });

    const user = await dbService.findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { passwordHash, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error('Auth me error:', error);
    return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });
  }
}
