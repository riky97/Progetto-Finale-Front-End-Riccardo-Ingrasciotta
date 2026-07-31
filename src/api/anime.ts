import { apiGet } from "./client";
import type {
  Anime,
  AnimeFull,
  AnimeGenre,
  JikanItemResponse,
  JikanListResponse,
  ScheduleDay,
  TopAnimeType,
} from "@/types/jikan";

/**
 * Every endpoint below uses the query-parameter form that Jikan v4 actually
 * expects. The previous implementation used v3-shaped path segments
 * (`/top/anime/1/tv`, `/genre/anime/1/1`, `/search/anime?...`) against the v4
 * host, which is why the app returned nothing.
 */

export interface Paged {
  page?: number;
  limit?: number;
}

/** `/top/anime?type=tv&page=1` */
export function getTopAnime(
  type: TopAnimeType,
  { page = 1, limit }: Paged = {},
): Promise<JikanListResponse<Anime>> {
  return apiGet<JikanListResponse<Anime>>("/top/anime", {
    params: { type, page, limit },
  });
}

/** `/seasons/upcoming?page=1` */
export function getUpcomingAnime({
  page = 1,
  limit,
}: Paged = {}): Promise<JikanListResponse<Anime>> {
  return apiGet<JikanListResponse<Anime>>("/seasons/upcoming", {
    params: { page, limit },
  });
}

/**
 * `/schedules?filter=friday`
 * Note: v4 renamed this from v3's `/schedule/{day}` to a plural path with a
 * `filter` query parameter.
 */
export function getScheduleForDay(
  day: ScheduleDay,
  { page = 1, limit }: Paged = {},
): Promise<JikanListResponse<Anime>> {
  return apiGet<JikanListResponse<Anime>>("/schedules", {
    params: { filter: day, page, limit, sfw: true },
  });
}

/**
 * `/anime?q=naruto&page=1&order_by=members&sort=desc`
 * `order_by`/`sort` are documented v4 search params; ordering by `members`
 * descending surfaces well-known titles first, which is what users expect.
 */
export function searchAnime(
  query: string,
  { page = 1, limit = 24 }: Paged = {},
): Promise<JikanListResponse<Anime>> {
  return apiGet<JikanListResponse<Anime>>("/anime", {
    params: {
      q: query,
      page,
      limit,
      order_by: "members",
      sort: "desc",
      sfw: true,
    },
  });
}

/**
 * `/anime?genres=1&page=1`
 * Replaces v3's `/genre/anime/{id}/{page}`.
 */
export function getAnimeByGenre(
  genreId: number,
  { page = 1, limit = 24 }: Paged = {},
): Promise<JikanListResponse<Anime>> {
  return apiGet<JikanListResponse<Anime>>("/anime", {
    params: {
      genres: genreId,
      page,
      limit,
      order_by: "members",
      sort: "desc",
      sfw: true,
    },
  });
}

/**
 * `/anime/{id}/full`
 * Replaces the dead v3 call `https://api.jikan.moe/v3/anime/{id}`.
 */
export async function getAnimeById(id: number): Promise<AnimeFull> {
  const response = await apiGet<JikanItemResponse<AnimeFull>>(
    `/anime/${id}/full`,
  );
  return response.data;
}

/** `/genres/anime` — the real genre list, replacing the hardcoded array. */
export async function getAnimeGenres(): Promise<AnimeGenre[]> {
  const response = await apiGet<JikanListResponse<AnimeGenre>>("/genres/anime");
  return response.data;
}
