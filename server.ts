import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api.js';
import { initDatabase } from './server/db/database.js';
import { requestId, securityHeaders, requireJsonBody } from './server/middleware/security.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(requestId);
  app.use(securityHeaders);
  app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(v => v.trim()) : true }));
  app.use(express.json({ limit: '10mb', strict: true }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(requireJsonBody);

  await initDatabase();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'RoboLearn AI Engine', timestamp: new Date().toISOString() });
  });
  app.use('/api', apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1h', index: false }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found.' });
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    if (res.headersSent) return;
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err?.message || 'Internal server error.') });
  });

  app.listen(PORT, '0.0.0.0', () => console.log(`RoboLearn AI server listening on http://0.0.0.0:${PORT}`));
}

startServer().catch(err => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});
