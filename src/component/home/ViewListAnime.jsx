import React from "react";
import { Row, Col, Table, List } from "antd";
import useWindowDimensions from "../UseWindowDimensions";
import AnimeCard from "../card/AnimeCard";

const ViewListAnime = ({ information }) => {
  const { height, width } = useWindowDimensions();
  console.log("information :>> ", information);
  return (
    <List
      grid={{
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 4,
      }}
      pagination={{
        position: "top",
        className: "pagination-home",
        pageSize: width >= 1200 ? 20 : 10,
      }}
      dataSource={information}
      renderItem={(rec) => (
        <List.Item>
          <AnimeCard key={rec.id} descriptionAnime={rec} />
        </List.Item>
      )}
    />
  );
};

export default ViewListAnime;
