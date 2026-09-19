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

// Vercel rewrites /api/<path> to this function and passes the captured
// path as the __route query parameter. Reconstruct the original Express URL
// before database middleware and route matching run.
app.use((req, _res, next) => {
  const route = typeof req.query.__route === 'string' ? req.query.__route : '';
  if (route) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (key === '__route') continue;
      if (Array.isArray(value)) value.forEach((item) => query.append(key, String(item)));
      else if (value !== undefined) query.set(key, String(value));
    }
    const cleanRoute = route.replace(/^\/+/, '');
    req.url = '/' + cleanRoute + (query.toString() ? '?' + query.toString() : '');
  } else {
    req.url = '/';
  }
  next();
});

app.use(async (req, _res, next) => {
  if (req.path === '/health') return next();
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    databaseInit = null;
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
  const message = String(error?.message || '');
  if (/MONGODB_URI|MongoDB connection failed|MongoDB is not initialized/i.test(message)) {
    return res.status(503).json({ error: 'Database service is temporarily unavailable. Check the server database configuration.' });
  }
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (error?.message || 'Internal server error.') });
});

export default app;
