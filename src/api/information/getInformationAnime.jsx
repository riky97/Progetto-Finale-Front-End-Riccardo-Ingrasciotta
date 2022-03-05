import React from "react";
import axios from "axios";

export const getInformationAnime = () => {
  const href = window.location.href;
  const split = href.split("/");
  const id_anime = split[split.length - 1];
  const getAnime = async () => {
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v3/anime/${id_anime}`,
    };
    const response = await axios.request(options);
    const data = response.data;
    return data;
  };
  return getAnime();
};
