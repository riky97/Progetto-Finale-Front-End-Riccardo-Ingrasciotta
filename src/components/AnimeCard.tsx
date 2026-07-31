import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Anime } from "@/types/jikan";

interface AnimeCardProps {
  anime: Anime;
  /**
   * Position within a ranked list. Only pass this where the ordering actually
   * carries meaning (top charts) — on search and genre results it does not,
   * and the card shows the score instead.
   */
  rank?: number;
}

function yearOf(anime: Anime): string {
  if (anime.year) return String(anime.year);
  const from = anime.aired?.from;
  if (from) return from.slice(0, 4);
  return "TBA";
}

/**
 * One card for every surface. The old codebase had two near-identical cards
 * (`AnimeCard` / `AnimeCardGenre`) because v3 and v4 payloads disagreed on
 * field names; on v4 every endpoint returns the same `Anime` shape.
 *
 * The art is mounted in an aperture — the signature device — and the metadata
 * sits below it on the sheet, ruled off by a hard ink line.
 */
export default function AnimeCard({ anime, rank }: AnimeCardProps) {
  const poster =
    anime.images?.webp?.large_image_url ??
    anime.images?.jpg?.large_image_url ??
    anime.images?.jpg?.image_url ??
    "";

  return (
    <Link
      className="aperture-hover group block"
      to={`/information/${anime.mal_id}`}
    >
      <div className="aperture aspect-[2/3] w-full">
        {poster ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            src={poster}
            alt={`Poster for ${anime.title}`}
            loading="lazy"
          />
        ) : null}

        {rank !== undefined ? (
          <span
            className="absolute bottom-0 left-0 z-[3] bg-pink px-2 pt-0.5 pb-px font-display text-sm tabular-nums text-ink"
            aria-hidden="true"
          >
            {String(rank).padStart(2, "0")}
          </span>
        ) : anime.score ? (
          <span className="absolute top-0 right-0 z-[3] bg-ink/85 px-1.5 py-0.5 font-mono text-[0.7rem] tabular-nums text-paper">
            {anime.score.toFixed(2)}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 border-t-2 border-ink pt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h3 className="line-clamp-2 font-heading text-[0.86rem] leading-snug group-hover:text-pink-deep">
              {anime.title}
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top" align="start">
            {anime.title}
          </TooltipContent>
        </Tooltip>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 font-mono text-[0.66rem] tracking-[0.1em] uppercase text-blue-ink">
          <span>{yearOf(anime)}</span>
          <span aria-hidden="true" className="text-blue-pale">
            /
          </span>
          <span>{anime.type ?? "—"}</span>
          {anime.episodes ? (
            <>
              <span aria-hidden="true" className="text-blue-pale">
                /
              </span>
              <span>{anime.episodes} ep</span>
            </>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
