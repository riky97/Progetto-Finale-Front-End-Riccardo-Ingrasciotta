import axios from "axios";

export const getTopAnimeMovie = () => {
  const getAnime = async () => {
    // const options = {
    //   method: "GET",
    //   url: "https://jikan1.p.rapidapi.com/top/anime/1/movie",
    //   headers: {
    //     "x-rapidapi-host": "jikan1.p.rapidapi.com",
    //     "x-rapidapi-key": process.env.REACT_API_KEY,
    //   },
    // };
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v3/top/anime/1/movie`,
    };
    const response = await axios.request(options);
    const data = response.data;

    return data;
  };
  return getAnime();
};
