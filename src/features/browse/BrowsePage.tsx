import { Pagination } from "antd";
import { useSearchParams, useParams } from "react-router-dom";
import {
  getAnimeByGenre,
  getAnimeGenres,
  getTopAnime,
  getUpcomingAnime,
} from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import Eyecatch from "@/components/Eyecatch";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import type { TopAnimeType } from "@/types/jikan";

const TOP_TYPES: TopAnimeType[] = ["tv", "movie", "ova", "special", "ona", "music"];

function isTopType(value: string): value is TopAnimeType {
  return (TOP_TYPES as string[]).includes(value);
}

interface BrowsePageProps {
  mode: "topanime" | "genre";
}

/**
 * The "view all" surface, shared by `/topanime/:type` and `/genre/:genreId`.
 *
 * Paging is server-side and lives in the URL (`?page=2`), so a page of results
 * is linkable and survives back/forward — the old version paged client-side
 * over a single fixed request and tracked its target through `localStorage`.
 */
export default function BrowsePage({ mode }: BrowsePageProps) {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const typeParam = params.type ?? "tv";
  const genreId = Number(params.genreId);

  const query = useAnimeQuery(() => {
    if (mode === "genre") return getAnimeByGenre(genreId, { page });
    if (typeParam === "upcoming") return getUpcomingAnime({ page });
    return getTopAnime(isTopType(typeParam) ? typeParam : "tv", { page });
  }, [mode, typeParam, genreId, page]);

  // Only fetched on genre pages, purely to title the section properly.
  const genres = useAnimeQuery(() => getAnimeGenres(), [], {
    enabled: mode === "genre",
  });
  const genreName = genres.data?.find((g) => g.mal_id === genreId)?.name;

  const pagination = query.data?.pagination;
  const total = pagination?.items.total ?? 0;
  const perPage = pagination?.items.per_page ?? 25;

  const heading =
    mode === "genre"
      ? genreName ?? "Genre"
      : typeParam === "upcoming"
        ? "Upcoming"
        : `Top ${typeParam}`;

  // A ranking numeral only makes sense on the actual top charts.
  const ranked = mode === "topanime" && typeParam !== "upcoming";

  const goToPage = (next: number) => {
    setSearchParams(next === 1 ? {} : { page: String(next) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Eyecatch
        title={heading}
        count={total ? `${total.toLocaleString()} titles` : undefined}
      />

      <AnimeGrid
        items={query.data?.data}
        loading={query.loading}
        error={query.error}
        onRetry={query.refetch}
        ranked={ranked}
        paginated={false}
        rows={4}
        emptyTitle="Nothing in this list"
        emptyBody="Pick another category from the sidebar, or search for a title directly."
      />

      {total > perPage && !query.loading && !query.error ? (
        <Pagination
          current={page}
          total={total}
          pageSize={perPage}
          showSizeChanger={false}
          onChange={goToPage}
        />
      ) : null}
    </>
  );
}
