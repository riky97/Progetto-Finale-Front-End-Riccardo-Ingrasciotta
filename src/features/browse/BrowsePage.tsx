import { Pagination } from "antd";
import { useSearchParams, useParams } from "react-router-dom";
import { getAnimeByGenre, getTopAnime, getUpcomingAnime } from "@/api/anime";
import AnimeGrid from "@/components/AnimeGrid";
import Eyecatch from "@/components/Eyecatch";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import type { TopAnimeType } from "@/types/anilist";
import FilterBar from "./FilterBar";
import {
  hasActiveFilters,
  parseGenreFilters,
  toSearchParams,
} from "./genreFilters";
import type { GenreFilters } from "@/api/anime";

const TOP_TYPES: TopAnimeType[] = ["tv", "movie", "ova", "special", "ona", "music"];

function isTopType(value: string): value is TopAnimeType {
  return (TOP_TYPES as string[]).includes(value);
}

/** Fixed page size so the positional rank numerals stay stable across pages. */
const PER_PAGE = 24;

/**
 * AniList caps `pageInfo.total` at 5000 for broad queries, so anything at or
 * above the cap is not a real count and should not be printed as one.
 */
const TOTAL_CAP = 5000;

interface BrowsePageProps {
  mode: "topanime" | "genre";
}

/**
 * The "view all" surface, shared by `/topanime/:type` and `/genre/:genreId`.
 *
 * Paging is server-side and lives in the URL (`?page=2`), so a page of results
 * is linkable and survives back/forward.
 *
 * Note the `:genreId` param is an AniList *genre name* (URL-encoded), not a
 * numeric id — AniList has no numeric genre ids.
 */
export default function BrowsePage({ mode }: BrowsePageProps) {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const typeParam = params.type ?? "tv";
  // react-router already percent-decodes params, so this is the plain name.
  const genreName = params.genreId ?? "";

  // Filters apply to the genre surface only; the top charts are a fixed chart.
  const filters = parseGenreFilters(searchParams);
  const { sort, format, status, minScore, year } = filters;

  const query = useAnimeQuery(() => {
    if (mode === "genre") {
      return getAnimeByGenre(genreName, {
        page,
        limit: PER_PAGE,
        sort,
        format,
        status,
        minScore,
        year,
      });
    }
    if (typeParam === "upcoming") {
      return getUpcomingAnime({ page, limit: PER_PAGE });
    }
    return getTopAnime(isTopType(typeParam) ? typeParam : "tv", {
      page,
      limit: PER_PAGE,
    });
  }, [mode, typeParam, genreName, page, sort, format, status, minScore, year]);

  const pageInfo = query.data?.pageInfo;
  const total = pageInfo?.total ?? 0;
  const perPage = pageInfo?.perPage ?? PER_PAGE;

  const heading =
    mode === "genre"
      ? genreName || "Genre"
      : typeParam === "upcoming"
        ? "Upcoming"
        : `Top ${typeParam}`;

  // A ranking numeral only makes sense on the actual top charts. On AniList
  // those are a SCORE_DESC page, so rank is positional and continues across
  // pages rather than restarting at 1.
  const ranked = mode === "topanime" && typeParam !== "upcoming";
  const filtered = mode === "genre" && hasActiveFilters(filters);
  const rankStart = (page - 1) * perPage + 1;

  const goToPage = (next: number) => {
    // Paging keeps the active filters; only the page number changes.
    const params = toSearchParams(filters);
    if (next !== 1) params.set("page", String(next));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Any filter change is a new result set, so the old page number is dropped —
  // `toSearchParams` never writes `page`, which lands the user back on page 1.
  const applyFilters = (next: GenreFilters) => {
    setSearchParams(toSearchParams(next));
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <>
      <Eyecatch
        title={heading}
        count={
          total > 0 && total < TOTAL_CAP
            ? `${total.toLocaleString()} titles`
            : undefined
        }
      />

      {mode === "genre" ? (
        <FilterBar
          filters={filters}
          onChange={applyFilters}
          onClear={clearFilters}
        />
      ) : null}

      <AnimeGrid
        items={query.data?.data}
        loading={query.loading}
        error={query.error}
        onRetry={query.refetch}
        ranked={ranked}
        rankStart={rankStart}
        paginated={false}
        rows={4}
        emptyTitle={filtered ? "Nothing matches those filters" : "Nothing in this list"}
        emptyBody={
          filtered
            ? "Try widening the score, year or format — or clear the filters to see the whole genre."
            : "Pick another category from the sidebar, or search for a title directly."
        }
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
