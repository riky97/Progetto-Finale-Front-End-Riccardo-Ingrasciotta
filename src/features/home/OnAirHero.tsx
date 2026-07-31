import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Anime } from "@/types/jikan";

interface OnAirHeroProps {
  items: Anime[];
  /** Weekday label, e.g. "FRIDAY". */
  day: string;
}

const ROTATE_MS = 6500;
const MAX_SLIDES = 6;

function posterOf(anime: Anime): string {
  return (
    anime.images?.webp?.large_image_url ??
    anime.images?.jpg?.large_image_url ??
    ""
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * The fullest expression of the aperture: what is on air today, mounted in a
 * camera frame over its own key art, with the show's real `title_japanese`
 * running down the trailing edge the way an annotation runs down a cel.
 *
 * It rotates on its own, but stops on hover or keyboard focus, and never
 * starts at all when the visitor asks for reduced motion.
 */
export default function OnAirHero({ items, day }: OnAirHeroProps) {
  const slides = items.slice(0, MAX_SLIDES);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || slides.length < 2 || prefersReducedMotion()) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      aria-label={`Airing ${day.toLowerCase()}`}
      className="aperture aperture-hover h-[27rem] w-full sm:h-[21rem] lg:h-[23.5rem]"
      ref={frameRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!frameRef.current?.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {slides.map((anime, i) => {
        const poster = posterOf(anime);
        const isActive = i === index;

        return (
          <div
            key={anime.mal_id}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              isActive ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {/* Key art, blown out and dimmed, as the ground the frame sits on. */}
            {poster ? (
              <img
                src={poster}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40"
            />

            <Link
              to={`/information/${anime.mal_id}`}
              tabIndex={isActive ? undefined : -1}
              className="focus-on-ink relative flex h-full flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:gap-8 sm:p-9 lg:p-11"
            >
              {poster ? (
                <img
                  src={poster}
                  alt={`Key art for ${anime.title}`}
                  className="h-40 w-auto shrink-0 border-2 border-paper/85 object-cover sm:h-full"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <span className="inline-block bg-pink px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.22em] uppercase text-ink">
                  On air · {day}
                </span>

                <h2 className="mt-4 line-clamp-2 font-display text-[clamp(1.25rem,0.9rem+1.5vw,2.25rem)] leading-[1.05] tracking-[0.01em] uppercase text-paper">
                  {anime.title}
                </h2>

                <p className="mt-3 font-mono text-[0.7rem] tracking-[0.16em] uppercase text-paper/70">
                  {[
                    anime.type,
                    anime.episodes ? `${anime.episodes} ep` : null,
                    anime.score ? `Score ${anime.score.toFixed(2)}` : null,
                  ]
                    .filter(Boolean)
                    .join("  /  ")}
                </p>
              </div>

              {anime.title_japanese ? (
                <span className="vertical-jp hidden self-stretch text-xs text-paper/45 lg:block">
                  {anime.title_japanese}
                </span>
              ) : null}
            </Link>
          </div>
        );
      })}

      {slides.length > 1 ? (
        <div className="absolute bottom-4 left-7 z-[3] flex gap-1.5 sm:left-9 lg:left-11">
          {slides.map((anime, i) => (
            <button
              key={anime.mal_id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${anime.title}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "focus-on-ink h-1.5 w-7 transition-colors",
                i === index ? "bg-pink" : "bg-paper/30 hover:bg-paper/60",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
