import React from "react";
import axios from "axios";

export const getAllAnimeLIst = () => {
  const getAnime = async () => {
    // const split = localStorage.getItem("more").split("/");
    // let path = split[split.length - 1];
    let path = localStorage.getItem("more");
    if (path === "anime") {
      path = "tv";
    }
    const options = {
      method: "GET",
      url: `https://jikan1.p.rapidapi.com/top/anime/1/${path}`,
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
