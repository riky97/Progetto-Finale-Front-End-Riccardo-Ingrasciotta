import { Link } from "react-router-dom";
import { getAnimeGenres } from "@/api/anime";
import SectionSlab from "@/components/SectionSlab";
import { ErrorState } from "@/components/States";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";

const GENRE_GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

/**
 * The genre list now comes from `/genres/anime` instead of the hardcoded
 * 22-entry array the app used to ship, so it stays in step with MyAnimeList
 * and carries real title counts.
 *
 * The counts are the only numerals here, and they are sorted on: a genre tile
 * is a quantity of work, so the sheet shows how much.
 */
export default function GenreIndexPage() {
  const genres = useAnimeQuery(() => getAnimeGenres(), []);

  const sorted = genres.data
    ? [...genres.data].sort((a, b) => b.count - a.count)
    : undefined;

  return (
    <>
      <SectionSlab
        title="Browse by genre"
        count={sorted ? `${sorted.length} genres` : undefined}
      />

      {genres.loading ? (
        <div className={GENRE_GRID}>
          {Array.from({ length: 20 }, (_, i) => (
            <Skeleton key={i} className="h-20 rounded-none bg-paper-2" />
          ))}
        </div>
      ) : null}

      {genres.error ? (
        <ErrorState error={genres.error} onRetry={genres.refetch} />
      ) : null}

      {sorted ? (
        <ul className={GENRE_GRID}>
          {sorted.map((genre) => (
            <li key={genre.mal_id}>
              <Link
                to={`/genre/${genre.mal_id}`}
                className="group flex h-full flex-col justify-between border-2 border-ink bg-paper px-3.5 py-3 transition-colors hover:bg-ink"
              >
                <span className="font-heading text-sm leading-tight tracking-[0.02em] text-ink group-hover:text-paper">
                  {genre.name}
                </span>
                <span className="mt-4 font-mono text-[0.66rem] tracking-[0.14em] tabular-nums uppercase text-blue-ink group-hover:text-pink">
                  {genre.count.toLocaleString()} titles
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
