import React from "react";
import { Card, Avatar } from "antd";
import "./card.css";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Meta } = Card;

const AnimeCard = ({ descriptionAnime }) => {
  return (
    <Card
      hoverable
      style={{ width: 300 }}
      cover={
        <img
          className="anime-card-img"
          alt="example"
          src={descriptionAnime.image_url}
        />
      }
    >
      <Meta
        title={descriptionAnime.title}
        description={
          descriptionAnime.date
            ? `${descriptionAnime.date} | ${descriptionAnime.type}`
            : `No date | ${descriptionAnime.type}`
        }
      />
    </Card>
  );
};

export default AnimeCard;
