import React from "react";
import { Row, Col, Table, List } from "antd";
import useWindowDimensions from "../shared/UseWindowDimensions";
import AnimeCard from "../card/AnimeCard";

const ViewListAnime = ({ path, pageSizeAnime, information, titleSection }) => {
  const { height, width } = useWindowDimensions();

  const page = (width) => {
    let numPagination;
    let countPageSize = pageSizeAnime;

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
        <h3>{titleSection}</h3>
        <a href={path}>more...</a>
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
          position: "bottom",
          className: "pagination-home",
          pageSize: page(width),
        }}
        dataSource={information}
        renderItem={(rec) => (
          <List.Item style={{ justifyContent: "center", display: "flex" }}>
            <AnimeCard key={rec.id} descriptionAnime={rec} />
          </List.Item>
        )}
      />
    </>
  );
};

export default ViewListAnime;
