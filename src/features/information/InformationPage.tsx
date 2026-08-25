import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link, useParams } from "react-router-dom";
import { getAnimeById, scoreOutOfTen } from "@/api/anime";
import Eyecatch from "@/components/Eyecatch";
import LibraryToggle from "@/components/LibraryToggle";
import { ErrorState, LoadingGrid } from "@/components/States";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import { useFavorites, useWatched } from "@/hooks/useLibrary";

/**
 * The detail page. The id comes from `useParams` and is an AniList media id
 * (not a MyAnimeList id), fetched through `Media(id:)`.
 */
export default function InformationPage() {
  const { id } = useParams();
  const animeId = Number(id);

  const query = useAnimeQuery(() => getAnimeById(animeId), [animeId], {
    enabled: Number.isFinite(animeId) && animeId > 0,
  });

  // Hooks must run before the early returns below.
  const favorites = useFavorites();
  const watched = useWatched();

  if (query.loading) return <LoadingGrid count={4} />;
  if (query.error) {
    return <ErrorState error={query.error} onRetry={query.refetch} />;
  }

  const anime = query.data;
  if (!anime) return null;

  const poster = anime.coverImage ?? "";

  // Numeric only — status is prose and gets its own line below.
  //
  // "Rank" is AniList's all-time *highest rated* position for this format,
  // the nearest equivalent to the single global rank Jikan used to expose.
  const stats = [
    { label: "Score", value: scoreOutOfTen(anime.averageScore) ?? "—", accent: true },
    { label: "Rank", value: anime.ratedRank ? `#${anime.ratedRank}` : "—" },
    { label: "Episodes", value: anime.episodes ?? "—" },
    { label: "Favourites", value: anime.favourites?.toLocaleString() ?? "—" },
  ];

  return (
    <>
      <Eyecatch
        title={anime.format ?? "Anime"}
        count={anime.airedText ?? undefined}
      />

      <article className="detail">
        <div className="detail__poster">
          {poster ? (
            <img src={poster} alt={`Poster for ${anime.title}`} />
          ) : null}
        </div>

        <div>
          <div className="detail__headline">
            <div style={{ minWidth: 0 }}>
              <h2 className="detail__title">{anime.title}</h2>
              {anime.titleEnglish && anime.titleEnglish !== anime.title ? (
                <p className="detail__romaji">{anime.titleEnglish}</p>
              ) : null}
            </div>
            {anime.titleNative ? (
              <span className="vertical-jp">{anime.titleNative}</span>
            ) : null}
          </div>

          <div className="stat-row">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <div
                  className={
                    stat.accent ? "stat__value stat__value--accent" : "stat__value"
                  }
                >
                  {stat.value}
                </div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="detail__status">
            {[anime.status, anime.studios[0]?.name, anime.source]
              .filter(Boolean)
              .join("  ·  ")}
          </p>

          {/* Unlike the cards, the detail page shows signed-out users what
              they're missing — there is room for one line of copy here, and
              this is the page someone lands on from a shared link. */}
          <div className="lib-actions">
            <SignedIn>
              <LibraryToggle
                variant="detail"
                state={favorites}
                animeId={anime.id}
                animeTitle={anime.title}
                glyph="♥"
                label="Favourite"
                savedLabel="Favourited"
              />
              <LibraryToggle
                variant="detail"
                state={watched}
                animeId={anime.id}
                animeTitle={anime.title}
                glyph="✓"
                label="Mark watched"
                savedLabel="Watched"
              />
            </SignedIn>
            <SignedOut>
              <p className="lib-actions__prompt">
                <Link to="/sign-in">Sign in</Link> to keep favourites and track
                what you&rsquo;ve watched.
              </p>
            </SignedOut>
          </div>

          {anime.genres.length > 0 ? (
            <div className="detail__block">
              <h3>Genres</h3>
              <div className="tag-row">
                {/* AniList genres are plain strings; the route carries the
                    URL-encoded name rather than a numeric id. */}
                {anime.genres.map((genre) => (
                  <Link
                    className="tag"
                    key={genre}
                    to={`/genre/${encodeURIComponent(genre)}`}
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {anime.studios.length > 0 ? (
            <div className="detail__block">
              <h3>Studio</h3>
              <div className="tag-row">
                {anime.studios.map((studio) => (
                  <span className="tag" key={studio.id}>
                    {studio.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detail__block">
            <h3>Synopsis</h3>
            {/* AniList descriptions arrive with inline HTML; the API layer
                strips it to plain text with newlines preserved. */}
            <p className={anime.description ? "prose" : "prose prose--muted"}>
              {anime.description ??
                "No synopsis has been written for this title."}
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
