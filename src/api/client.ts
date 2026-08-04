import axios, { AxiosError } from "axios";
import { schedule } from "./requestQueue";

/**
 * Defaults to AniList's public GraphQL endpoint. Override with
 * `VITE_ANILIST_URL` (e.g. in `.env.local`) to point at a proxy or a local
 * fixture server. Vite exposes env vars via `import.meta.env`.
 *
 * AniList is a single-endpoint GraphQL API: every call is a POST of
 * `{ query, variables }` to this URL. There are no REST paths.
 */
export const ANILIST_URL =
  import.meta.env.VITE_ANILIST_URL ?? "https://graphql.anilist.co";

const http = axios.create({
  baseURL: ANILIST_URL,
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
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

/** The GraphQL envelope AniList replies with. */
interface GraphQLResponse<T> {
  data: T | null;
  errors?: { message: string; status?: number }[];
}

/**
 * Retryable conditions:
 *  - 429: we exceeded AniList's rate limit (honour `Retry-After` when present).
 *  - 5xx: transient origin trouble.
 *  - no response at all: transient network blip.
 *
 * Note AniList answers *GraphQL* errors (bad field, unknown id) with HTTP 404
 * or 400 plus an `errors` array — those are not retryable and are converted
 * into an `ApiError` directly.
 */
function isRetryable(error: AxiosError): boolean {
  const status = error.response?.status;
  if (status === undefined) return true;
  return status === 429 || status >= 500;
}

function backoffFor(error: AxiosError, attempt: number): number {
  // AniList sends `Retry-After` (seconds) on 429 alongside X-RateLimit-Reset.
  const retryAfter = error.response?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return seconds * 1000;
  }
  // Exponential backoff with jitter.
  return BASE_BACKOFF_MS * 2 ** attempt + Math.random() * 250;
}

function messageFromGraphQLErrors(error: AxiosError): string | undefined {
  const body = error.response?.data as GraphQLResponse<unknown> | undefined;
  const first = body?.errors?.[0]?.message;
  return typeof first === "string" && first.length > 0 ? first : undefined;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 404) {
      return new ApiError("We couldn't find that anime.", 404);
    }
    if (status === 429) {
      return new ApiError(
        "AniList is rate limiting us. Give it a moment and try again.",
        429,
      );
    }
    if (status !== undefined && status >= 500) {
      return new ApiError(
        "AniList is having trouble right now. Please try again shortly.",
        status,
      );
    }
    if (status === undefined) {
      return new ApiError("Network error — check your connection.", undefined);
    }
    // 400-class GraphQL validation failures — surface AniList's own message.
    return new ApiError(messageFromGraphQLErrors(error) ?? error.message, status);
  }

  return new ApiError(
    error instanceof Error ? error.message : "Something went wrong.",
  );
}

/**
 * Execute a GraphQL query against AniList through the shared rate-limit queue,
 * retrying transient failures. Returns the `data` payload.
 *
 * All network access must go through here so the queue cannot be bypassed —
 * calling axios directly from a component reintroduces the 429 storms this was
 * written to prevent.
 */
export async function gqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      // Every attempt goes back through the queue so retries are paced too.
      const response = await schedule(() =>
        http.post<GraphQLResponse<T>>("", { query, variables }),
      );

      const body = response.data;
      if (body.errors && body.errors.length > 0) {
        // HTTP 200 with a GraphQL error array — never retryable.
        throw new ApiError(body.errors[0].message, body.errors[0].status);
      }
      if (body.data === null || body.data === undefined) {
        throw new ApiError("AniList returned an empty response.");
      }
      return body.data;
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
