import { Tooltip } from "antd";
import { Link } from "react-router-dom";
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
 */
export default function AnimeCard({ anime, rank }: AnimeCardProps) {
  const poster =
    anime.images?.webp?.large_image_url ??
    anime.images?.jpg?.large_image_url ??
    anime.images?.jpg?.image_url ??
    "";

  return (
    <Link className="title-card" to={`/information/${anime.mal_id}`}>
      <div className="title-card__frame">
        {poster ? (
          <img
            className="title-card__img"
            src={poster}
            alt={`Poster for ${anime.title}`}
            loading="lazy"
          />
        ) : null}

        {rank !== undefined ? (
          <span className="title-card__rank" aria-hidden="true">
            {String(rank).padStart(2, "0")}
          </span>
        ) : anime.score ? (
          <span className="title-card__score">{anime.score.toFixed(2)}</span>
        ) : null}
      </div>

      <div className="title-card__body">
        <Tooltip title={anime.title} placement="topLeft" mouseEnterDelay={0.4}>
          <div className="title-card__name">{anime.title}</div>
        </Tooltip>
        <div className="title-card__meta">
          <span>{yearOf(anime)}</span>
          <span>{anime.type ?? "—"}</span>
          {anime.episodes ? <span>{anime.episodes} ep</span> : null}
        </div>
      </div>
    </Link>
  );
}
