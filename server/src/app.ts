import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { env } from './env';
import { errorHandler, notFoundHandler } from './errors';
import { clerkAuth } from './middleware/auth';
import { prisma } from './prisma';
import { createCollectionRouter } from './routes/collection';

export function createApp(): Express {
  const app = express();

  // Railway (and any other proxy) terminates TLS upstream; trust it so
  // req.protocol / req.ip are the client's, not the proxy's.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin: env.corsOrigins,
      // The frontend sends the Clerk token in an Authorization header, not a
      // cookie, but credentials:true keeps Clerk's cookie-based flows working
      // if the app is ever served from the same site.
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );
  app.use(express.json({ limit: '16kb' }));

  // No auth — Railway's healthcheck hits this.
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Clerk populates the auth state for everything below; individual routers
  // enforce it with requireUser.
  app.use(clerkAuth());

  app.use('/api/favorites', createCollectionRouter(prisma.favorite));
  app.use('/api/watched', createCollectionRouter(prisma.watched));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
