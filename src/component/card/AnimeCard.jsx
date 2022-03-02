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

const AnimeCard = ({ descriptionAnime }) => {
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
              {parse(`<b style="color:#d84a1b">${descriptionAnime.rank}.</b>`)}
              {`  ${descriptionAnime.title}`}
            </Tooltip>
          }
          description={
            descriptionAnime.start_date
              ? `${descriptionAnime.start_date} | ${descriptionAnime.type}`
              : `No date | ${descriptionAnime.type}`
          }
        />
      </Card>
    </a>
  );
};

export default AnimeCard;
