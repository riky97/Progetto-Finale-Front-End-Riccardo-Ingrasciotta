import { List } from "antd";
import type { ApiError } from "@/api/client";
import type { Anime } from "@/types/anilist";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { CARD_GRID, columnsForWidth, pageSizeForWidth } from "@/shared/gridConfig";
import AnimeCard from "./AnimeCard";
import { EmptyState, ErrorState, LoadingGrid } from "./States";

interface AnimeGridProps {
  items: Anime[] | undefined;
  loading: boolean;
  error?: ApiError;
  onRetry?: () => void;
  /** Rows of cards per page. */
  rows?: number;
  /**
   * Render the ranking numeral. Only pass this for lists that genuinely are a
   * ranking (the top charts) — not for seasonal, search or genre results,
   * where position carries no meaning.
   *
   * AniList has no per-title global `rank` field the way Jikan did, so the
   * numeral is positional: the top charts *are* a `SCORE_DESC` page, which
   * makes position the ranking. `rankStart` offsets it so page 2 continues
   * from 25 rather than restarting at 1.
   */
  ranked?: boolean;
  /** 1-based rank of the first item in `items`. Defaults to 1. */
  rankStart?: number;
  emptyTitle?: string;
  emptyBody?: string;
  /** Set false on the home rows, where paging inside a section is noise. */
  paginated?: boolean;
  /**
   * Clamp the list to exactly this many rows at the current breakpoint. Used
   * by the home page, where each section is a single row teasing a "view all"
   * link rather than the whole result set.
   */
  maxRows?: number;
}

/**
 * The single card-list surface. Every screen renders through this, so loading
 * and error states are impossible to forget — which is how the old
 * `loading={false}` hardcoding happened.
 */
export default function AnimeGrid({
  items,
  loading,
  error,
  onRetry,
  rows = 1,
  ranked = false,
  rankStart = 1,
  emptyTitle = "Nothing here yet",
  emptyBody = "Try another section or search for a title.",
  paginated = true,
  maxRows,
}: AnimeGridProps) {
  const { width } = useWindowDimensions();
  const pageSize = pageSizeForWidth(width, rows);

  if (loading) {
    return <LoadingGrid count={maxRows ? columnsForWidth(width) * maxRows : pageSize} />;
  }
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  const visible = maxRows
    ? items.slice(0, columnsForWidth(width) * maxRows)
    : items;

  return (
    <List
      className="card-grid"
      grid={CARD_GRID}
      dataSource={visible}
      pagination={
        paginated && items.length > pageSize
          ? { pageSize, position: "bottom", size: "small" }
          : false
      }
      renderItem={(anime, index) => (
        <List.Item
          key={anime.id}
          style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
        >
          <AnimeCard
            anime={anime}
            rank={ranked ? rankStart + index : undefined}
          />
        </List.Item>
      )}
    />
  );
}
