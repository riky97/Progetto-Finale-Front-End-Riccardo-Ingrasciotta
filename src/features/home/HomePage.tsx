import { getScheduleForDay, getTopAnime, getUpcomingAnime } from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import SectionSlab from "@/components/SectionSlab";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import { getTodayDay } from "@/shared/getTodayDay";
import OnAirHero from "./OnAirHero";

/**
 * Home fans out four requests. They are not artificially staggered here — the
 * shared client's queue paces them under Jikan's ~3 req/s limit, which is what
 * used to produce 429s when these fired in parallel.
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
        <Skeleton className="h-[27rem] w-full rounded-none bg-paper-2 sm:h-[21rem] lg:h-[23.5rem]" />
      ) : (
        <OnAirHero
          items={schedule.data?.data ?? []}
          day={today.toUpperCase()}
        />
      )}

      <SectionSlab title="Top anime" moreTo="/topanime/tv" />
      <AnimeGrid
        items={topTv.data?.data}
        loading={topTv.loading}
        error={topTv.error}
        onRetry={topTv.refetch}
        ranked
        maxRows={1}
      />

      <SectionSlab title="Top movies" moreTo="/topanime/movie" />
      <AnimeGrid
        items={topMovie.data?.data}
        loading={topMovie.loading}
        error={topMovie.error}
        onRetry={topMovie.refetch}
        ranked
        maxRows={1}
      />

      <SectionSlab title="Upcoming" moreTo="/topanime/upcoming" />
      {/* Seasonal, not ranked — so no numerals here, deliberately. */}
      <AnimeGrid
        items={upcoming.data?.data}
        loading={upcoming.loading}
        error={upcoming.error}
        onRetry={upcoming.refetch}
        maxRows={1}
        emptyTitle="No upcoming titles listed"
        emptyBody="The next season hasn't been announced yet. Check the top charts above."
      />
    </>
  );
}
