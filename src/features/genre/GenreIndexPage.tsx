import { Link } from "react-router-dom";
import { getAnimeGenres } from "@/api/anime";
import Eyecatch from "@/components/Eyecatch";
import { ErrorState, LoadingGrid } from "@/components/States";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";

/**
 * The genre list comes from AniList's `GenreCollection`, which is a bare list
 * of strings — there are no numeric genre ids and no per-genre title counts,
 * so the tiles link by URL-encoded name and the old count badge is gone.
 */
export default function GenreIndexPage() {
  const genres = useAnimeQuery(() => getAnimeGenres(), []);

  return (
    <>
      <Eyecatch
        title="Browse by genre"
        count={genres.data ? `${genres.data.length} genres` : undefined}
      />

      {genres.loading ? <LoadingGrid count={12} /> : null}
      {genres.error ? (
        <ErrorState error={genres.error} onRetry={genres.refetch} />
      ) : null}

      {genres.data ? (
        <div className="genre-grid">
          {genres.data.map((genre) => (
            <Link
              className="genre-tile"
              key={genre.name}
              to={`/genre/${encodeURIComponent(genre.name)}`}
            >
              <span className="genre-tile__name">{genre.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
