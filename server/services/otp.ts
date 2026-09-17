import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { dbService, initDatabase } from '../db/database.js';
import { User } from '../../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET?.trim() || (process.env.NODE_ENV === 'production' ? '' : 'roblearn-dev-fallback-secret');
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID?.trim();
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN?.trim();
const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

function usersCollection() {
  return mongoose.connection.db?.collection<any>('roblearn_users');
}

export function normalizeIndianPhone(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (/^\+91\d{10}$/.test(raw)) return raw;
  if (/^91\d{10}$/.test(raw)) return `+${raw}`;
  if (/^\d{10}$/.test(raw)) return `+91${raw}`;
  return '';
}

export function otpProviderConfigured() {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_VERIFY_SERVICE_SID);
}

async function ensurePhoneIndex() {
  const collection = usersCollection();
  if (!collection) throw new Error('MongoDB connection is unavailable.');
  await collection.createIndex({ phone: 1 }, { name: 'uniq_roblearn_user_phone', unique: true, sparse: true });
  return collection;
}

export async function findUserByPhone(phone: string): Promise<(User & { passwordHash: string }) | null> {
  await initDatabase();
  const collection = await ensurePhoneIndex();
  const found = await collection.findOne({ phone });
  return found ? ({ ...found, id: found.id || String(found._id) } as User & { passwordHash: string }) : null;
}

export async function setUserPhone(userId: string, phone: string) {
  await initDatabase();
  const collection = await ensurePhoneIndex();
  const existing = await collection.findOne({ phone, _id: { $ne: userId } });
  if (existing) throw new Error('That mobile number is already linked to another account.');
  const result = await collection.updateOne({ _id: userId }, { $set: { phone } });
  if (!result.matchedCount) return null;
  return dbService.findUserById(userId);
}

export async function updatePassword(userId: string, password: string) {
  await initDatabase();
  const collection = usersCollection();
  if (!collection) throw new Error('MongoDB connection is unavailable.');
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await collection.updateOne({ _id: userId }, { $set: { passwordHash } });
  return result.matchedCount > 0;
}

async function twilioVerify(path: 'Verifications' | 'VerificationCheck', body: URLSearchParams) {
  if (!otpProviderConfigured()) throw new Error('Mobile OTP is not configured on the server. Add the Twilio Verify environment variables in Vercel.');
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof payload?.message === 'string' ? payload.message : 'Unable to send or verify OTP. Please try again.');
  }
  return payload;
}

export async function sendOtp(phone: string) {
  const body = new URLSearchParams({ To: phone, Channel: 'sms' });
  return twilioVerify('Verifications', body);
}

export async function checkOtp(phone: string, code: string) {
  const body = new URLSearchParams({ To: phone, Code: code });
  return twilioVerify('VerificationCheck', body);
}

export function createSession(user: User) {
  if (!JWT_SECRET) throw new Error('Authentication is not configured on the server.');
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}
