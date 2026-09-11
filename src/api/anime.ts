import { gqlRequest } from "./client";
import type {
  AniListAiringSchedule,
  AniListMedia,
  AniListPageInfo,
  Anime,
  AnimeFull,
  AnimeGenre,
  GenreSort,
  MediaFormatFilter,
  MediaStatusFilter,
  PagedResponse,
  ScheduleDay,
  TopAnimeType,
} from "@/types/anilist";

/**
 * One function per screen-level query, all posted to AniList's single GraphQL
 * endpoint. Every function returns the flat `Anime` view model, never raw
 * AniList shapes — normalisation lives at the bottom of this file so the score
 * scale, HTML description and nested title/cover objects are handled once.
 *
 * AniList caps `perPage` at 50; asking for more is a validation error.
 */

const MAX_PER_PAGE = 50;

export interface Paged {
  page?: number;
  limit?: number;
}

const clampPerPage = (limit: number | undefined, fallback: number): number =>
  Math.min(MAX_PER_PAGE, Math.max(1, limit ?? fallback));

/* ------------------------------------------------------------------ *
 * Shared GraphQL fragments
 * ------------------------------------------------------------------ */

/** The fields every card needs. Kept minimal — AniList charges complexity. */
const MEDIA_CARD_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large medium color }
  bannerImage
  format
  status
  episodes
  duration
  averageScore
  meanScore
  popularity
  favourites
  season
  seasonYear
  startDate { year month day }
  endDate { year month day }
  genres
  source
  description
  isAdult
  siteUrl
`;

/** Card fields plus the extras only the detail page renders. */
const MEDIA_DETAIL_FIELDS = `
  ${MEDIA_CARD_FIELDS}
  studios(isMain: true) { nodes { id name isAnimationStudio } }
  rankings { rank type format year season allTime context }
`;

const PAGE_INFO_FIELDS = `
  pageInfo { total currentPage lastPage hasNextPage perPage }
`;

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

/**
 * `Page.media(type: ANIME, format: …, sort: SCORE_DESC)`
 *
 * Replaces Jikan's `/top/anime?type=tv`. AniList has no precomputed "top"
 * endpoint — a score-sorted page *is* the chart, which is why the ranking
 * numeral on these lists is positional (see `rankStart` in BrowsePage).
 */
export async function getTopAnime(
  type: TopAnimeType,
  { page = 1, limit }: Paged = {},
): Promise<PagedResponse<Anime>> {
  const query = `
    query TopAnime($page: Int, $perPage: Int, $format: MediaFormat) {
      Page(page: $page, perPage: $perPage) {
        ${PAGE_INFO_FIELDS}
        media(type: ANIME, format: $format, sort: SCORE_DESC, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const data = await gqlRequest<{ Page: RawPage }>(query, {
    page,
    perPage: clampPerPage(limit, 24),
    format: FORMAT_BY_TOP_TYPE[type],
  });

  return toPagedResponse(data.Page);
}

/**
 * `Page.media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC)`
 *
 * Replaces Jikan's `/seasons/upcoming`. Sorting by popularity keeps the
 * recognisable titles first, which is what the home row wants.
 */
export async function getUpcomingAnime({
  page = 1,
  limit,
}: Paged = {}): Promise<PagedResponse<Anime>> {
  const query = `
    query UpcomingAnime($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        ${PAGE_INFO_FIELDS}
        media(
          type: ANIME
          status: NOT_YET_RELEASED
          sort: POPULARITY_DESC
          isAdult: false
        ) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const data = await gqlRequest<{ Page: RawPage }>(query, {
    page,
    perPage: clampPerPage(limit, 24),
  });

  return toPagedResponse(data.Page);
}

/**
 * `Page.airingSchedules(airingAt_greater:, airingAt_lesser:)`
 *
 * AniList has no "day of week" filter, so we compute a unix window for the
 * requested weekday (today, or the nearest upcoming occurrence) and ask for
 * everything broadcasting inside it.
 *
 * Two deliberate deviations from a naive port:
 *  - We over-fetch (50) and re-sort by popularity, because a raw time-ordered
 *    schedule is dominated by long-running Chinese ONAs and would make the
 *    home carousel look broken. Jikan's `/schedules` was implicitly
 *    popularity-weighted; this restores that feel.
 *  - Adult titles are filtered out client-side; `airingSchedules` has no
 *    `isAdult` argument of its own.
 *  - Results are deduplicated by media id. `airingSchedules` returns one row
 *    per *episode*, so a batch release (a whole season dropped at once) would
 *    otherwise repeat the same show across several carousel slides.
 */
export async function getScheduleForDay(
  day: ScheduleDay,
  { limit }: Paged = {},
): Promise<PagedResponse<Anime>> {
  const { start, end } = weekdayWindow(day);

  const query = `
    query DaySchedule($start: Int, $end: Int, $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        ${PAGE_INFO_FIELDS}
        airingSchedules(
          airingAt_greater: $start
          airingAt_lesser: $end
          sort: TIME
        ) {
          id
          airingAt
          episode
          media { ${MEDIA_CARD_FIELDS} }
        }
      }
    }
  `;

  const data = await gqlRequest<{
    Page: { pageInfo: AniListPageInfo; airingSchedules: AniListAiringSchedule[] };
  }>(query, { start, end, perPage: MAX_PER_PAGE });

  const wanted = clampPerPage(limit, 10);

  const byId = new Map<number, AniListMedia>();
  for (const entry of data.Page.airingSchedules ?? []) {
    const media = entry.media;
    if (!media || media.isAdult) continue;
    if (!byId.has(media.id)) byId.set(media.id, media);
  }

  const items = [...byId.values()]
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, wanted)
    .map(normaliseMedia);

  return {
    data: items,
    pageInfo: { ...toPageInfo(data.Page.pageInfo), total: items.length },
  };
}

/**
 * `Page.media(type: ANIME, search: $query, sort: SEARCH_MATCH)`
 *
 * Replaces Jikan's `/anime?q=`. `SEARCH_MATCH` is AniList's relevance sort and
 * behaves far better than ordering by popularity for exact-title lookups.
 */
export async function searchAnime(
  query: string,
  { page = 1, limit }: Paged = {},
): Promise<PagedResponse<Anime>> {
  const document = `
    query SearchAnime($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        ${PAGE_INFO_FIELDS}
        media(type: ANIME, search: $search, sort: SEARCH_MATCH, isAdult: false) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const data = await gqlRequest<{ Page: RawPage }>(document, {
    search: query,
    page,
    perPage: clampPerPage(limit, 24),
  });

  return toPagedResponse(data.Page);
}

/** Optional server-side narrowing for the genre browse page. */
export interface GenreFilters {
  /** Defaults to `popularity`. */
  sort?: GenreSort;
  format?: MediaFormatFilter;
  status?: MediaStatusFilter;
  /**
   * Minimum score on the UI's 0-10 scale (`scoreOutOfTen`'s scale), converted
   * to AniList's 0-100 integer here. Omit for "any score" — do not pass 0,
   * which AniList reads as the real filter "scored above zero".
   */
  minScore?: number;
  /** `seasonYear`, e.g. 2020. */
  year?: number;
}

/**
 * `Page.media(type: ANIME, genre: $genre, sort: $sort, …)`
 *
 * AniList genres are plain strings, so `genre` here is a name such as
 * "Slice of Life" — not a numeric id. The `/genre/:genreId` route carries the
 * URL-encoded name.
 *
 * All narrowing is server-side: every filter is a native `Media(…)` argument,
 * never a post-filter over a downloaded page (which would silently shrink the
 * page size and break paging). Unset filters are left out of the variables map
 * entirely rather than sent as `null`, so the argument is genuinely absent.
 */
export async function getAnimeByGenre(
  genre: string,
  { page = 1, limit, sort, format, status, minScore, year }: Paged &
    GenreFilters = {},
): Promise<PagedResponse<Anime>> {
  const query = `
    query GenreAnime(
      $genre: String
      $page: Int
      $perPage: Int
      $sort: [MediaSort]
      $format: MediaFormat
      $status: MediaStatus
      $minScore: Int
      $year: Int
    ) {
      Page(page: $page, perPage: $perPage) {
        ${PAGE_INFO_FIELDS}
        media(
          type: ANIME
          genre: $genre
          sort: $sort
          format: $format
          status: $status
          averageScore_greater: $minScore
          seasonYear: $year
          isAdult: false
        ) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const variables: Record<string, unknown> = {
    genre,
    page,
    perPage: clampPerPage(limit, 24),
    sort: MEDIA_SORT_BY_FILTER[sort ?? "popularity"],
  };

  if (format) variables.format = FORMAT_BY_FILTER[format];
  if (status) variables.status = MEDIA_STATUS_BY_FILTER[status];
  if (year) variables.year = year;
  // `averageScore_greater` is strictly greater, so a UI choice of "7.0+" has to
  // ask for > 69 if a title scoring exactly 70 is to be included.
  if (minScore && minScore > 0) {
    variables.minScore = Math.round(minScore * 10) - 1;
  }

  const data = await gqlRequest<{ Page: RawPage }>(query, variables);

  return toPagedResponse(data.Page);
}

/** `Media(id: $id, type: ANIME)` — replaces Jikan's `/anime/{id}/full`. */
export async function getAnimeById(id: number): Promise<AnimeFull> {
  const query = `
    query AnimeDetail($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_DETAIL_FIELDS}
      }
    }
  `;

  const data = await gqlRequest<{ Media: AniListMedia | null }>(query, { id });
  if (!data.Media) {
    throw new Error("We couldn't find that anime.");
  }
  return normaliseMediaFull(data.Media);
}

/**
 * `Page.media(id_in: $ids)` — one request for a whole set of ids.
 *
 * Backs `/favorites` and `/watched`, where the backend hands us a bare list of
 * AniList media ids. Looping `getAnimeById` would burn one queue slot per
 * title and blow through AniList's 30 req/min in a list of any size; `id_in`
 * fetches up to `perPage` (50) of them in a single query.
 *
 * Two things worth knowing:
 *  - AniList ignores the order of `id_in`, so results are re-sorted to match
 *    the order the caller passed (the backend returns newest-saved first, and
 *    that is the order the page should render).
 *  - Sets larger than 50 are chunked. The chunks still go through `gqlRequest`,
 *    so the rate-limit queue paces them.
 */
export async function getAnimeByIds(ids: number[]): Promise<Anime[]> {
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id) && id > 0))];
  if (unique.length === 0) return [];

  const query = `
    query AnimeByIds($ids: [Int], $perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(id_in: $ids, type: ANIME) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const chunks: number[][] = [];
  for (let i = 0; i < unique.length; i += MAX_PER_PAGE) {
    chunks.push(unique.slice(i, i + MAX_PER_PAGE));
  }

  const byId = new Map<number, Anime>();
  for (const chunk of chunks) {
    const data = await gqlRequest<{ Page: { media: (AniListMedia | null)[] } }>(
      query,
      { ids: chunk, perPage: chunk.length },
    );
    for (const media of data.Page.media ?? []) {
      if (media) byId.set(media.id, normaliseMedia(media));
    }
  }

  // Restore the caller's order; ids AniList no longer knows about are dropped.
  return unique
    .map((id) => byId.get(id))
    .filter((anime): anime is Anime => Boolean(anime));
}

/**
 * `GenreCollection` — a bare `[String]`.
 *
 * Unlike Jikan's `/genres/anime` this carries no per-genre title counts, and
 * there is no cheap way to derive them (it would take one query per genre).
 * The count badge was dropped from the genre tiles rather than faked.
 *
 * "Hentai" is filtered out to match the `isAdult: false` filter every list
 * query already applies — leaving it in would link to a guaranteed-empty page.
 */
export async function getAnimeGenres(): Promise<AnimeGenre[]> {
  const query = `query GenreList { GenreCollection }`;

  const data = await gqlRequest<{ GenreCollection: (string | null)[] }>(query);

  return (data.GenreCollection ?? [])
    .filter((name): name is string => Boolean(name) && name !== "Hentai")
    .map((name) => ({ name }));
}

/* ------------------------------------------------------------------ *
 * Weekday → unix window
 * ------------------------------------------------------------------ */

const DAY_INDEX: Record<ScheduleDay, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * Local-midnight-to-midnight unix seconds for the next occurrence of `day`,
 * counting today as the nearest occurrence. Exported for tests.
 */
export function weekdayWindow(
  day: ScheduleDay,
  now: Date = new Date(),
): { start: number; end: number } {
  const target = DAY_INDEX[day];
  const offset = (target - now.getDay() + 7) % 7;

  const start = new Date(now);
  start.setDate(start.getDate() + offset);
  start.setHours(0, 0, 0, 0);

  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(start.getTime() / 1000) + 86_400,
  };
}

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

interface RawPage {
  pageInfo: AniListPageInfo;
  media: (AniListMedia | null)[];
}

const FORMAT_BY_TOP_TYPE: Record<TopAnimeType, string> = {
  tv: "TV",
  movie: "MOVIE",
  ova: "OVA",
  special: "SPECIAL",
  ona: "ONA",
  music: "MUSIC",
};

/**
 * The genre filter bar's formats: the top-chart routes plus TV_SHORT, which has
 * no route of its own. Extends the table above rather than duplicating it, so
 * there is still exactly one `MediaFormat` mapping in the app.
 */
const FORMAT_BY_FILTER: Record<MediaFormatFilter, string> = {
  ...FORMAT_BY_TOP_TYPE,
  tv_short: "TV_SHORT",
};

const MEDIA_SORT_BY_FILTER: Record<GenreSort, string> = {
  popularity: "POPULARITY_DESC",
  score: "SCORE_DESC",
  trending: "TRENDING_DESC",
  newest: "START_DATE_DESC",
  // Romaji, because that is the title `normaliseMedia` puts on the card first.
  title: "TITLE_ROMAJI",
};

const MEDIA_STATUS_BY_FILTER: Record<MediaStatusFilter, string> = {
  releasing: "RELEASING",
  finished: "FINISHED",
  upcoming: "NOT_YET_RELEASED",
};

/** AniList screams its enums; the UI does not. */
const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

const STATUS_LABELS: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Releasing",
  NOT_YET_RELEASED: "Not yet released",
  CANCELLED: "Cancelled",
  HIATUS: "Hiatus",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Title-cases an AniList SCREAMING_SNAKE enum as a fallback label. */
function humaniseEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFuzzyDate(date: {
  year: number | null;
  month: number | null;
  day: number | null;
} | null): string | null {
  if (!date?.year) return null;
  if (!date.month) return String(date.year);
  const month = MONTHS[date.month - 1] ?? "";
  return date.day
    ? `${month} ${date.day}, ${date.year}`
    : `${month} ${date.year}`;
}

/**
 * AniList descriptions are HTML-ish: `<br>`, `<i>`, `<b>`, occasional
 * `<a href>` and HTML entities. The UI renders them as plain text, so strip
 * tags to whitespace-normalised prose rather than dangerously setting HTML.
 */
export function stripHtml(input: string | null): string | null {
  if (!input) return null;

  const text = input
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text.length > 0 ? text : null;
}

/**
 * AniList scores are integers out of 100; the UI's badge was built for a 0-10
 * figure. Convert once, here, so no component has to remember the scale.
 */
export function scoreOutOfTen(averageScore: number | null): string | null {
  if (averageScore === null || averageScore === undefined) return null;
  return (averageScore / 10).toFixed(1);
}

function bestCover(media: AniListMedia): string | null {
  return (
    media.coverImage?.extraLarge ??
    media.coverImage?.large ??
    media.coverImage?.medium ??
    null
  );
}

function airedText(media: AniListMedia): string | null {
  const from = formatFuzzyDate(media.startDate);
  const to = formatFuzzyDate(media.endDate);
  if (from && to && from !== to) return `${from} – ${to}`;
  return from ?? null;
}

export function normaliseMedia(media: AniListMedia): Anime {
  const title =
    media.title?.romaji ??
    media.title?.english ??
    media.title?.native ??
    "Untitled";

  return {
    id: media.id,
    title,
    titleEnglish: media.title?.english ?? null,
    titleNative: media.title?.native ?? null,
    coverImage: bestCover(media),
    bannerImage: media.bannerImage ?? null,
    format: media.format
      ? FORMAT_LABELS[media.format] ?? humaniseEnum(media.format)
      : null,
    status: media.status
      ? STATUS_LABELS[media.status] ?? humaniseEnum(media.status)
      : null,
    episodes: media.episodes ?? null,
    duration: media.duration ?? null,
    averageScore: media.averageScore ?? null,
    popularity: media.popularity ?? null,
    favourites: media.favourites ?? null,
    genres: media.genres ?? [],
    season: media.season ? humaniseEnum(media.season) : null,
    seasonYear: media.seasonYear ?? null,
    startYear: media.startDate?.year ?? media.seasonYear ?? null,
    airedText: airedText(media),
    description: stripHtml(media.description),
    source: media.source ? humaniseEnum(media.source) : null,
    siteUrl: media.siteUrl ?? null,
    isAdult: Boolean(media.isAdult),
  };
}

function normaliseMediaFull(media: AniListMedia): AnimeFull {
  // The closest analogue to Jikan's global `rank`: AniList's all-time
  // "highest rated" position, scoped to this title's own format.
  const rated = (media.rankings ?? []).find(
    (entry) => entry.type === "RATED" && entry.allTime === true,
  );

  return {
    ...normaliseMedia(media),
    studios: media.studios?.nodes ?? [],
    ratedRank: rated?.rank ?? null,
    ratedRankContext: rated?.context ?? null,
  };
}

function toPageInfo(info: AniListPageInfo | null | undefined) {
  return {
    total: info?.total ?? 0,
    currentPage: info?.currentPage ?? 1,
    lastPage: info?.lastPage ?? 1,
    hasNextPage: info?.hasNextPage ?? false,
    perPage: info?.perPage ?? 24,
  };
}

function toPagedResponse(page: RawPage): PagedResponse<Anime> {
  return {
    data: (page.media ?? [])
      .filter((media): media is AniListMedia => Boolean(media))
      .map(normaliseMedia),
    pageInfo: toPageInfo(page.pageInfo),
  };
}
