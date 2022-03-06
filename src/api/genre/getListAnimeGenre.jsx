import React from "react";
import axios from "axios";

export const getListAnimeGenre = () => {
  const getAnime = async () => {
    const genre = localStorage.getItem("genre");

    // const options = {
    //   method: "GET",
    //   url: `https://jikan1.p.rapidapi.com/genre/anime/${genre}/1`,
    //   headers: {
    //     "x-rapidapi-host": "jikan1.p.rapidapi.com",
    //     "x-rapidapi-key": process.env.REACT_API_KEY,
    //   },
    // };
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v3/genre/anime/${genre}/1`,
    };
    const response = await axios.request(options);
    const data = response.data;

    return data;
  };
  return getAnime();
};
