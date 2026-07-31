import type { ListGridType } from "antd/lib/list";

/**
 * One shared responsive grid definition for every card list in the app.
 * Previously each screen re-declared the same `grid` object and its own
 * near-identical `page(width)` ladder.
 */
export const CARD_GRID: ListGridType = {
  gutter: 24,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
  xxl: 6,
};

/** Columns rendered at a given viewport width, matching {@link CARD_GRID}. */
export function columnsForWidth(width: number): number {
  if (width >= 1600) return 6;
  if (width >= 1200) return 4;
  if (width >= 992) return 3;
  if (width >= 768) return 3;
  if (width >= 576) return 2;
  return 1;
}

/**
 * Page size that always fills whole rows.
 * @param rows how many rows of cards to show per page.
 */
export function pageSizeForWidth(width: number, rows: number): number {
  return columnsForWidth(width) * rows;
}
