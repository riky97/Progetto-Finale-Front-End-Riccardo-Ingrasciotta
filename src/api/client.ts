import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { schedule } from "./requestQueue";

/**
 * Defaults to the public Jikan v4 host. Override with `VITE_JIKAN_BASE_URL`
 * (e.g. in `.env.local`) to point at a self-hosted Jikan instance or a local
 * fixture server. Vite exposes env vars via `import.meta.env`, not
 * `process.env` as under Create React App.
 */
export const JIKAN_BASE_URL =
  import.meta.env.VITE_JIKAN_BASE_URL ?? "https://api.jikan.moe/v4";

const http = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 20_000,
  headers: { Accept: "application/json" },
});

/** Error surfaced to the UI. `status` is undefined for network failures. */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const MAX_ATTEMPTS = 4;
const BASE_BACKOFF_MS = 800;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Retryable conditions:
 *  - 429: we exceeded the rate limit (honour `Retry-After` when present).
 *  - 5xx: Jikan's origin is flaky and intermittently 504s on cache misses.
 *  - no response at all: transient network blip.
 */
function isRetryable(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === undefined) return true;
  return status === 429 || status >= 500;
}

function backoffFor(error: AxiosError, attempt: number): number {
  const retryAfter = error.response?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return seconds * 1000;
  }
  // Exponential backoff with jitter.
  return BASE_BACKOFF_MS * 2 ** attempt + Math.random() * 250;
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return new ApiError("We couldn't find that anime.", 404);
    }
    if (status === 429) {
      return new ApiError(
        "The anime database is rate limiting us. Give it a moment and try again.",
        429,
      );
    }
    if (status !== undefined && status >= 500) {
      return new ApiError(
        "The anime database is having trouble right now. Please try again shortly.",
        status,
      );
    }
    if (status === undefined) {
      return new ApiError("Network error — check your connection.", undefined);
    }
    return new ApiError(error.message, status);
  }
  return new ApiError(
    error instanceof Error ? error.message : "Something went wrong.",
  );
}

/**
 * Perform a GET against the Jikan v4 API through the shared rate-limit queue,
 * retrying transient failures. Returns the parsed response body.
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      // Every attempt goes back through the queue so retries are paced too.
      const response = await schedule(() => http.get<T>(url, config));
      return response.data;
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === MAX_ATTEMPTS - 1;
      if (!axios.isAxiosError(error) || !isRetryable(error) || isLastAttempt) {
        break;
      }
      await sleep(backoffFor(error, attempt));
    }
  }

  throw toApiError(lastError);
}

export default http;
