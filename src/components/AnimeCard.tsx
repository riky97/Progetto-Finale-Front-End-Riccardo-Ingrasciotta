import { SignedIn } from "@clerk/clerk-react";
import { Tooltip } from "antd";
import { Link } from "react-router-dom";
import { scoreOutOfTen } from "@/api/anime";
import { useFavorites } from "@/hooks/useLibrary";
import type { Anime } from "@/types/anilist";
import LibraryToggle from "./LibraryToggle";

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
  return anime.startYear ? String(anime.startYear) : "TBA";
}

/**
 * One card for every surface. Every AniList list query returns the same
 * normalised `Anime` shape, so a single card serves the home rows, the top
 * charts, genre pages and search results alike.
 */
export default function AnimeCard({ anime, rank }: AnimeCardProps) {
  const poster = anime.coverImage ?? "";
  // AniList scores are 0-100 integers; `scoreOutOfTen` renders them as "8.6".
  const score = scoreOutOfTen(anime.averageScore);
  const favorites = useFavorites();

  return (
    <Link className="title-card" to={`/information/${anime.id}`}>
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
        ) : score ? (
          <span className="title-card__score">{score}</span>
        ) : null}

        {/* Hidden entirely when signed out rather than shown disabled: a
            dead heart on every card in a 24-card grid is 24 dead controls,
            and the sidebar already carries the one sign-in call to action. */}
        <SignedIn>
          <LibraryToggle
            state={favorites}
            animeId={anime.id}
            animeTitle={anime.title}
            glyph="♥"
            label="Favourite"
            savedLabel="Favourited"
          />
        </SignedIn>
      </div>

      <div className="title-card__body">
        <Tooltip title={anime.title} placement="topLeft" mouseEnterDelay={0.4}>
          <div className="title-card__name">{anime.title}</div>
        </Tooltip>
        <div className="title-card__meta">
          <span>{yearOf(anime)}</span>
          <span>{anime.format ?? "—"}</span>
          {anime.episodes ? <span>{anime.episodes} ep</span> : null}
        </div>
      </div>
    </Link>
  );
}
