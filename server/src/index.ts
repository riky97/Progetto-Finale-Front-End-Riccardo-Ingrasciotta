import { createApp } from './app';
import { env } from './env';
import { prisma } from './prisma';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[api] listening on http://localhost:${env.port} (${env.nodeEnv})`);
  console.log(`[api] CORS origins: ${env.corsOrigins.join(', ')}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[api] ${signal} received, shutting down`);
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
  // Don't hang forever on keep-alive connections.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
