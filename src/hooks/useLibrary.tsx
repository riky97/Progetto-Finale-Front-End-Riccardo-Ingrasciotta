import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { ApiError } from "@/api/client";
import {
  addToCollection,
  getCollection,
  removeFromCollection,
} from "@/api/library";
import type { CollectionName } from "@/api/library";
import { setLibraryTokenGetter } from "@/api/libraryClient";
import { useErrorBanner } from "./useErrorBanner";

/**
 * The user's favorites and watched lists, held once for the whole app.
 *
 * This is a provider rather than a per-component `useAnimeQuery`, because
 * every card in a 24-card grid asks "am I favorited?". Fetching per card would
 * be 24 requests for two lists' worth of ids. The two `GET`s happen once when
 * the session appears, and the answer lives in context.
 *
 * Mutations are optimistic — the icon flips immediately and rolls back if the
 * request fails. Both endpoints are idempotent, so a rollback can never leave
 * the server and the UI disagreeing about a title.
 */

export interface CollectionState {
  /** Saved AniList media ids, newest first. */
  ids: number[];
  has: (animeId: number) => boolean;
  /** True while this id has a request in flight. */
  isPending: (animeId: number) => boolean;
  toggle: (animeId: number) => Promise<void>;
  loading: boolean;
  error: ApiError | undefined;
  refetch: () => void;
}

interface LibraryContextValue {
  favorites: CollectionState;
  watched: CollectionState;
  /** False until Clerk has resolved the session, or when signed out. */
  signedIn: boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const EMPTY_IDS: number[] = [];

/**
 * The shape returned when there is no session — every action is a no-op.
 * A module constant, not a factory, so consumers get a stable identity and
 * don't re-render on every parent render while signed out.
 */
const SIGNED_OUT: CollectionState = {
  ids: EMPTY_IDS,
  has: () => false,
  isPending: () => false,
  toggle: async () => {},
  loading: false,
  error: undefined,
  refetch: () => {},
};

function toApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError("Couldn't update your list. Try that again.");
}

function useCollection(
  collection: CollectionName,
  enabled: boolean,
): CollectionState {
  const [ids, setIds] = useState<number[]>(EMPTY_IDS);
  const [pending, setPending] = useState<number[]>(EMPTY_IDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [reloadToken, setReloadToken] = useState(0);
  const { showError } = useErrorBanner();

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Signing out must drop the previous user's list from memory.
      setIds(EMPTY_IDS);
      setError(undefined);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(undefined);

    getCollection(collection)
      .then((result) => {
        if (active) setIds(result);
      })
      .catch((err: unknown) => {
        if (active) setError(toApiError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [collection, enabled, reloadToken]);

  const has = useCallback((animeId: number) => ids.includes(animeId), [ids]);
  const isPending = useCallback(
    (animeId: number) => pending.includes(animeId),
    [pending],
  );

  const toggle = useCallback(
    async (animeId: number) => {
      if (!enabled) return;

      const saved = ids.includes(animeId);
      const previous = ids;

      // Optimistic: newly saved titles go to the front, matching the backend's
      // `createdAt desc` ordering, so the list does not reshuffle on refetch.
      setIds(
        saved ? ids.filter((id) => id !== animeId) : [animeId, ...ids],
      );
      setPending((current) => [...current, animeId]);
      setError(undefined);

      try {
        if (saved) {
          await removeFromCollection(collection, animeId);
        } else {
          await addToCollection(collection, animeId);
        }
      } catch (err: unknown) {
        setIds(previous);
        setError(toApiError(err));
        // A generic notice, not the raw error: whoever hit this is mid-browse,
        // not looking at a dedicated error screen, so there's nowhere to show
        // network/CORS specifics usefully.
        showError();
      } finally {
        setPending((current) => current.filter((id) => id !== animeId));
      }
    },
    [collection, enabled, ids, showError],
  );

  return useMemo(
    () => ({ ids, has, isPending, toggle, loading, error, refetch }),
    [ids, has, isPending, toggle, loading, error, refetch],
  );
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  // Keep the latest `getToken` in a ref so the axios interceptor always calls
  // the current one without re-registering on every render.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    setLibraryTokenGetter(() => getTokenRef.current());
    return () => setLibraryTokenGetter(null);
  }, []);

  const enabled = isLoaded && Boolean(isSignedIn);

  const favorites = useCollection("favorites", enabled);
  const watched = useCollection("watched", enabled);

  const value = useMemo<LibraryContextValue>(
    () => ({ favorites, watched, signedIn: enabled }),
    [favorites, watched, enabled],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

function useLibrary(): LibraryContextValue {
  const value = useContext(LibraryContext);
  if (!value) {
    // Rendering outside the provider is a wiring bug, not a runtime condition.
    throw new Error("useLibrary must be used inside <LibraryProvider>.");
  }
  return value;
}

export function useFavorites(): CollectionState {
  const { favorites, signedIn } = useLibrary();
  return signedIn ? favorites : SIGNED_OUT;
}

export function useWatched(): CollectionState {
  const { watched, signedIn } = useLibrary();
  return signedIn ? watched : SIGNED_OUT;
}

/** Picks the right collection for the shared `/favorites` + `/watched` page. */
export function useCollectionState(collection: CollectionName): CollectionState {
  const { favorites, watched, signedIn } = useLibrary();
  const state = collection === "favorites" ? favorites : watched;
  return signedIn ? state : SIGNED_OUT;
}
