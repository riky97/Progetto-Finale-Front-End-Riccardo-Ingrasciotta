import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        'Copy server/.env.example to server/.env and fill it in.',
    );
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : undefined;
}

/**
 * Fail at boot on placeholder Clerk keys rather than on every request.
 * Without this, an unedited `cp .env.example .env` produces an opaque 500 from
 * deep inside the Clerk SDK on every authenticated call.
 */
function assertClerkKeys(secretKey: string, publishableKey: string): void {
  if (!/^sk_(test|live)_.{8,}$/.test(secretKey)) {
    throw new Error(
      'CLERK_SECRET_KEY does not look like a Clerk secret key (expected sk_test_… or sk_live_…). ' +
        'Copy it from https://dashboard.clerk.com → API keys.',
    );
  }

  const match = /^pk_(test|live)_(.+)$/.exec(publishableKey);
  // A publishable key is base64("<frontend-api-host>$").
  const decoded = match ? Buffer.from(match[2], 'base64').toString('utf8') : '';
  if (!decoded.endsWith('$') || !decoded.includes('.')) {
    throw new Error(
      'CLERK_PUBLISHABLE_KEY is not a valid Clerk publishable key (expected pk_test_… or pk_live_…). ' +
        'Copy it from https://dashboard.clerk.com → API keys.',
    );
  }
}

/** The Vite dev server origin from the root CLAUDE.md; always allowed. */
const DEV_ORIGIN = 'http://localhost:3000';

function corsOrigins(): string[] {
  const extra = (optional('CORS_ORIGIN') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return Array.from(new Set([DEV_ORIGIN, ...extra]));
}

const clerkSecretKey = required('CLERK_SECRET_KEY');
const clerkPublishableKey = required('CLERK_PUBLISHABLE_KEY');
assertClerkKeys(clerkSecretKey, clerkPublishableKey);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  /** Render injects PORT; 8080 is the local default. */
  port: Number(process.env.PORT ?? 8080),
  databaseUrl: required('DATABASE_URL'),
  clerkSecretKey,
  /**
   * Required, despite being a public value: @clerk/express throws
   * "Publishable key is missing" from `authenticateRequest` without it — it
   * derives the Frontend API origin from the key. The frontend needs the same
   * key as VITE_CLERK_PUBLISHABLE_KEY.
   */
  clerkPublishableKey,
  /**
   * PEM public key for networkless JWT verification. Optional in production
   * (the SDK falls back to fetching Clerk's JWKS); it is also what the local
   * test harness uses to exercise verification without live Clerk keys.
   */
  clerkJwtKey: optional('CLERK_JWT_KEY'),
  corsOrigins: corsOrigins(),
} as const;
