/**
 * One shared responsive grid definition for every card list in the app.
 * Previously each screen re-declared the same grid object and its own
 * near-identical `page(width)` ladder.
 *
 * The class string and {@link columnsForWidth} describe the *same* ladder and
 * must change together — `AnimeGrid` uses the JS version to work out how many
 * cards fill whole rows, and the CSS version to actually lay them out. The
 * breakpoints are Tailwind's defaults (sm 640, lg 1024, xl 1280, 2xl 1536).
 */
export const CARD_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

/** Columns rendered at a given viewport width, matching {@link CARD_GRID_CLASS}. */
export function columnsForWidth(width: number): number {
  if (width >= 1536) return 6;
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  return 2;
}

/**
 * Page size that always fills whole rows.
 * @param rows how many rows of cards to show per page.
 */
export function pageSizeForWidth(width: number, rows: number): number {
  return columnsForWidth(width) * rows;
}
