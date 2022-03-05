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
        "x-rapidapi-key": "02981a4988msh9df5c33d8f59e71p1dafacjsnd9ae58ff2120",
      },
    };
    const response = await axios.request(options);
    const data = response.data;

    return data;
  };
  return getAnime();
};
