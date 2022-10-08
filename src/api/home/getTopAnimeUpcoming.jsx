import axios from "axios";

export const getTopAnimeUpcoming = async () => {
  const options = {
    method: "GET",
    url: `https://api.jikan.moe/v4/seasons/upcoming`,
  };
  const response = await axios.request(options);
  const data = response.data;
  return data;
};
