import { findUserByPhone, normalizeIndianPhone, sendOtp, otpProviderConfigured } from '../../server/services/otp.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!otpProviderConfigured()) return res.status(503).json({ error: 'Mobile OTP is not configured yet. Add the Twilio Verify variables in Vercel.' });

  try {
    const phone = normalizeIndianPhone(req.body?.phone);
    const purpose = req.body?.purpose === 'reset' ? 'reset' : 'login';
    if (!phone) return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number.' });

    const user = await findUserByPhone(phone);
    if (!user) return res.status(404).json({ error: purpose === 'reset' ? 'No RoboLearn account is linked to this mobile number.' : 'No account is linked to this mobile number. Add your number to your profile first.' });

    await sendOtp(phone);
    return res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: error?.message || 'Unable to send OTP right now. Please try again.' });
  }
}
