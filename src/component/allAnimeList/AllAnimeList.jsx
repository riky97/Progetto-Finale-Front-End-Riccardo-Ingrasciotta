import React, { useEffect, useState } from "react";

import { List } from "antd";

import AnimeCard from "../card/AnimeCard";
import AnimeCardGenre from "../card/AnimeCardGenre";
import useWindowDimensions from "../shared/UseWindowDimensions";

//API
import { getAllAnimeLIst } from "../../api/allAnime/getAllAnimeLIst";
import { getListAnimeGenre } from "../../api/genre/getListAnimeGenre";

import "../home/home.css";
import axios from "axios";

const AllAnimeList = ({ type }) => {
  const [generalTopAnime, setgeneralTopAnime] = useState([]);
  const [generalGenreAnime, setgeneralGenreAnime] = useState([]);
  const [nameGenre, setNameGenre] = useState("");
  const { height, width } = useWindowDimensions();
  const split = window.location.href.split("/");
  let path = "";
  if (type === "topanime") {
    path = split[split.length - 1];
    localStorage.setItem("more", path);
  }
  if (type === "genre") {
    path = split[split.length - 1];
    localStorage.setItem("genre", path);
  }
  //const split = localStorage.getItem("more").split("/");
  //const path = split[split.length - 1];

  useEffect(() => {
    const path = localStorage.getItem("path");
    if (path === "topanime") {
      setgeneralTopAnime(getAllAnimeLIst()?.top);
    }
    if (path === "genre") {
      setgeneralGenreAnime(getListAnimeGenre()?.anime);
      setNameGenre(getListAnimeGenre()?.mal_url.name);
    }
  }, []);

  const getAllAnimeLIst = async () => {
    let more = localStorage.getItem("more");

    if (more === "anime") {
      more = "tv";
    }
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v4/top/anime/1/${more}`,
    };
    try {
      const response = await axios.request(options);
      const { data } = response.data;
      console.log("data", data);
      return data;
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  const getListAnimeGenre = async () => {
    const genre = localStorage.getItem("genre");
    try {
      const options = {
        method: "GET",
        url: `https://api.jikan.moe/v4/genre/anime/${genre}/1`,
      };
      const response = await axios.request(options);
      const { data } = response.data;
      console.log("data", data);
      return data;
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  const page = (width) => {
    let numPagination;
    let countPageSize;
    if (type === "genre") {
      countPageSize = 4;
    } else {
      countPageSize = 3;
    }

    if (width < 576) {
      numPagination = 1 * countPageSize;
    }
    if (width >= 576) {
      numPagination = 2 * countPageSize;
    }
    if (width >= 768) {
      numPagination = 2 * countPageSize;
    }
    if (width >= 992) {
      numPagination = 3 * countPageSize;
    }
    if (width >= 1200) {
      numPagination = 4 * countPageSize;
    }
    if (width >= 1600) {
      numPagination = 6 * countPageSize;
    }
    return numPagination;
  };

  return (
    <>
      <div className="section-title">
        <h3>
          {type === "topanime"
            ? `${generalTopAnime.length} ${localStorage.getItem("more")}`
            : ""}
          {type === "genre" ? `${generalGenreAnime.length} ${nameGenre}  ` : ""}
        </h3>
      </div>
      <List
        loading={false}
        grid={{
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 4,
          xxl: 6,
        }}
        pagination={{
          defaultCurrent: 1,
          position: "bottom",
          className: "pagination-home",
          pageSize: page(width),
        }}
        dataSource={type === "genre" ? generalGenreAnime : generalTopAnime}
        renderItem={(rec) => (
          <List.Item style={{ justifyContent: "center", display: "flex" }}>
            {type === "genre" ? (
              <AnimeCardGenre key={rec.id} descriptionAnime={rec} />
            ) : (
              <AnimeCard key={rec.id} descriptionAnime={rec} />
            )}
          </List.Item>
        )}
      />
    </>
  );
};

export default AllAnimeList;
