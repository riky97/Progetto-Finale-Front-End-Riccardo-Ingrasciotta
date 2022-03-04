import React, { useEffect, useState } from "react";
import { Row, Col, Table, List } from "antd";
import axios from "axios";

import AnimeCard from "../card/AnimeCard";
import useWindowDimensions from "../shared/UseWindowDimensions";

const AllAnimeList = () => {
  const [generalTop, setGeneralTop] = useState([]);
  const { height, width } = useWindowDimensions();
  const split = localStorage.getItem("more").split("/");
  const path = split[split.length - 1];
  console.log(path);

  useEffect(() => {
    const anime = async () => {
      const res = await getAnime();

      setGeneralTop(res.top);
    };
    anime();
  }, []);
  const getAnime = async () => {
    const split = localStorage.getItem("more").split("/");
    let path = split[split.length - 1];
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

  const page = (width) => {
    let numPagination;
    let countPageSize = 2;

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
          {generalTop.length} {path}
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
        dataSource={generalTop}
        renderItem={(rec) => (
          <List.Item style={{ justifyContent: "center", display: "flex" }}>
            <AnimeCard key={rec.id} descriptionAnime={rec} />
          </List.Item>
        )}
      />
    </>
  );
};

export default AllAnimeList;
