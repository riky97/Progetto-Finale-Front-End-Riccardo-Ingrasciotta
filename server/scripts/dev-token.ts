/**
 * Mints a Clerk-shaped session token you can curl the running API with, using
 * a locally generated keypair instead of a live Clerk instance.
 *
 *   npx tsx scripts/dev-token.ts            # reuse/create .dev-keys.json, print a token
 *   npx tsx scripts/dev-token.ts user_abc   # for a specific user id
 *
 * First run writes .dev-keys.json (gitignored) and prints the CLERK_JWT_KEY /
 * CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY lines to paste into server/.env.
 * With those set, `npm run dev` verifies these tokens for real — the same
 * networkless-verification path a production deployment uses, just with a
 * different signing key.
 *
 * Development convenience only. Never put these values in a deployed .env.
 */
import { generateKeyPairSync, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { signJwt } from '@clerk/backend/jwt';

const KEY_FILE = resolve(__dirname, '..', '.dev-keys.json');
const FRONTEND_API = 'devlocal.clerk.accounts.dev';
const ISSUER = `https://${FRONTEND_API}`;
// pk_test_<base64("<frontend-api>$")> — the format @clerk/express parses.
const PUBLISHABLE_KEY = `pk_test_${Buffer.from(`${FRONTEND_API}$`).toString('base64')}`;
const SECRET_KEY = 'sk_test_devlocaldevlocaldevlocaldevlo';

interface Keys {
  publicPem: string;
  privateJwk: JsonWebKey;
}

function loadKeys(): { keys: Keys; created: boolean } {
  if (existsSync(KEY_FILE)) {
    return { keys: JSON.parse(readFileSync(KEY_FILE, 'utf8')) as Keys, created: false };
  }
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const keys: Keys = {
    publicPem: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
    privateJwk: privateKey.export({ format: 'jwk' }) as JsonWebKey,
  };
  writeFileSync(KEY_FILE, JSON.stringify(keys, null, 2));
  return { keys, created: true };
}

async function main(): Promise<void> {
  const { keys, created } = loadKeys();
  const userId = process.argv[2] ?? 'user_devlocal';
  const now = Math.floor(Date.now() / 1000);

  const token = await signJwt(
    {
      azp: 'http://localhost:3000',
      exp: now + 60 * 60,
      iat: now,
      iss: ISSUER,
      nbf: now - 5,
      sid: `sess_${randomUUID().replace(/-/g, '')}`,
      sub: userId,
    },
    keys.privateJwk,
    { algorithm: 'RS256', header: { typ: 'JWT', kid: 'dev-local' } },
  );

  if (created) {
    console.error(`# wrote ${KEY_FILE}`);
    console.error('# paste into server/.env, then restart `npm run dev`:');
    console.error(`CLERK_SECRET_KEY="${SECRET_KEY}"`);
    console.error(`CLERK_PUBLISHABLE_KEY="${PUBLISHABLE_KEY}"`);
    console.error(`CLERK_JWT_KEY="${keys.publicPem.replace(/\n/g, '\\n')}"`);
    console.error('');
  }
  console.error(`# token for ${userId}, valid 1h:`);
  // Token on stdout so it can be captured:  TOKEN=$(npx tsx scripts/dev-token.ts)
  console.log(token);
}

void main();
