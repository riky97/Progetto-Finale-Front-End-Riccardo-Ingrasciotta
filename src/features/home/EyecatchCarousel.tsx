import { Carousel } from "antd";
import { Link } from "react-router-dom";
import { scoreOutOfTen } from "@/api/anime";
import type { Anime } from "@/types/anilist";

interface EyecatchCarouselProps {
  items: Anime[];
  /** Weekday label, e.g. "FRIDAY". */
  day: string;
}

/**
 * The hero, built as an anime eyecatch: key art under an ink scrim, the
 * weekday on a sheared vermilion slab, and the show's real Japanese title set
 * vertically at the edge — AniList's `title.native`.
 *
 * Prefers `bannerImage` (16:9 key art) over the portrait cover, since this is a
 * wide hero; AniList gives us both, which Jikan did not.
 */
export default function EyecatchCarousel({ items, day }: EyecatchCarouselProps) {
  if (items.length === 0) return null;

  return (
    <div className="eyecatch-hero">
      <Carousel autoplay autoplaySpeed={6000} effect="fade" dotPosition="bottom">
        {items.map((anime) => {
          const image = anime.bannerImage ?? anime.coverImage ?? "";
          const score = scoreOutOfTen(anime.averageScore);

          return (
            <div key={anime.id}>
              <Link
                className="eyecatch-hero__slide"
                to={`/information/${anime.id}`}
              >
                {image ? (
                  <img
                    className="eyecatch-hero__img"
                    src={image}
                    alt={`Key art for ${anime.title}`}
                  />
                ) : null}
                <span className="eyecatch-hero__scrim" />

                <div className="eyecatch-hero__caption">
                  <div className="eyecatch-hero__text">
                    <span className="eyecatch-hero__day">
                      <span>{day} · airing</span>
                    </span>
                    <h3 className="eyecatch-hero__title">{anime.title}</h3>
                    <p className="eyecatch-hero__sub">
                      {[
                        anime.format,
                        anime.episodes ? `${anime.episodes} ep` : null,
                        score ? `★ ${score}` : null,
                      ]
                        .filter(Boolean)
                        .join("  ·  ")}
                    </p>
                  </div>

                  {anime.titleNative ? (
                    <span className="vertical-jp" aria-hidden="true">
                      {anime.titleNative}
                    </span>
                  ) : null}
                </div>
              </Link>
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}
