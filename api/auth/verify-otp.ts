import jwt from 'jsonwebtoken';
import { checkOtp, findUserByPhone, normalizeIndianPhone, createSession, createRegistrationVerificationToken } from '../../server/services/otp.js';

const JWT_SECRET = process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!JWT_SECRET) return res.status(500).json({ error: 'Authentication is not configured on the server.' });

  try {
    const phone = normalizeIndianPhone(req.body?.phone);
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const purpose = req.body?.purpose === 'reset' ? 'reset' : req.body?.purpose === 'register' ? 'register' : 'login';
    if (!phone || !/^\d{4,10}$/.test(code)) return res.status(400).json({ error: 'Enter the mobile number and the OTP you received.' });

    const verification = await checkOtp(phone, code);
    if (verification?.status !== 'approved') return res.status(401).json({ error: 'Invalid or expired OTP.' });

    if (purpose === 'register') {
      const existing = await findUserByPhone(phone);
      if (existing) return res.status(409).json({ error: 'That mobile number is already linked to an account.' });
      return res.status(200).json({ success: true, registrationToken: createRegistrationVerificationToken(phone) });
    }

    const user = await findUserByPhone(phone);
    if (!user) return res.status(404).json({ error: 'No RoboLearn account is linked to this mobile number.' });

    if (purpose === 'reset') {
      const resetToken = jwt.sign({ id: user.id, purpose: 'password-reset', phone }, JWT_SECRET, { expiresIn: '10m' });
      return res.status(200).json({ success: true, resetToken });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    return res.status(200).json({ success: true, token: createSession(userWithoutPassword), user: userWithoutPassword });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: error?.message || 'Unable to verify OTP right now. Please try again.' });
  }
}
