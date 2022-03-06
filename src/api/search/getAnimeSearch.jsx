import axios from "axios";

export const getAnimeSearch = (value) => {
  const getAnime = async () => {
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v3/search/anime?q=${value}&page=1?sort=asc&status=anime`,
    };

    const response = await axios.request(options);
    const data = response.data;

    return data;
  };
  return getAnime();
};
