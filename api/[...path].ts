import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api.js';
import { initDatabase } from '../server/db/database.js';
import { requestId, securityHeaders, requireJsonBody } from '../server/middleware/security.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(requestId);
app.use(securityHeaders);
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : true }));
app.use(express.json({ limit: '10mb', strict: true }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(requireJsonBody);

let databaseInit: Promise<void> | null = null;
function ensureDatabase() {
  if (!databaseInit) databaseInit = initDatabase();
  return databaseInit;
}

app.use(async (req, _res, next) => {\n  if (req.path === '/health') return next();
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RoboLearn AI Engine', timestamp: new Date().toISOString() });
});

app.use((req, _res, next) => {
  if (req.url === '/api') req.url = '/';
  else if (req.url.startsWith('/api/')) req.url = req.url.slice(4) || '/';
  next();
});

// The Vercel catch-all receives normalized /components, /auth/*, /ai/*, etc.
app.use(apiRouter);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API error:', error);
  if (res.headersSent) return;
  const message = String(error?.message || '');\n  if (/MONGODB_URI|MongoDB connection failed|MongoDB is not initialized/i.test(message)) {\n    return res.status(503).json({ error: 'Database service is temporarily unavailable. Check the server database configuration.' });\n  }\n  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (error?.message || 'Internal server error.') });
});

export default app;
