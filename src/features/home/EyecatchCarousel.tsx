import { Carousel } from "antd";
import { Link } from "react-router-dom";
import type { Anime } from "@/types/jikan";

interface EyecatchCarouselProps {
  items: Anime[];
  /** Weekday label, e.g. "FRIDAY". */
  day: string;
}

/**
 * The hero, built as an anime eyecatch: poster art under an ink scrim, the
 * weekday on a sheared vermilion slab, and the show's real Japanese title set
 * vertically at the edge — `title_japanese` straight from the API.
 */
export default function EyecatchCarousel({ items, day }: EyecatchCarouselProps) {
  if (items.length === 0) return null;

  return (
    <div className="eyecatch-hero">
      <Carousel autoplay autoplaySpeed={6000} effect="fade" dotPosition="bottom">
        {items.map((anime) => {
          const image =
            anime.images?.webp?.large_image_url ??
            anime.images?.jpg?.large_image_url ??
            "";

          return (
            <div key={anime.mal_id}>
              <Link
                className="eyecatch-hero__slide"
                to={`/information/${anime.mal_id}`}
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
                        anime.type,
                        anime.episodes ? `${anime.episodes} ep` : null,
                        anime.score ? `★ ${anime.score.toFixed(2)}` : null,
                      ]
                        .filter(Boolean)
                        .join("  ·  ")}
                    </p>
                  </div>

                  {anime.title_japanese ? (
                    <span className="vertical-jp" aria-hidden="true">
                      {anime.title_japanese}
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
