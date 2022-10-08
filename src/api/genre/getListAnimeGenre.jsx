import React from "react";
import axios from "axios";

export const getListAnimeGenre = () => {
  const getAnime = async () => {
    const genre = localStorage.getItem("genre");
    try {
      const options = {
        method: "GET",
        url: `https://api.jikan.moe/v4/genre/anime/${genre}/1`,
      };
      const response = await axios.request(options);
      const data = response.data;

      return data;
    } catch (error) {
      console.log("error :>> ", error);
    }
  };
  return getAnime();
};
