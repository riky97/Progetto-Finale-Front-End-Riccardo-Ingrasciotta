import { Input, Space, List } from "antd";
import React, { useEffect, useState } from "react";

import AnimeCard from "../card/AnimeCard";
import AnimeCardGenre from "../card/AnimeCardGenre";
import useWindowDimensions from "../shared/UseWindowDimensions";
import "./search.css";

import AllAnimeList from "../allAnimeList/AllAnimeList";
const { Search } = Input;

const AnimeSearch = () => {
  const { height, width } = useWindowDimensions();
  const page = (width) => {
    let numPagination;
    let countPageSize;

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

  const onSearch = (value) => console.log(value);

  return (
    <>
      <div className="section-title section-search">
        <h3>Search</h3>
        <Search
          className="anime-search"
          width={30}
          placeholder="input search text"
          onSearch={onSearch}
          size="large"
          enterButton
        />
      </div>
      <hr />

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
        dataSource={[]}
        renderItem={(rec) => (
          <List.Item style={{ justifyContent: "center", display: "flex" }}>
            <AnimeCardGenre key={rec.id} descriptionAnime={rec} />
          </List.Item>
        )}
      />
    </>
  );
};

export default AnimeSearch;
