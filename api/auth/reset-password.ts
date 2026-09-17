import jwt from 'jsonwebtoken';
import { updatePassword } from '../../server/services/otp.js';

const JWT_SECRET = process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured on the server.' });

  try {
    const token = typeof req.body?.resetToken === 'string' ? req.body.resetToken.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!token || password.length < 8) return res.status(400).json({ error: 'Use a valid reset session and a password of at least 8 characters.' });

    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; purpose?: string };
    if (decoded.purpose !== 'password-reset' || typeof decoded.id !== 'string' || !decoded.id) return res.status(401).json({ error: 'This password reset session is invalid or expired.' });

    const updated = await updatePassword(decoded.id, password);
    if (!updated) return res.status(404).json({ error: 'User account not found.' });
    return res.status(200).json({ success: true, message: 'Password changed successfully. You can now sign in.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') return res.status(401).json({ error: 'This password reset session is invalid or expired. Request a new OTP.' });
    return res.status(500).json({ error: error?.message || 'Unable to reset your password right now.' });
  }
}
