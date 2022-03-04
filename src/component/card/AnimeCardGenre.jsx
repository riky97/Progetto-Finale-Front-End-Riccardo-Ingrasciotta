import React from "react";
import { Card, Tooltip } from "antd";
import parse from "html-react-parser";
import "./card.css";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Meta } = Card;

const AnimeCardGenre = ({ descriptionAnime }) => {
  return (
    <a href={`/information/${descriptionAnime.mal_id}`}>
      <Card
        className="anime-card"
        hoverable
        style={{ width: 200 }}
        cover={
          <img
            className="anime-card-img"
            alt="example"
            src={descriptionAnime.image_url}
          />
        }
      >
        <Meta
          title={
            <Tooltip
              placement="topLeft"
              color={"#d84a1b"}
              key={"#d84a1b"}
              title={descriptionAnime.title}
            >
              {`${descriptionAnime.title}`}
            </Tooltip>
          }
          description={`Episodes: ${descriptionAnime.episodes}`}
        />
      </Card>
    </a>
  );
};

export default AnimeCardGenre;
