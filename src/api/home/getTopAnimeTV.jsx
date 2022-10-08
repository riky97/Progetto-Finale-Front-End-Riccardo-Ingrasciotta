import axios from "axios";

export const getTopAnimeTV = () => {
  const getAnime = async () => {
    // const options = {
    //   method: "GET",
    //   url: "https://jikan1.p.rapidapi.com/top/anime/1/tv",
    //   headers: {
    //     "x-rapidapi-host": "jikan1.p.rapidapi.com",
    //     "x-rapidapi-key": process.env.REACT_API_KEY,
    //   },
    // };
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v4/top/anime/1/tv`,
    };
    const response = await axios.request(options);
    const data = response.data;
    return data;
  };
  return getAnime();
};
