import express from 'express';
import cors from 'cors';
import apiRouter from '../server/routes/api.js';
import { initDatabase } from '../server/db/database.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

let databaseInit: Promise<void> | null = null;
function ensureDatabase() {
  if (!databaseInit) databaseInit = initDatabase();
  return databaseInit;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RoboLearn AI Engine' });
});

// Vercel strips /api before invoking this catch-all function, so mount the router at root.
app.use(apiRouter);

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API error:', error);
  res.status(500).json({ error: error?.message || 'Internal server error' });
});

export default app;
