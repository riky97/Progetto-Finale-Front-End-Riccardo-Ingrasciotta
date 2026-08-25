import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 moved the connection URL out of schema.prisma: the schema's
 * `datasource` block now only declares the provider, and the URL lives here
 * (for CLI commands like `migrate` / `db push`) and in the driver adapter
 * passed to `PrismaClient` at runtime (see src/prisma.ts).
 *
 * Prisma 7 also no longer auto-loads .env, hence the `dotenv/config` import.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
