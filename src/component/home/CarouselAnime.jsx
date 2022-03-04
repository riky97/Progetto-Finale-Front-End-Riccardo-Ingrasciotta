import { Carousel } from "antd";
import "./carousel.css";

const CarouselAnime = ({ animeList }) => {
  console.log("animeList :>> ", animeList);
  const contentStyle = {};
  return (
    <div className="box-carousel">
      <h2>FRIDAY ANIME</h2>
      <Carousel className="carousel-anime" autoplay>
        {animeList.map((anime) => (
          <div key={anime.mal_id}>
            <img className="image-carousel" src={anime.image_url} alt="" />
            <h3 className="content-style" style={contentStyle}>
              {anime.title}
            </h3>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default CarouselAnime;
