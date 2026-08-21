import {
  getAnimeGenres,
  getScheduleForDay,
  getTopAnime,
  getUpcomingAnime,
} from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import Eyecatch from "@/components/Eyecatch";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import { getTodayDay } from "@/shared/getTodayDay";
import EyecatchCarousel from "./EyecatchCarousel";
import GenreRail from "./GenreRail";

const HOME_GENRE_LIMIT = 20;

/**
 * Home fans out four AniList queries. They are not artificially staggered here
 * — the shared client's queue paces them under AniList's per-minute budget.
 */
export default function HomePage() {
  const today = getTodayDay();

  const schedule = useAnimeQuery(
    () => getScheduleForDay(today, { limit: 10 }),
    [today],
  );
  const topTv = useAnimeQuery(() => getTopAnime("tv", { limit: 24 }), []);
  const topMovie = useAnimeQuery(() => getTopAnime("movie", { limit: 24 }), []);
  const upcoming = useAnimeQuery(() => getUpcomingAnime({ limit: 24 }), []);
  const genres = useAnimeQuery(() => getAnimeGenres(), []);

  return (
    <>
      {schedule.loading ? (
        <div className="skeleton-card" style={{ aspectRatio: "auto", height: 380 }} />
      ) : (
        <EyecatchCarousel
          items={schedule.data?.data ?? []}
          day={today.toUpperCase()}
        />
      )}

      <Eyecatch
        title="Top anime"
        count={topTv.data ? `${topTv.data.data.length} titles` : undefined}
        moreTo="/topanime/tv"
      />
      <AnimeGrid
        items={topTv.data?.data}
        loading={topTv.loading}
        error={topTv.error}
        onRetry={topTv.refetch}
        ranked
        paginated={false}
        maxRows={1}
        rows={1}
      />

      <Eyecatch
        title="Top movies"
        count={topMovie.data ? `${topMovie.data.data.length} titles` : undefined}
        moreTo="/topanime/movie"
      />
      <AnimeGrid
        items={topMovie.data?.data}
        loading={topMovie.loading}
        error={topMovie.error}
        onRetry={topMovie.refetch}
        ranked
        paginated={false}
        maxRows={1}
        rows={1}
      />

      <Eyecatch
        title="Upcoming"
        count={upcoming.data ? `${upcoming.data.data.length} titles` : undefined}
        moreTo="/topanime/upcoming"
      />
      {/* Seasonal, not ranked — so no numerals here, deliberately. */}
      <AnimeGrid
        items={upcoming.data?.data}
        loading={upcoming.loading}
        error={upcoming.error}
        onRetry={upcoming.refetch}
        paginated={false}
        maxRows={1}
        rows={1}
        emptyTitle="No upcoming titles listed"
        emptyBody="The next season hasn't been announced yet. Check the top charts above."
      />

      <Eyecatch title="Categories" moreTo="/genre" moreLabel="Browse all" />
      {genres.data ? (
        <GenreRail genres={genres.data.slice(0, HOME_GENRE_LIMIT).map((g) => g.name)} />
      ) : null}
    </>
  );
}
