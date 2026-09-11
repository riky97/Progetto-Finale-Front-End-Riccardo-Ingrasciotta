/**
 * Types for the subset of the AniList GraphQL API this app consumes.
 *
 * Two layers live here on purpose:
 *
 *  1. `AniListMedia` & friends — the raw shapes AniList returns. These mirror
 *     the schema exactly (verified against live queries to
 *     https://graphql.anilist.co) and are only used inside `src/api/`.
 *  2. `Anime` / `AnimeFull` — the flat view model every component renders.
 *     `src/api/anime.ts` maps (1) into (2) so that AniList's nested shape,
 *     0-100 score scale and HTML descriptions are normalised in exactly one
 *     place.
 *
 * Note for future edits: this app used to run on Jikan (MyAnimeList). Nothing
 * here is `mal_id`-keyed any more — AniList ids are its own, genres are plain
 * strings, and scores are integers out of 100.
 */

/* ------------------------------------------------------------------ *
 * Raw AniList shapes
 * ------------------------------------------------------------------ */

export interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AniListTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
}

export interface AniListCoverImage {
  extraLarge: string | null;
  large: string | null;
  medium: string | null;
  color: string | null;
}

export interface AniListFuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AniListStudioNode {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

/**
 * AniList exposes several parallel rankings per title (rated/popular, all-time
 * vs per-year vs per-season), each scoped to the media's own `format`. The
 * detail page uses the `RATED` + `allTime` entry as the closest analogue to a
 * global "rank".
 */
export interface AniListRanking {
  rank: number;
  type: "RATED" | "POPULAR";
  format: string | null;
  year: number | null;
  season: string | null;
  allTime: boolean | null;
  context: string;
}

export interface AniListMedia {
  id: number;
  idMal: number | null;
  title: AniListTitle;
  coverImage: AniListCoverImage | null;
  bannerImage: string | null;
  format: string | null;
  status: string | null;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  season: string | null;
  seasonYear: number | null;
  startDate: AniListFuzzyDate | null;
  endDate: AniListFuzzyDate | null;
  genres: string[] | null;
  source: string | null;
  description: string | null;
  isAdult: boolean | null;
  siteUrl: string | null;
  studios?: { nodes: AniListStudioNode[] } | null;
  rankings?: AniListRanking[] | null;
}

export interface AniListAiringSchedule {
  id: number;
  airingAt: number;
  episode: number;
  media: AniListMedia | null;
}

/* ------------------------------------------------------------------ *
 * App-facing view model
 * ------------------------------------------------------------------ */

/** Pagination envelope shared by every list surface. */
export interface PageInfo {
  /**
   * Total matching titles. AniList hard-caps this at 5000 for broad queries,
   * so treat `>= 5000` as "lots" rather than an exact figure.
   */
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface PagedResponse<T> {
  data: T[];
  pageInfo: PageInfo;
}

/**
 * The core anime resource, flattened from `AniListMedia`. Every list surface
 * returns this same shape, which is why one card component serves them all.
 */
export interface Anime {
  id: number;
  /** Romaji title, falling back to English then native. */
  title: string;
  titleEnglish: string | null;
  titleNative: string | null;
  /** Best available cover art URL. */
  coverImage: string | null;
  bannerImage: string | null;
  /** Display-ready format, e.g. "TV", "Movie", "TV Short". */
  format: string | null;
  /** Display-ready status, e.g. "Finished", "Releasing". */
  status: string | null;
  episodes: number | null;
  /** Minutes per episode. */
  duration: number | null;
  /** AniList's 0-100 integer score. Use `scoreOutOfTen` to display it. */
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  /** Plain strings — AniList has no numeric genre ids. */
  genres: string[];
  season: string | null;
  seasonYear: number | null;
  /** Year the title started airing, for the card's meta line. */
  startYear: number | null;
  /** Human readable air range, e.g. "Sep 29, 2023 – Mar 22, 2024". */
  airedText: string | null;
  /** Description with AniList's inline HTML stripped to plain text. */
  description: string | null;
  source: string | null;
  siteUrl: string | null;
  isAdult: boolean;
}

/** `Media(id:)` — the core resource plus detail-only extras. */
export interface AnimeFull extends Anime {
  studios: AniListStudioNode[];
  /**
   * AniList's all-time "highest rated" position for this format, or null when
   * the title is unranked. This is the nearest equivalent to Jikan's `rank`.
   */
  ratedRank: number | null;
  /** Human readable context for `ratedRank`, e.g. "highest rated all time". */
  ratedRankContext: string | null;
}

/** A genre. AniList's `GenreCollection` is a bare `[String]` — no ids, no counts. */
export interface AnimeGenre {
  /** The genre name, which is also its identity and its URL segment. */
  name: string;
}

/**
 * Formats the top charts expose, lower-cased for the `/topanime/:type` route.
 * These map onto AniList's `MediaFormat` enum in `src/api/anime.ts`.
 */
export type TopAnimeType = "tv" | "movie" | "ova" | "special" | "ona" | "music";

/**
 * Formats the genre filter bar offers. A superset of `TopAnimeType` — the top
 * charts have no "TV Short" route, but the filter bar exposes it. Both map onto
 * AniList's `MediaFormat` through the one table in `src/api/anime.ts`.
 */
export type MediaFormatFilter = TopAnimeType | "tv_short";

/**
 * The `MediaStatus` values the filter bar exposes. CANCELLED and HIATUS are
 * deliberately left out: too niche to be worth a row in the control.
 */
export type MediaStatusFilter = "releasing" | "finished" | "upcoming";

/** Sort orders the genre filter bar offers, mapped to `MediaSort` in `anime.ts`. */
export type GenreSort = "popularity" | "score" | "trending" | "newest" | "title";

/** Weekday used to build the airing-schedule time window. */
export type ScheduleDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
