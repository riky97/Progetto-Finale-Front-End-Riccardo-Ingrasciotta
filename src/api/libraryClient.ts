import axios from "axios";
import { ApiError } from "./client";

/**
 * The client for *our* backend (`server/`) — user-owned favorites and watched
 * lists. Deliberately separate from `client.ts`:
 *
 *  - `client.ts` is AniList: one GraphQL endpoint, anonymous, and paced by a
 *    28 req/min queue because AniList rate-limits hard.
 *  - This is our own REST API: per-user, authenticated with a Clerk session
 *    token, and under no such rate limit.
 *
 * Sharing one axios instance between them would either push our own traffic
 * through AniList's queue or leak a Bearer token to AniList. They stay apart.
 *
 * `ApiError` is reused, though, so `AnimeGrid`/`ErrorState` render failures
 * from either source identically.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const http = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Clerk's `getToken()` lives behind a React hook, but axios interceptors are
 * module scope. `LibraryProvider` registers the hook's getter here on mount,
 * so every request picks up a *fresh* token (Clerk session tokens are short
 * lived — caching one in a module variable would start 401ing after a minute).
 */
type TokenGetter = () => Promise<string | null>;

let getToken: TokenGetter | null = null;

export function setLibraryTokenGetter(getter: TokenGetter | null): void {
  getToken = getter;
}

http.interceptors.request.use(async (config) => {
  const token = getToken ? await getToken() : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      return new ApiError("Sign in to use your list.", status);
    }
    if (status === undefined) {
      return new ApiError(
        "Can't reach the list service — is the API running?",
        undefined,
      );
    }
    if (status >= 500) {
      return new ApiError(
        "The list service is having trouble. Try again shortly.",
        status,
      );
    }

    // The backend answers 4xx with { error: { message } }.
    const body = error.response?.data as
      | { error?: { message?: string } }
      | undefined;
    return new ApiError(body?.error?.message ?? error.message, status);
  }

  return new ApiError(
    error instanceof Error ? error.message : "Something went wrong.",
  );
}

/** Every call in `library.ts` goes through here so errors normalise once. */
export async function libraryRequest<T>(
  method: "get" | "post" | "delete",
  path: string,
  body?: unknown,
): Promise<T> {
  try {
    const response = await http.request<T>({ method, url: path, data: body });
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export default http;
