import { Carousel } from "antd";
import "./carousel.css";

const CarouselAnime = ({ animeList, todayDay }) => {
  return (
    <div className="box-carousel">
      <h2>{todayDay} ANIME</h2>
      {animeList.length !== 0 && (
        <Carousel className="carousel-anime" autoplay>
          {animeList.map((anime) => (
            <div key={anime.mal_id}>
              <a href={`/information/${anime.mal_id}`}>
                <img
                  className="image-carousel"
                  src={anime?.images?.jpg?.image_url}
                  alt="Anime"
                />
              </a>
              <h3 className="content-style">{anime.title}</h3>
            </div>
          ))}
        </Carousel>
      )}
      {(animeList.length === 0 || !animeList.length) && (
        <div>
          <h1>Sorry, I'm not found anime scheduled today!</h1>
        </div>
      )}
    </div>
  );
};

export default CarouselAnime;
