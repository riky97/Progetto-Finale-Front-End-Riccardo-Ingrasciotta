import { Link, useParams } from "react-router-dom";
import { getAnimeById } from "@/api/anime";
import Eyecatch from "@/components/Eyecatch";
import { ErrorState, LoadingGrid } from "@/components/States";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";

/**
 * The detail page. The id comes from `useParams`, not from splitting
 * `window.location.href`, and the request goes to `/anime/{id}/full` on v4 —
 * the old code called `v3/anime/{id}`, which is why this page was blank.
 */
export default function InformationPage() {
  const { id } = useParams();
  const animeId = Number(id);

  const query = useAnimeQuery(() => getAnimeById(animeId), [animeId], {
    enabled: Number.isFinite(animeId) && animeId > 0,
  });

  if (query.loading) return <LoadingGrid count={4} />;
  if (query.error) {
    return <ErrorState error={query.error} onRetry={query.refetch} />;
  }

  const anime = query.data;
  if (!anime) return null;

  const poster =
    anime.images?.webp?.large_image_url ??
    anime.images?.jpg?.large_image_url ??
    "";

  // Numeric only — status is prose and gets its own line below.
  const stats = [
    { label: "Score", value: anime.score?.toFixed(2) ?? "—", accent: true },
    { label: "Rank", value: anime.rank ? `#${anime.rank}` : "—" },
    { label: "Episodes", value: anime.episodes ?? "—" },
    { label: "Favourites", value: anime.favorites?.toLocaleString() ?? "—" },
  ];

  return (
    <>
      <Eyecatch title={anime.type ?? "Anime"} count={anime.aired?.string ?? undefined} />

      <article className="detail">
        <div className="detail__poster">
          {poster ? (
            <img src={poster} alt={`Poster for ${anime.title}`} />
          ) : null}
        </div>

        <div>
          <div className="detail__headline">
            <div style={{ minWidth: 0 }}>
              <h2 className="detail__title">{anime.title}</h2>
              {anime.title_english && anime.title_english !== anime.title ? (
                <p className="detail__romaji">{anime.title_english}</p>
              ) : null}
            </div>
            {anime.title_japanese ? (
              <span className="vertical-jp">{anime.title_japanese}</span>
            ) : null}
          </div>

          <div className="stat-row">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <div
                  className={
                    stat.accent ? "stat__value stat__value--accent" : "stat__value"
                  }
                >
                  {stat.value}
                </div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>

          <p className="detail__status">
            {[anime.status, anime.studios[0]?.name, anime.source]
              .filter(Boolean)
              .join("  ·  ")}
          </p>

          {anime.genres.length > 0 ? (
            <div className="detail__block">
              <h3>Genres</h3>
              <div className="tag-row">
                {anime.genres.map((genre) => (
                  <Link
                    className="tag"
                    key={genre.mal_id}
                    to={`/genre/${genre.mal_id}`}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {anime.studios.length > 0 ? (
            <div className="detail__block">
              <h3>Studio</h3>
              <div className="tag-row">
                {anime.studios.map((studio) => (
                  <span className="tag" key={studio.mal_id}>
                    {studio.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="detail__block">
            <h3>Synopsis</h3>
            <p className={anime.synopsis ? "prose" : "prose prose--muted"}>
              {anime.synopsis ?? "No synopsis has been written for this title."}
            </p>
          </div>

          {anime.background ? (
            <div className="detail__block">
              <h3>Background</h3>
              <p className="prose">{anime.background}</p>
            </div>
          ) : null}
        </div>
      </article>
    </>
  );
}
