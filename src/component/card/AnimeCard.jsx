import React, { useEffect } from "react";
import { Card, Tooltip } from "antd";
import parse from "html-react-parser";
import "./card.css";

const { Meta } = Card;

const AnimeCard = ({ descriptionAnime }) => {
  // useEffect(() => {
  //   console.log("rank :>> ", rank);
  // }, []);

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
            src={descriptionAnime?.images?.jpg?.image_url}
          />
        }
      >
        <Meta
          title={
            <Tooltip
              placement="topLeft"
              color={"#d84a1b"}
              key={"#d84a1b"}
              title={descriptionAnime?.name || descriptionAnime.title}
            >
              {parse(
                `<b style="color:#d84a1b">${
                  descriptionAnime?.rank
                    ? descriptionAnime?.rank
                    : descriptionAnime?.favorites
                }.</b>`
              )}
              {`  ${descriptionAnime?.name || descriptionAnime.title}`}
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
