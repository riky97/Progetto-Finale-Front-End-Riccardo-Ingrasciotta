/**
 * Types for the subset of the Jikan v4 API this app actually consumes.
 *
 * Shapes were verified empirically against the live API against
 * `/top/anime`, `/anime/{id}/full`, `/schedules?filter=<day>` and
 * `/genres/anime` — only the fields the UI reads are modelled here.
 */

/** Every list endpoint wraps its payload in this envelope. */
export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanListResponse<T> {
  data: T[];
  pagination: JikanPagination;
}

export interface JikanItemResponse<T> {
  data: T;
}

export interface JikanImageSet {
  image_url: string | null;
  small_image_url: string | null;
  large_image_url: string | null;
}

export interface JikanImages {
  jpg: JikanImageSet;
  webp: JikanImageSet;
}

/** A named reference to a genre / studio / producer / demographic. */
export interface JikanEntityRef {
  mal_id: number;
  type?: string;
  name: string;
  url: string;
}

export interface JikanAired {
  from: string | null;
  to: string | null;
  /** Human readable range, e.g. "Sep 29, 2023 to Mar 22, 2024". */
  string: string | null;
}

/**
 * The core anime resource. The same shape is returned by `/top/anime`,
 * `/seasons/upcoming`, `/schedules` and `/anime?q=` — which is why every
 * list surface in this app can share one card component.
 */
export interface Anime {
  mal_id: number;
  url: string;
  images: JikanImages;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  aired: JikanAired;
  duration: string | null;
  rating: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  studios: JikanEntityRef[];
  producers: JikanEntityRef[];
  genres: JikanEntityRef[];
  themes: JikanEntityRef[];
  demographics: JikanEntityRef[];
}

export interface JikanRelation {
  relation: string;
  entry: JikanEntityRef[];
}

export interface JikanExternalLink {
  name: string;
  url: string;
}

/** `/anime/{id}/full` — the core resource plus these extras. */
export interface AnimeFull extends Anime {
  relations: JikanRelation[];
  external: JikanExternalLink[];
  streaming: JikanExternalLink[];
}

/** `/genres/anime` entries. */
export interface AnimeGenre {
  mal_id: number;
  name: string;
  url: string;
  count: number;
}

/** Valid `type` values for `/top/anime?type=`. */
export type TopAnimeType = "tv" | "movie" | "ova" | "special" | "ona" | "music";

/** Valid `filter` values for `/schedules?filter=`. */
export type ScheduleDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";
