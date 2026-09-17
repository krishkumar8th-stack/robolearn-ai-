import jwt from 'jsonwebtoken';
import { dbService } from '../../server/db/database.js';

const JWT_SECRET = process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

function getUserId(req: any): string | null {
  if (!JWT_SECRET) return null;
  const header = req.headers?.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(header.slice(7).trim(), JWT_SECRET) as { id?: string };
    return typeof decoded.id === 'string' && decoded.id ? decoded.id : null;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });
    const updated = await dbService.updateUserProgress(userId, {
      fullName: typeof req.body?.fullName === 'string' ? req.body.fullName.trim().slice(0, 120) : undefined,
      experienceLevel: req.body?.experienceLevel,
      preferredProgrammingLanguage: req.body?.preferredProgrammingLanguage,
      preferredLanguage: req.body?.preferredLanguage
    });
    if (!updated) return res.status(404).json({ error: 'User not found.' });
    const { passwordHash, ...userWithoutPassword } = updated;
    void passwordHash;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Unable to update your profile right now.' });
  }
}
