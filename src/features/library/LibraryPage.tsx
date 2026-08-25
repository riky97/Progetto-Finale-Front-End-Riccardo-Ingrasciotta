import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { getAnimeByIds } from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import Eyecatch from "@/components/Eyecatch";
import { ErrorState } from "@/components/States";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import { useCollectionState } from "@/hooks/useLibrary";
import type { CollectionName } from "@/api/library";

interface LibraryPageProps {
  collection: CollectionName;
}

const COPY: Record<
  CollectionName,
  { heading: string; emptyTitle: string; emptyBody: string; prompt: string }
> = {
  favorites: {
    heading: "Favourites",
    emptyTitle: "No favourites yet",
    emptyBody:
      "Hit the heart on any title card and it lands here. Start with the top charts.",
    prompt: "Sign in to see the titles you've favourited.",
  },
  watched: {
    heading: "Watched",
    emptyTitle: "Nothing marked watched yet",
    emptyBody:
      "Open any title and mark it watched — this is where your history builds up.",
    prompt: "Sign in to see what you've marked as watched.",
  },
};

/**
 * `/favorites` and `/watched`. Two steps, deliberately:
 *
 *  1. The backend owns the ids (`useCollectionState`, fetched once per session
 *     by `LibraryProvider`).
 *  2. AniList owns the titles. `getAnimeByIds` batches the whole set through
 *     `Page.media(id_in:)` — one request, not one per id.
 *
 * The AniList lookup is keyed on the joined id list, so favouriting or
 * unfavouriting elsewhere in the app re-runs it, and nothing else does.
 */
function LibraryResults({ collection }: LibraryPageProps) {
  const copy = COPY[collection];
  const saved = useCollectionState(collection);
  const idKey = saved.ids.join(",");

  const query = useAnimeQuery(
    () => getAnimeByIds(saved.ids),
    [idKey],
    // Don't hit AniList until the id list has actually arrived.
    { enabled: !saved.loading && !saved.error },
  );

  // A failure fetching the ids is the more useful error to show: without them
  // the AniList query never ran, so it has no error of its own.
  if (saved.error) {
    return <ErrorState error={saved.error} onRetry={saved.refetch} />;
  }

  // Stay in the loading state across the gap between "ids arrived" and
  // "AniList query started", otherwise the empty state flashes for a frame.
  const loading =
    saved.loading ||
    (saved.ids.length > 0 && query.data === undefined && !query.error);

  return (
    <AnimeGrid
      items={query.data}
      loading={loading}
      error={query.error}
      onRetry={query.refetch}
      rows={4}
      paginated
      emptyTitle={copy.emptyTitle}
      emptyBody={copy.emptyBody}
    />
  );
}

export default function LibraryPage({ collection }: LibraryPageProps) {
  const copy = COPY[collection];
  const { pathname } = useLocation();

  return (
    <>
      <Eyecatch title={copy.heading} />

      <SignedIn>
        <LibraryResults collection={collection} />
      </SignedIn>

      {/*
        Signed out: an explicit invitation rather than a redirect. A redirect
        would throw away the URL the user just followed, and these two pages
        are exactly the ones people bookmark. `redirect_url` brings them back
        here the moment they're authenticated.
      */}
      <SignedOut>
        <div className="state">
          <div className="state__mark">SIGNED OUT</div>
          <h3 className="state__title">{copy.heading} are yours alone</h3>
          <p className="state__body">{copy.prompt}</p>
          <Link
            className="lib-toggle lib-toggle--detail lib-toggle--on"
            to={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
          >
            <span className="lib-toggle__text">Sign in</span>
          </Link>
        </div>
      </SignedOut>
    </>
  );
}
