/**
 * End-to-end smoke test for the auth + CRUD path, runnable without a live
 * Clerk instance.
 *
 *   npx tsx scripts/auth-smoke.ts          (needs Postgres up + migrations applied)
 *
 * How it fakes Clerk without faking our own code:
 *
 *   1. Generates a throwaway RSA-2048 keypair locally.
 *   2. Points CLERK_JWT_KEY at the *public* key. That is the exact same knob a
 *      production deployment uses for networkless verification — Clerk's SDK
 *      verifies session tokens against this PEM instead of fetching the JWKS.
 *   3. Mints a session token with Clerk's own `signJwt` from
 *      `@clerk/backend/jwt`, signed with the matching private key and carrying
 *      the real session-token claim shape (iss/sub/sid/azp/iat/nbf/exp).
 *   4. Boots the *real* app from src/app.ts and makes real HTTP requests.
 *
 * So `clerkMiddleware` → `authenticateRequest` → signature check → claim
 * assertions → `getAuth().userId` all execute unmodified. The only thing
 * substituted is which keypair signs the token. There is no test-only bypass
 * anywhere in src/.
 */
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import type { AddressInfo } from 'node:net';

// Must be set before ./src/env is first imported.
const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const privateJwk = privateKey.export({ format: 'jwk' }) as JsonWebKey;

process.env.NODE_ENV = 'test';
process.env.CLERK_JWT_KEY = publicPem;
// Syntactically valid throwaway keys. @clerk/express parses the publishable key
// to derive the Frontend API origin, so it must be well-formed
// (pk_test_ + base64("<frontend-api>$")) even though no network call is made:
// with CLERK_JWT_KEY set, verification is entirely local.
process.env.CLERK_SECRET_KEY = 'sk_test_smokesmokesmokesmokesmokesmoke';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_c21va2UuY2xlcmsuYWNjb3VudHMuZGV2JA==';
process.env.PORT = '0';

const ISSUER = 'https://smoke.clerk.accounts.dev';

async function mintToken(userId: string, overrides: Record<string, unknown> = {}): Promise<string> {
  const { signJwt } = await import('@clerk/backend/jwt');
  const now = Math.floor(Date.now() / 1000);
  return signJwt(
    {
      azp: 'http://localhost:3000',
      exp: now + 60,
      iat: now,
      iss: ISSUER,
      nbf: now - 5,
      sid: `sess_${randomUUID().replace(/-/g, '')}`,
      sub: userId,
      ...overrides,
    },
    privateJwk,
    { algorithm: 'RS256', header: { typ: 'JWT', kid: 'smoke-test-key' } },
  );
}

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, detail: unknown): void {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label} -> ${JSON.stringify(detail)}`);
  }
}

async function main(): Promise<void> {
  const { createApp } = await import('../src/app');
  const { prisma } = await import('../src/prisma');

  const app = createApp();
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  const userA = `user_smokeA_${randomUUID().slice(0, 8)}`;
  const userB = `user_smokeB_${randomUUID().slice(0, 8)}`;

  type Res = { status: number; body: unknown };
  const call = async (
    method: string,
    path: string,
    token?: string,
    body?: unknown,
  ): Promise<Res> => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  };

  try {
    console.log('\n-- health (no auth) --');
    check('GET /health is 200', (await call('GET', '/health')).status === 200, null);

    console.log('\n-- rejection cases --');
    for (const [label, token] of [
      ['no Authorization header', undefined],
      ['garbage token', 'not-a-jwt'],
      ['well-formed but wrongly signed', 'eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyX3gifQ.bogus'],
    ] as const) {
      const res = await call('GET', '/api/favorites', token);
      check(`GET /api/favorites with ${label} is 401`, res.status === 401, res);
    }

    const expired = await mintToken(userA, {
      exp: Math.floor(Date.now() / 1000) - 3600,
      iat: Math.floor(Date.now() / 1000) - 7200,
      nbf: Math.floor(Date.now() / 1000) - 7200,
    });
    check(
      'expired token is 401',
      (await call('GET', '/api/favorites', expired)).status === 401,
      null,
    );

    const otherKey = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const { signJwt } = await import('@clerk/backend/jwt');
    const now = Math.floor(Date.now() / 1000);
    const foreign = await signJwt(
      { iss: ISSUER, sub: userA, sid: 'sess_x', iat: now, nbf: now - 5, exp: now + 60 },
      otherKey.privateKey.export({ format: 'jwk' }) as JsonWebKey,
      { algorithm: 'RS256', header: { typ: 'JWT' } },
    );
    check(
      'token signed by a different key is 401',
      (await call('GET', '/api/favorites', foreign)).status === 401,
      null,
    );

    console.log('\n-- accepted token --');
    const tokenA = await mintToken(userA);
    const tokenB = await mintToken(userB);
    const list = await call('GET', '/api/favorites', tokenA);
    check('valid token is 200 with empty list', list.status === 200, list);
    check(
      'empty list body is { animeIds: [] }',
      JSON.stringify(list.body) === '{"animeIds":[]}',
      list.body,
    );

    console.log('\n-- favorites CRUD --');
    const add1 = await call('POST', '/api/favorites', tokenA, { animeId: 21 });
    check('POST favorites 21 is 200', add1.status === 200, add1);
    const add2 = await call('POST', '/api/favorites', tokenA, { animeId: 1535 });
    check('POST favorites 1535 is 200', add2.status === 200, add2);

    const addAgain = await call('POST', '/api/favorites', tokenA, { animeId: 21 });
    check('idempotent re-POST of 21 is 200 (no 409)', addAgain.status === 200, addAgain);
    check(
      'idempotent re-POST keeps original createdAt',
      JSON.stringify(addAgain.body) === JSON.stringify(add1.body),
      { first: add1.body, second: addAgain.body },
    );

    const rows = await prisma.favorite.count({ where: { clerkUserId: userA, animeId: 21 } });
    check('unique constraint kept exactly one row for (user, 21)', rows === 1, rows);

    const listed = await call('GET', '/api/favorites', tokenA);
    check(
      'GET favorites reads back both ids, newest first',
      JSON.stringify(listed.body) === '{"animeIds":[1535,21]}',
      listed.body,
    );

    console.log('\n-- per-user isolation --');
    const listB = await call('GET', '/api/favorites', tokenB);
    check("user B does not see user A's favorites", JSON.stringify(listB.body) === '{"animeIds":[]}', listB.body);
    const addB = await call('POST', '/api/favorites', tokenB, { animeId: 21 });
    check('user B can favorite the same animeId', addB.status === 200, addB);

    console.log('\n-- watched is independent --');
    const wList = await call('GET', '/api/watched', tokenA);
    check('watched starts empty for user A', JSON.stringify(wList.body) === '{"animeIds":[]}', wList.body);
    check('POST watched 21 is 200', (await call('POST', '/api/watched', tokenA, { animeId: 21 })).status === 200, null);
    const wAfter = await call('GET', '/api/watched', tokenA);
    check('watched now has 21', JSON.stringify(wAfter.body) === '{"animeIds":[21]}', wAfter.body);
    const fAfter = await call('GET', '/api/favorites', tokenA);
    check('favorites unchanged by watched write', JSON.stringify(fAfter.body) === '{"animeIds":[1535,21]}', fAfter.body);

    console.log('\n-- validation --');
    for (const [label, body] of [
      ['missing animeId', {}],
      ['string animeId', { animeId: '21' }],
      ['float animeId', { animeId: 21.5 }],
      ['negative animeId', { animeId: -1 }],
      ['zero animeId', { animeId: 0 }],
      ['out-of-range animeId', { animeId: 9_999_999_999 }],
    ] as const) {
      const res = await call('POST', '/api/favorites', tokenA, body);
      check(`POST with ${label} is 400`, res.status === 400, res);
    }
    const badParam = await call('DELETE', '/api/favorites/abc', tokenA);
    check('DELETE /api/favorites/abc is 400', badParam.status === 400, badParam);

    console.log('\n-- delete --');
    const del = await call('DELETE', '/api/favorites/21', tokenA);
    check('DELETE existing is 204', del.status === 204, del);
    const afterDel = await call('GET', '/api/favorites', tokenA);
    check('deleted id is gone', JSON.stringify(afterDel.body) === '{"animeIds":[1535]}', afterDel.body);
    const delAgain = await call('DELETE', '/api/favorites/21', tokenA);
    check('DELETE of missing row is idempotent 204', delAgain.status === 204, delAgain);
    const listBStill = await call('GET', '/api/favorites', tokenB);
    check(
      "user A's delete did not touch user B's row",
      JSON.stringify(listBStill.body) === '{"animeIds":[21]}',
      listBStill.body,
    );

    console.log('\n-- unknown route --');
    const unknown = await call('GET', '/api/nope', tokenA);
    check('unknown route is 404', unknown.status === 404, unknown);
  } finally {
    // Clean up the smoke rows so repeat runs stay deterministic.
    const where = { clerkUserId: { startsWith: 'user_smoke' } };
    await prisma.favorite.deleteMany({ where });
    await prisma.watched.deleteMany({ where });
    await prisma.$disconnect();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
