import React from "react";
import "./genre.css";
import { List, message, Avatar } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const AnimeGenre = () => {
  const data = [
    {
      mal_id: 1,
      name: "Action Anime",
    },
    {
      mal_id: 2,
      name: "Adventure Anime",
    },
    {
      mal_id: 3,
      name: "Cars Anime",
    },
    {
      mal_id: 4,
      name: "Comedy Anime",
    },
    {
      mal_id: 5,
      name: "Avant Garde Anime",
    },
    {
      mal_id: 6,
      name: "Demons Anime",
    },
    {
      mal_id: 7,
      name: "Mystery Anime",
    },
    {
      mal_id: 8,
      name: "Drama Anime",
    },
    {
      mal_id: 10,
      name: "Fantasy Anime",
    },
    {
      mal_id: 11,
      name: "Game Anime",
    },
    {
      mal_id: 14,
      name: "Horror Anime",
    },
    {
      mal_id: 15,
      name: "Kids Anime",
    },
  ];
  const setInLocal = (value, name) => {
    localStorage.setItem("genre", value);
    localStorage.setItem("nameGenre", name);
  };

  return (
    <>
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item className="genre-list-anime" key={item.mal_id}>
            <List.Item.Meta title={item.name} />
            <div>
              <a
                href={`/genre/${item.name.replace(/ /g, "").toLowerCase()}`}
                style={{ color: " #fff" }}
                onClick={() => setInLocal(item.mal_id, item.name)}
              >
                <ArrowRightOutlined style={{ fontSize: "1.8em" }} />
              </a>
            </div>
          </List.Item>
        )}
      />
      <hr />
    </>
  );
};

export default AnimeGenre;
