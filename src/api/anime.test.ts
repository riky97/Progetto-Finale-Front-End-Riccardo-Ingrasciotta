import { afterEach, describe, expect, it, vi } from "vitest";
import type { AniListMedia } from "@/types/anilist";

/**
 * The API layer is the whole point of the AniList migration, so these cover
 * the three things most likely to silently regress: the GraphQL request shape,
 * the normalisation of AniList's payload into the app's flat view model, and
 * the weekday → unix-window arithmetic that replaces Jikan's `?filter=<day>`.
 */

const post = vi.fn();

vi.mock("./client", async () => {
  const actual = await vi.importActual<typeof import("./client")>("./client");
  return {
    ...actual,
    // Exercise the real query strings by capturing what gqlRequest is asked for.
    gqlRequest: (query: string, variables: Record<string, unknown>) =>
      post(query, variables),
  };
});

const {
  getAnimeByGenre,
  getAnimeByIds,
  getAnimeGenres,
  getScheduleForDay,
  getTopAnime,
  normaliseMedia,
  scoreOutOfTen,
  stripHtml,
  weekdayWindow,
} = await import("./anime");

function media(overrides: Partial<AniListMedia> = {}): AniListMedia {
  return {
    id: 154587,
    idMal: 52991,
    title: {
      romaji: "Sousou no Frieren",
      english: "Frieren: Beyond Journey's End",
      native: "葬送のフリーレン",
    },
    coverImage: {
      extraLarge: "https://img/xl.jpg",
      large: "https://img/l.jpg",
      medium: "https://img/m.jpg",
      color: "#bbf1a1",
    },
    bannerImage: "https://img/banner.jpg",
    format: "TV",
    status: "FINISHED",
    episodes: 28,
    duration: 24,
    averageScore: 91,
    meanScore: 91,
    popularity: 466255,
    favourites: 55022,
    season: "FALL",
    seasonYear: 2023,
    startDate: { year: 2023, month: 9, day: 29 },
    endDate: { year: 2024, month: 3, day: 22 },
    genres: ["Adventure", "Drama", "Fantasy"],
    source: "MANGA",
    description: "An elf mage.<br><br>Then <i>more</i> &amp; more.",
    isAdult: false,
    siteUrl: "https://anilist.co/anime/154587",
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("normaliseMedia", () => {
  it("flattens AniList's nested shape into the card view model", () => {
    const anime = normaliseMedia(media());

    expect(anime.id).toBe(154587);
    expect(anime.title).toBe("Sousou no Frieren");
    expect(anime.titleNative).toBe("葬送のフリーレン");
    // Prefers the largest cover AniList offers.
    expect(anime.coverImage).toBe("https://img/xl.jpg");
    expect(anime.startYear).toBe(2023);
    expect(anime.genres).toEqual(["Adventure", "Drama", "Fantasy"]);
  });

  it("humanises AniList's SCREAMING_SNAKE enums for display", () => {
    expect(normaliseMedia(media({ format: "TV_SHORT" })).format).toBe("TV Short");
    expect(normaliseMedia(media({ format: "MOVIE" })).format).toBe("Movie");
    expect(
      normaliseMedia(media({ status: "NOT_YET_RELEASED" })).status,
    ).toBe("Not yet released");
  });

  it("builds a human readable air range from the fuzzy dates", () => {
    expect(normaliseMedia(media()).airedText).toBe("Sep 29, 2023 – Mar 22, 2024");
  });

  it("survives the null-heavy payloads AniList returns for unreleased titles", () => {
    const anime = normaliseMedia(
      media({
        title: { romaji: null, english: null, native: null },
        coverImage: null,
        averageScore: null,
        episodes: null,
        genres: null,
        startDate: { year: null, month: null, day: null },
        endDate: null,
        description: null,
      }),
    );

    expect(anime.title).toBe("Untitled");
    expect(anime.coverImage).toBeNull();
    expect(anime.genres).toEqual([]);
    expect(anime.airedText).toBeNull();
    // Falls back to seasonYear when startDate.year is missing.
    expect(anime.startYear).toBe(2023);
  });
});

describe("scoreOutOfTen", () => {
  it("rescales AniList's 0-100 integer to the UI's 0-10 badge", () => {
    expect(scoreOutOfTen(91)).toBe("9.1");
    expect(scoreOutOfTen(86)).toBe("8.6");
    expect(scoreOutOfTen(100)).toBe("10.0");
  });

  it("returns null for unscored titles rather than '0.0'", () => {
    expect(scoreOutOfTen(null)).toBeNull();
  });
});

describe("stripHtml", () => {
  it("reduces AniList's inline HTML description to plain text", () => {
    expect(stripHtml("An elf mage.<br><br>Then <i>more</i> &amp; more.")).toBe(
      "An elf mage.\n\nThen more & more.",
    );
  });

  it("returns null for empty or absent descriptions", () => {
    expect(stripHtml(null)).toBeNull();
    expect(stripHtml("<br>")).toBeNull();
  });
});

describe("weekdayWindow", () => {
  it("returns a midnight-to-midnight window for today", () => {
    // 2026-08-04 is a Tuesday.
    const now = new Date(2026, 7, 4, 15, 30);
    const { start, end } = weekdayWindow("tuesday", now);

    expect(new Date(start * 1000).getDate()).toBe(4);
    expect(new Date(start * 1000).getHours()).toBe(0);
    expect(end - start).toBe(86_400);
  });

  it("rolls forward to the nearest upcoming occurrence of another weekday", () => {
    const now = new Date(2026, 7, 4, 15, 30); // Tuesday
    const friday = weekdayWindow("friday", now);
    const monday = weekdayWindow("monday", now);

    expect(new Date(friday.start * 1000).getDay()).toBe(5);
    expect(new Date(friday.start * 1000).getDate()).toBe(7);
    // Monday has already passed this week, so it wraps to the next one.
    expect(new Date(monday.start * 1000).getDay()).toBe(1);
    expect(new Date(monday.start * 1000).getDate()).toBe(10);
  });
});

describe("queries", () => {
  it("asks for the right MediaFormat on the top charts", async () => {
    post.mockResolvedValue({ Page: { pageInfo: null, media: [media()] } });

    const result = await getTopAnime("movie", { page: 2, limit: 24 });

    const [query, variables] = post.mock.calls[0];
    expect(query).toContain("sort: SCORE_DESC");
    expect(variables).toMatchObject({ page: 2, perPage: 24, format: "MOVIE" });
    expect(result.data[0].title).toBe("Sousou no Frieren");
  });

  it("clamps perPage to AniList's maximum of 50", async () => {
    post.mockResolvedValue({ Page: { pageInfo: null, media: [] } });

    await getTopAnime("tv", { limit: 500 });

    expect(post.mock.calls[0][1]).toMatchObject({ perPage: 50 });
  });

  it("filters genres by name, since AniList has no numeric genre ids", async () => {
    post.mockResolvedValue({ Page: { pageInfo: null, media: [] } });

    await getAnimeByGenre("Slice of Life", { page: 1 });

    expect(post.mock.calls[0][1]).toMatchObject({ genre: "Slice of Life" });
  });

  it("maps GenreCollection strings to genre objects and drops Hentai", async () => {
    post.mockResolvedValue({
      GenreCollection: ["Action", "Hentai", "Mecha", null],
    });

    expect(await getAnimeGenres()).toEqual([{ name: "Action" }, { name: "Mecha" }]);
  });

  it("dedupes the schedule by media id and drops adult titles", async () => {
    const batchRelease = media({ id: 900, popularity: 10 });
    post.mockResolvedValue({
      Page: {
        pageInfo: null,
        airingSchedules: [
          // One row per episode — the same show three times.
          { id: 1, airingAt: 0, episode: 1, media: batchRelease },
          { id: 2, airingAt: 0, episode: 2, media: batchRelease },
          { id: 3, airingAt: 0, episode: 3, media: batchRelease },
          { id: 4, airingAt: 0, episode: 1, media: media({ id: 901, isAdult: true }) },
          { id: 5, airingAt: 0, episode: 1, media: media({ id: 902, popularity: 999 }) },
          { id: 6, airingAt: 0, episode: 1, media: null },
        ],
      },
    });

    const result = await getScheduleForDay("tuesday", { limit: 10 });

    expect(result.data.map((a) => a.id)).toEqual([902, 900]); // popularity order
  });

  it("fetches a whole id set in one request and keeps the caller's order", async () => {
    post.mockResolvedValue({
      Page: {
        // AniList returns id_in results in its own order, not ours.
        media: [media({ id: 2 }), media({ id: 9 }), media({ id: 5 })],
      },
    });

    const result = await getAnimeByIds([9, 5, 2]);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toContain("id_in: $ids");
    expect(post.mock.calls[0][1]).toMatchObject({ ids: [9, 5, 2], perPage: 3 });
    expect(result.map((a) => a.id)).toEqual([9, 5, 2]);
  });

  it("chunks id sets past AniList's 50-per-page ceiling", async () => {
    post.mockResolvedValue({ Page: { media: [] } });

    await getAnimeByIds(Array.from({ length: 63 }, (_, i) => i + 1));

    expect(post).toHaveBeenCalledTimes(2);
    expect(post.mock.calls[0][1]).toMatchObject({ perPage: 50 });
    expect(post.mock.calls[1][1]).toMatchObject({ perPage: 13 });
  });

  it("skips the request entirely for an empty or invalid id list", async () => {
    expect(await getAnimeByIds([])).toEqual([]);
    expect(await getAnimeByIds([0, -4, NaN])).toEqual([]);
    expect(post).not.toHaveBeenCalled();
  });

  it("drops null media entries AniList can return inside a page", async () => {
    post.mockResolvedValue({ Page: { pageInfo: null, media: [null, media()] } });

    const result = await getTopAnime("tv");
    expect(result.data).toHaveLength(1);
  });
});
