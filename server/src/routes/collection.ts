import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { clerkUserId, requireUser } from '../middleware/auth';
import { badRequest } from '../errors';

/**
 * `Favorite` and `Watched` are the same shape by design (see
 * prisma/schema.prisma), so both routers are built from this one factory.
 * Only the fields these routes actually touch are typed.
 */
export interface CollectionRow {
  animeId: number;
  createdAt: Date;
}

export interface CollectionDelegate {
  findMany(args: {
    where: { clerkUserId: string };
    select: { animeId: true; createdAt: true };
    orderBy: { createdAt: 'desc' };
  }): Promise<CollectionRow[]>;
  upsert(args: {
    where: { clerkUserId_animeId: { clerkUserId: string; animeId: number } };
    create: { clerkUserId: string; animeId: number };
    update: Record<string, never>;
    select: { animeId: true; createdAt: true };
  }): Promise<CollectionRow>;
  deleteMany(args: {
    where: { clerkUserId: string; animeId: number };
  }): Promise<{ count: number }>;
}

/**
 * AniList media ids are positive 32-bit integers. Reject anything else with a
 * 400 rather than letting Postgres raise an out-of-range error as a 500.
 */
const animeIdSchema = z
  .number()
  .int('animeId must be an integer.')
  .positive('animeId must be a positive integer.')
  .max(2_147_483_647, 'animeId is out of range.');

const bodySchema = z.object({ animeId: animeIdSchema });

function parseAnimeIdParam(raw: string): number {
  // z.coerce.number() would accept "" and "0x10"; be strict about the digits.
  if (!/^\d+$/.test(raw)) {
    throw badRequest(`"${raw}" is not a valid animeId.`);
  }
  const parsed = animeIdSchema.safeParse(Number(raw));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? 'Invalid animeId.');
  }
  return parsed.data;
}

/** Wraps an async handler so rejected promises reach the error middleware. */
function wrap(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res).catch(next);
  };
}

export function createCollectionRouter(delegate: CollectionDelegate): Router {
  const router = Router();

  // Every route in this router requires a verified Clerk user.
  router.use(requireUser);

  // GET /  → { animeIds: number[] }, newest first.
  router.get(
    '/',
    wrap(async (req, res) => {
      const rows = await delegate.findMany({
        where: { clerkUserId: clerkUserId(req) },
        select: { animeId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ animeIds: rows.map((row) => row.animeId) });
    }),
  );

  // POST / { animeId } → 200 { animeId, createdAt }.
  // Idempotent: upsert against the (clerkUserId, animeId) unique constraint, so
  // adding twice is a no-op that returns the original createdAt rather than a 409.
  router.post(
    '/',
    wrap(async (req, res) => {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw badRequest(
          parsed.error.issues[0]?.message ?? 'Body must be { "animeId": <positive integer> }.',
        );
      }
      const row = await delegate.upsert({
        where: {
          clerkUserId_animeId: { clerkUserId: clerkUserId(req), animeId: parsed.data.animeId },
        },
        create: { clerkUserId: clerkUserId(req), animeId: parsed.data.animeId },
        update: {},
        select: { animeId: true, createdAt: true },
      });
      res.status(200).json(row);
    }),
  );

  // DELETE /:animeId → 204, idempotently.
  // Deleting a row that is not there is NOT a 404: the client-side action is
  // "make sure this is not in my list", the end state is identical either way,
  // and a 404 would make an unfavorite button fail after a double click or a
  // stale render. Malformed ids are still a 400.
  router.delete(
    '/:animeId',
    wrap(async (req, res) => {
      // Express 5 types route params as string | string[]; this one is a single segment.
      const raw = req.params.animeId;
      const animeId = parseAnimeIdParam(Array.isArray(raw) ? (raw[0] ?? '') : raw);
      await delegate.deleteMany({ where: { clerkUserId: clerkUserId(req), animeId } });
      res.status(204).end();
    }),
  );

  return router;
}
