import jwt from 'jsonwebtoken';
import { dbService, initDatabase } from '../../server/db/database.js';
import { normalizeIndianPhone, setUserPhone } from '../../server/services/otp.js';

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
    await initDatabase();
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });

    const updates: any = {};
    if (typeof req.body?.fullName === 'string') updates.fullName = req.body.fullName.trim().slice(0, 120);
    if (req.body?.experienceLevel !== undefined) updates.experienceLevel = req.body.experienceLevel;
    if (req.body?.preferredProgrammingLanguage !== undefined) updates.preferredProgrammingLanguage = req.body.preferredProgrammingLanguage;
    if (req.body?.preferredLanguage !== undefined) updates.preferredLanguage = req.body.preferredLanguage;

    let updated = await dbService.updateUserProgress(userId, updates);
    if (!updated) return res.status(404).json({ error: 'User not found.' });

    if (req.body?.phone !== undefined) {
      const phone = normalizeIndianPhone(req.body.phone);
      if (!phone) return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });
      try {
        updated = (await setUserPhone(userId, phone)) || updated;
      } catch (error: any) {
        return res.status(409).json({ error: error?.message || 'Unable to link this mobile number.' });
      }
    }

    const { passwordHash, ...userWithoutPassword } = updated;
    void passwordHash;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Unable to update your profile right now.' });
  }
}
