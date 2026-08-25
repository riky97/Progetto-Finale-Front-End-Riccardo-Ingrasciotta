import { clerkMiddleware, getAuth } from '@clerk/express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { env } from '../env';
import { unauthorized } from '../errors';

/**
 * Clerk verifies the session token itself — we never implement password or
 * session auth here. `clerkMiddleware()` reads the `Authorization: Bearer …`
 * header (or Clerk's session cookie), verifies the JWT's signature, issuer,
 * expiry and not-before, and attaches the resulting auth state to the request.
 *
 * Verification is networkless when `jwtKey` (the PEM public key from the Clerk
 * dashboard) is supplied; otherwise the SDK fetches and caches Clerk's JWKS
 * using the secret key.
 *
 * `clerkMiddleware` never rejects on its own — an absent or invalid token
 * simply yields a signed-out auth state. `requireUser` below is what turns
 * that into a 401, so no route can silently continue unauthenticated.
 */
export function clerkAuth(): RequestHandler {
  return clerkMiddleware({
    secretKey: env.clerkSecretKey,
    publishableKey: env.clerkPublishableKey,
    jwtKey: env.clerkJwtKey,
  });
}

/** Express `Request` after `requireUser` has run. */
export interface AuthedRequest extends Request {
  clerkUserId: string;
}

/**
 * Rejects with 401 unless Clerk produced a verified user id. Must run after
 * `clerkAuth()`.
 */
export function requireUser(req: Request, _res: Response, next: NextFunction): void {
  let userId: string | null | undefined;
  try {
    userId = getAuth(req).userId;
  } catch {
    // getAuth throws if clerkMiddleware was not mounted. Treat as unauthenticated
    // rather than leaking a 500 — but this is a programming error, so log it.
    console.error('[auth] getAuth() failed — is clerkAuth() mounted before this route?');
    next(unauthorized());
    return;
  }

  if (!userId) {
    next(unauthorized('Missing or invalid session token.'));
    return;
  }

  (req as AuthedRequest).clerkUserId = userId;
  next();
}

/** Reads the id `requireUser` attached. Throws if called on an unguarded route. */
export function clerkUserId(req: Request): string {
  const id = (req as Partial<AuthedRequest>).clerkUserId;
  if (!id) {
    throw new Error('clerkUserId() called on a route not guarded by requireUser.');
  }
  return id;
}
