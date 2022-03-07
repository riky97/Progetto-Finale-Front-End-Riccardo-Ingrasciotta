import { Input, Space, List } from "antd";
import React, { useEffect, useState } from "react";

import AnimeCardGenre from "../card/AnimeCardGenre";
import useWindowDimensions from "../shared/UseWindowDimensions";
import "./search.css";

//API
import { getAnimeSearch } from "../../api/search/getAnimeSearch";

const { Search } = Input;

const AnimeSearch = () => {
  const [title, setTitle] = useState("");
  const [animeSearch, setAnimeSearch] = useState([]);
  const [loading, setLoading] = useState(false);
  const { height, width } = useWindowDimensions();
  const page = (width) => {
    let numPagination;
    let countPageSize = 4;

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

  const onSearch = (value) => {
    value = value.toLowerCase();
    if (value) {
      setLoading(true);

      const data = async () => {
        try {
          const search = await getAnimeSearch(value);
          setLoading(false);
          setAnimeSearch(search.results);
          setTitle(value);
          localStorage.setItem("searchObject", JSON.stringify(search.results));
          localStorage.setItem("searchTitle", value);
          // window.location.href = "?search_anime=" + value;
        } catch {
          setLoading(false);
          setAnimeSearch("");
          value = "";
        }
      };
      data();
    }
  };

  useEffect(() => {
    const setItem = () => {
      if (animeSearch.length === 0) {
        setAnimeSearch(JSON.parse(localStorage.getItem("searchObject")));
      }
      if (title === "") {
        setTitle(localStorage.getItem("searchTitle"));
      }
    };
    setItem();
  });

  return (
    <>
      <div className="section-title section-search">
        <h3>
          {animeSearch.length} search:{" "}
          {title ? title : "No research carried out"}
        </h3>
        <Search
          className="anime-search"
          allowClear
          width={30}
          placeholder={title ? title : "Search anime..."}
          onSearch={onSearch}
          size="large"
          enterButton
        />
      </div>
      <hr />

      <List
        loading={loading}
        grid={{
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 4,
          xxl: 6,
        }}
        pagination={{
          position: "bottom",
          className: "pagination-home",
          pageSize: page(width),
        }}
        dataSource={animeSearch}
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
