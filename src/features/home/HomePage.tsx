import {
  getScheduleForDay,
  getTopAnime,
  getUpcomingAnime,
} from "@/api/anime";
import AnimeRail from "@/components/AnimeRail";
import Eyecatch from "@/components/Eyecatch";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import { getTodayDay } from "@/shared/getTodayDay";
import EyecatchCarousel from "./EyecatchCarousel";

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
      <AnimeRail
        items={topTv.data?.data}
        loading={topTv.loading}
        error={topTv.error}
        onRetry={topTv.refetch}
        ranked
      />

      <Eyecatch
        title="Top movies"
        count={topMovie.data ? `${topMovie.data.data.length} titles` : undefined}
        moreTo="/topanime/movie"
      />
      <AnimeRail
        items={topMovie.data?.data}
        loading={topMovie.loading}
        error={topMovie.error}
        onRetry={topMovie.refetch}
        ranked
      />

      <Eyecatch
        title="Upcoming"
        count={upcoming.data ? `${upcoming.data.data.length} titles` : undefined}
        moreTo="/topanime/upcoming"
      />
      {/* Seasonal, not ranked — so no numerals here, deliberately. */}
      <AnimeRail
        items={upcoming.data?.data}
        loading={upcoming.loading}
        error={upcoming.error}
        onRetry={upcoming.refetch}
        emptyTitle="No upcoming titles listed"
        emptyBody="The next season hasn't been announced yet. Check the top charts above."
      />
    </>
  );
}
