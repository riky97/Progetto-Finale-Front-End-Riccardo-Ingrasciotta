import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/api/client";

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: ApiError | undefined;
  /** Re-run the query (used by the "try again" affordance on error states). */
  refetch: () => void;
}

/**
 * Shared async-data hook: every screen gets real `loading` and `error` states
 * instead of ad-hoc `useEffect` + `useState` with `loading={false}` hardcoded.
 *
 * `deps` controls when the query re-runs, exactly like a `useEffect` dep array.
 * Responses from superseded runs are discarded, so a fast second query can
 * never be overwritten by a slow first one.
 */
export function useAnimeQuery<T>(
  queryFn: () => Promise<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean } = {},
): QueryState<T> {
  const { enabled = true } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(undefined);

    queryFn()
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setData(undefined);
        setError(
          err instanceof ApiError
            ? err
            : new ApiError("Something went wrong loading this page."),
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
    // `queryFn` is intentionally omitted: callers pass an inline closure, and
    // `deps` is the explicit cache key for the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, reloadToken]);

  return { data, loading, error, refetch };
}
