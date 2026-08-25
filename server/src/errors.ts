import type { NextFunction, Request, Response } from 'express';

/**
 * Every error this API sends deliberately serialises to the same shape:
 *   { "error": { "code": "…", "message": "…" } }
 * so the frontend can branch on `code` without sniffing status codes.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string, code = 'invalid_request') =>
  new HttpError(400, code, message);

export const unauthorized = (message = 'Authentication required.') =>
  new HttpError(401, 'unauthorized', message);

export const notFound = (message = 'Not found.') => new HttpError(404, 'not_found', message);

/** Terminal 404 for unmatched routes. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(notFound(`No route for ${req.method} ${req.path}.`));
}

/** Terminal error handler. Must keep all four parameters for Express to see it. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // Clerk's middleware throws errors carrying a status; surface them as 401
  // rather than as an opaque 500.
  const status = (err as { status?: number } | null)?.status;
  if (status === 401 || status === 403) {
    res.status(401).json({
      error: { code: 'unauthorized', message: 'Invalid or expired session token.' },
    });
    return;
  }

  console.error('[api] unhandled error:', err);
  res.status(500).json({
    error: { code: 'internal_error', message: 'Something went wrong.' },
  });
}
