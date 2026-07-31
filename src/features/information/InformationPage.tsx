import { Link, useParams } from "react-router-dom";
import { getAnimeById } from "@/api/anime";
import SectionSlab from "@/components/SectionSlab";
import { ErrorState } from "@/components/States";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimeQuery } from "@/hooks/useAnimeQuery";
import { cn } from "@/lib/utils";

/** One field of the spec block. */
function Field({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-t-2 border-ink pt-2">
      <div
        className={cn(
          "font-display text-xl leading-none tabular-nums",
          accent ? "text-pink-deep" : "text-ink",
        )}
      >
        {value}
      </div>
      <div className="annotation mt-2">{label}</div>
    </div>
  );
}

/**
 * The detail page. The id comes from `useParams`, not from splitting
 * `window.location.href`, and the request goes to `/anime/{id}/full` on v4 —
 * the old code called `v3/anime/{id}`, which is why this page was blank.
 *
 * Laid out as a spec sheet: the art in its aperture on the left, the numbers
 * ruled off in a row, then the written material set in the longform face.
 */
export default function InformationPage() {
  const { id } = useParams();
  const animeId = Number(id);

  const query = useAnimeQuery(() => getAnimeById(animeId), [animeId], {
    enabled: Number.isFinite(animeId) && animeId > 0,
  });

  if (query.loading) {
    return (
      <div className="grid gap-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <Skeleton className="aspect-[2/3] w-full rounded-none bg-paper-2" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 rounded-none bg-paper-2" />
          <Skeleton className="h-20 w-full rounded-none bg-paper-2" />
          <Skeleton className="h-40 w-full rounded-none bg-paper-2" />
        </div>
      </div>
    );
  }
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
  const fields = [
    { label: "Score", value: anime.score?.toFixed(2) ?? "—", accent: true },
    { label: "Rank", value: anime.rank ? `#${anime.rank}` : "—" },
    { label: "Episodes", value: String(anime.episodes ?? "—") },
    { label: "Favourites", value: anime.favorites?.toLocaleString() ?? "—" },
  ];

  return (
    <>
      <SectionSlab
        title={anime.type ?? "Anime"}
        count={anime.aired?.string ?? undefined}
      />

      <article className="grid gap-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-10">
        <div className="mx-auto w-full max-w-[17rem] md:mx-0">
          <div className="aperture aspect-[2/3] w-full">
            {poster ? (
              <img
                src={poster}
                alt={`Poster for ${anime.title}`}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <p className="annotation mt-3">MAL #{anime.mal_id}</p>
        </div>

        <div className="min-w-0">
          <div className="flex items-start gap-5">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[clamp(1.35rem,1rem+1.6vw,2.4rem)] leading-[1.05] tracking-[0.01em] uppercase">
                {anime.title}
              </h2>
              {anime.title_english && anime.title_english !== anime.title ? (
                <p className="mt-2 font-heading text-sm text-graphite">
                  {anime.title_english}
                </p>
              ) : null}
            </div>

            {anime.title_japanese ? (
              <span className="vertical-jp hidden max-h-56 shrink-0 text-xs text-blue-ink sm:block">
                {anime.title_japanese}
              </span>
            ) : null}
          </div>

          <p className="mt-4 font-mono text-[0.7rem] tracking-[0.14em] uppercase text-graphite">
            {[anime.status, anime.studios[0]?.name, anime.source]
              .filter(Boolean)
              .join("  /  ")}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-4">
            {fields.map((field) => (
              <Field key={field.label} {...field} />
            ))}
          </div>

          {anime.genres.length > 0 ? (
            <section className="mt-9">
              <h3 className="annotation">Genres</h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <Badge key={genre.mal_id} asChild variant="outline">
                    <Link
                      to={`/genre/${genre.mal_id}`}
                      className="rounded-none border-2 border-ink px-2.5 font-mono text-[0.66rem] tracking-[0.12em] uppercase hover:bg-ink hover:text-paper"
                    >
                      {genre.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {anime.studios.length > 0 ? (
            <section className="mt-7">
              <h3 className="annotation">Studio</h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {anime.studios.map((studio) => (
                  <Badge
                    key={studio.mal_id}
                    variant="outline"
                    className="rounded-none border-2 border-blue-pale px-2.5 font-mono text-[0.66rem] tracking-[0.12em] uppercase text-blue-ink"
                  >
                    {studio.name}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-9">
            <h3 className="annotation">Synopsis</h3>
            <p
              className={cn(
                "mt-2.5 max-w-prose font-longform text-[1.02rem] leading-relaxed",
                anime.synopsis ? "text-ink" : "text-graphite italic",
              )}
            >
              {anime.synopsis ?? "No synopsis has been written for this title."}
            </p>
          </section>

          {anime.background ? (
            <section className="mt-7">
              <h3 className="annotation">Background</h3>
              <p className="mt-2.5 max-w-prose font-longform text-[1.02rem] leading-relaxed">
                {anime.background}
              </p>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
