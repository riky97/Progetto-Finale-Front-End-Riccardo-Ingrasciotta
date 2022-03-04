import React from "react";
import axios from "axios";

export const getListAnimeGenre = () => {
  const getAnime = async () => {
    const genre = localStorage.getItem("genre");
    console.log(genre);
    const options = {
      method: "GET",
      url: `https://jikan1.p.rapidapi.com/genre/anime/${genre}/1`,
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
