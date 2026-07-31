import type { ApiError } from "@/api/client";
import type { Anime } from "@/types/jikan";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import {
  CARD_GRID_CLASS,
  columnsForWidth,
  pageSizeForWidth,
} from "@/shared/gridConfig";
import AnimeCard from "./AnimeCard";
import { EmptyState, ErrorState, LoadingGrid } from "./States";

interface AnimeGridProps {
  items: Anime[] | undefined;
  loading: boolean;
  error?: ApiError;
  onRetry?: () => void;
  /** Rows of placeholders to draw while loading. */
  rows?: number;
  /**
   * Render the ranking numeral. Only pass this for lists that genuinely are a
   * ranking (the top charts) — not for seasonal, search or genre results,
   * where position carries no meaning. The numeral shown is the API's own
   * `rank`, not the array index, so it stays correct across pages.
   */
  ranked?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
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
 *
 * Paging is not handled here: it lives in the URL on the screens that need it,
 * so a page of results stays linkable.
 */
export default function AnimeGrid({
  items,
  loading,
  error,
  onRetry,
  rows = 1,
  ranked = false,
  emptyTitle = "Nothing here yet",
  emptyBody = "Try another section or search for a title.",
  maxRows,
}: AnimeGridProps) {
  const { width } = useWindowDimensions();

  if (loading) {
    return <LoadingGrid count={pageSizeForWidth(width, maxRows ?? rows)} />;
  }
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  // Jikan occasionally repeats an entry inside a single page (seen on
  // `/seasons/upcoming`), which renders duplicate cards and duplicate React
  // keys. The list is the wrong place to be surprised by that.
  const unique = Array.from(
    new Map(items.map((anime) => [anime.mal_id, anime])).values(),
  );

  const visible = maxRows
    ? unique.slice(0, columnsForWidth(width) * maxRows)
    : unique;

  return (
    <ul className={CARD_GRID_CLASS}>
      {visible.map((anime, index) => (
        <li
          key={anime.mal_id}
          className="animate-cut-in"
          style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
        >
          <AnimeCard
            anime={anime}
            rank={ranked ? (anime.rank ?? undefined) : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
