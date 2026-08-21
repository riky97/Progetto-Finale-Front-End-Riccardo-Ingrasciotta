import { useRef, useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

interface GenreRailProps {
  genres: string[];
}

/** How far one arrow press scrolls, as a fraction of the visible track width. */
const SCROLL_STEP = 0.8;

/**
 * A horizontally scrollable strip of genre tiles for the home page, with
 * arrow buttons at each end. Reuses the genre tile's visual language
 * (`.genre-tile` on the index page) rather than inventing a new card style.
 */
export default function GenreRail({ genres }: GenreRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(
      track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [updateEdges, genres]);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (genres.length === 0) return null;

  return (
    <div className="genre-rail">
      <button
        type="button"
        className="genre-rail__arrow"
        aria-label="Scroll categories left"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
      >
        ‹
      </button>

      <div
        className="genre-rail__track"
        ref={trackRef}
        onScroll={updateEdges}
      >
        {genres.map((genre) => (
          <Link
            className="genre-rail__tile"
            key={genre}
            to={`/genre/${encodeURIComponent(genre)}`}
          >
            {genre}
          </Link>
        ))}
      </div>

      <button
        type="button"
        className="genre-rail__arrow"
        aria-label="Scroll categories right"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
      >
        ›
      </button>
    </div>
  );
}
