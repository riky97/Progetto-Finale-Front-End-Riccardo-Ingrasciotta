import axios from "axios";

export const getAnimeSearch = (value) => {
  const getAnime = async () => {
    const options = {
      method: "GET",
      url: "https://jikan1.p.rapidapi.com/search/anime",
      params: {
        q: value,
        sort: "asc",
        type: "Anime",
        status: "Anime",
      },
      headers: {
        "x-rapidapi-host": "jikan1.p.rapidapi.com",
        "x-rapidapi-key": process.env.REACT_API_KEY,
      },
    };
    const response = await axios.request(options);
    const data = response.data;

    return data;
  };
  return getAnime();
};
