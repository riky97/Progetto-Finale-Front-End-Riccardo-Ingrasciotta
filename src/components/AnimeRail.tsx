import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError } from "@/api/client";
import type { Anime } from "@/types/anilist";
import AnimeCard from "./AnimeCard";
import { EmptyState, ErrorState, LoadingGrid } from "./States";

interface AnimeRailProps {
  items: Anime[] | undefined;
  loading: boolean;
  error?: ApiError;
  onRetry?: () => void;
  /**
   * Render the ranking numeral. Only pass this for lists that genuinely are a
   * ranking (the top charts) — not for seasonal, search or genre results,
   * where position carries no meaning.
   */
  ranked?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}

/** How far one arrow press scrolls, as a fraction of the visible track width. */
const SCROLL_STEP = 0.9;

/**
 * A horizontally scrollable row of title cards, framed by two arrow buttons —
 * the home page's "slick" row for a section that teases a "view all" link
 * rather than a full paginated grid (that's what {@link AnimeGrid} is for).
 */
export default function AnimeRail({
  items,
  loading,
  error,
  onRetry,
  ranked = false,
  emptyTitle = "Nothing here yet",
  emptyBody = "Try another section or search for a title.",
}: AnimeRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges, items]);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (loading) return <LoadingGrid count={6} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!items || items.length === 0) {
    return <EmptyState title={emptyTitle} body={emptyBody} />;
  }

  return (
    <div className="anime-rail">
      <button
        type="button"
        className="anime-rail__arrow"
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
      >
        ‹
      </button>

      <div className="anime-rail__track" ref={trackRef} onScroll={updateEdges}>
        {items.map((anime, index) => (
          <div
            className="anime-rail__item"
            key={anime.id}
            style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
          >
            <AnimeCard anime={anime} rank={ranked ? index + 1 : undefined} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="anime-rail__arrow"
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
      >
        ›
      </button>
    </div>
  );
}
