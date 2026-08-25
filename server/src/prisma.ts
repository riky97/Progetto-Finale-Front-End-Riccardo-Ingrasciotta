import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';
import { env } from './env';

/**
 * Prisma 7 requires an explicit driver adapter — the connection URL is no
 * longer read from schema.prisma. `@prisma/adapter-pg` wraps node-postgres.
 *
 * A single PrismaClient per process. `tsx watch` re-evaluates modules on
 * reload, so stash it on globalThis to avoid leaking connection pools during
 * development.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.databaseUrl });
  return new PrismaClient({
    adapter,
    log: env.nodeEnv === 'production' ? ['error'] : ['warn', 'error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}
