import { Link } from "react-router-dom";
import { getAnimeGenres } from "@/api/anime";
import Eyecatch from "@/components/Eyecatch";
import { ErrorState, LoadingGrid } from "@/components/States";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";

/**
 * The genre list now comes from `/genres/anime` instead of the hardcoded
 * 22-entry array the app used to ship, so it stays in step with MyAnimeList
 * and carries real title counts.
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
              key={genre.mal_id}
              to={`/genre/${genre.mal_id}`}
            >
              <span className="genre-tile__name">{genre.name}</span>
              <span className="genre-tile__count">{genre.count}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );
}
