import type { GenreFilters } from "@/api/anime";
import type {
  GenreSort,
  MediaFormatFilter,
  MediaStatusFilter,
} from "@/types/anilist";

/**
 * The genre browse filters, encoded in the query string.
 *
 * Filter state lives in the URL and nowhere else, exactly like `?page=` and
 * `?q=`: a filtered result set is linkable and back/forward works. Defaults
 * (sort = popularity, everything else unset) are *omitted* from the URL rather
 * than written out, so an unfiltered page stays `/genre/Action`.
 *
 * Param names are short and lowercase: `?sort=score&format=tv&status=releasing
 * &score=7&year=2020`.
 */

export const SORT_OPTIONS: { value: GenreSort; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "score", label: "Score" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "Title A-Z" },
];

export const FORMAT_OPTIONS: { value: MediaFormatFilter; label: string }[] = [
  { value: "tv", label: "TV" },
  { value: "tv_short", label: "TV Short" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Special" },
  { value: "music", label: "Music" },
];

export const STATUS_OPTIONS: { value: MediaStatusFilter; label: string }[] = [
  { value: "releasing", label: "Releasing" },
  { value: "finished", label: "Finished" },
  { value: "upcoming", label: "Not yet released" },
];

/** 0-10 in half steps, matching how `scoreOutOfTen` renders a score. */
export const SCORE_OPTIONS: number[] = [
  9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5,
];

export const DEFAULT_SORT: GenreSort = "popularity";

/** AniList's catalogue thins out fast before the 60s. */
const EARLIEST_YEAR = 1960;

export const YEAR_OPTIONS: number[] = (() => {
  // Next year is included: `seasonYear` is set on announced titles too.
  const newest = new Date().getFullYear() + 1;
  const years: number[] = [];
  for (let year = newest; year >= EARLIEST_YEAR; year -= 1) years.push(year);
  return years;
})();

const isOneOf = <T extends string>(
  options: { value: T }[],
  value: string | null,
): T | undefined =>
  options.find((option) => option.value === value)?.value;

/** Reads the filters out of a query string, ignoring anything unrecognised. */
export function parseGenreFilters(params: URLSearchParams): GenreFilters {
  const sort = isOneOf(SORT_OPTIONS, params.get("sort"));
  const score = Number(params.get("score"));
  const year = Number(params.get("year"));

  return {
    sort: sort ?? DEFAULT_SORT,
    format: isOneOf(FORMAT_OPTIONS, params.get("format")),
    status: isOneOf(STATUS_OPTIONS, params.get("status")),
    minScore: SCORE_OPTIONS.includes(score) ? score : undefined,
    year: YEAR_OPTIONS.includes(year) ? year : undefined,
  };
}

/** True once anything is set that a "Clear filters" button should clear. */
export function hasActiveFilters(filters: GenreFilters): boolean {
  return Boolean(
    (filters.sort && filters.sort !== DEFAULT_SORT) ||
      filters.format ||
      filters.status ||
      filters.minScore ||
      filters.year,
  );
}

/**
 * Serialises filters back to a query string. `page` is deliberately dropped:
 * every filter change produces a new result set, in which the old page number
 * is meaningless, so the caller always lands back on page 1.
 */
export function toSearchParams(filters: GenreFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.sort && filters.sort !== DEFAULT_SORT) {
    params.set("sort", filters.sort);
  }
  if (filters.format) params.set("format", filters.format);
  if (filters.status) params.set("status", filters.status);
  if (filters.minScore) params.set("score", String(filters.minScore));
  if (filters.year) params.set("year", String(filters.year));
  return params;
}
