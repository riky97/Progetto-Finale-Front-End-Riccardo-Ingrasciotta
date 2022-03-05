import React from "react";
import "./genre.css";
import { List, message, Avatar } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

import { getAllGenre } from "./getAllGenre";

const AnimeGenre = () => {
  return (
    <>
      <List
        dataSource={getAllGenre()}
        renderItem={(item) => (
          <List.Item className="genre-list-anime" key={item.mal_id}>
            <List.Item.Meta title={item.name} />
            <div>
              <a href={`/genre/${item.mal_id}`} style={{ color: " #fff" }}>
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
