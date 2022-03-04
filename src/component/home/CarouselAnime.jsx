import { Carousel } from "antd";
import "./carousel.css";

const CarouselAnime = ({ animeList, todayDay }) => {
  return (
    <div className="box-carousel">
      <h2>{todayDay} ANIME</h2>
      <Carousel className="carousel-anime" autoplay>
        {animeList.map((anime) => (
          <div key={anime.mal_id}>
            <a href={`/information/${anime.mal_id}`}>
              <img className="image-carousel" src={anime.image_url} alt="" />
            </a>
            <h3 className="content-style">{anime.title}</h3>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselAnime;
