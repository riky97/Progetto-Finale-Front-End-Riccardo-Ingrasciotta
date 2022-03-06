import React from "react";
import axios from "axios";

export const getAllAnimeLIst = () => {
  const getAnime = async () => {
    let path = localStorage.getItem("more");
    if (path === "anime") {
      path = "tv";
    }
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v3/top/anime/1/${path}`,
    };
    const response = await axios.request(options);
    const data = response.data;
    return data;
  };
  return getAnime();
};
