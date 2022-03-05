import React, { useState, useEffect } from "react";

import { List, Avatar, Space } from "antd";
import { MessageOutlined, LikeOutlined, StarOutlined } from "@ant-design/icons";

import { getInformationAnime } from "../../api/information/getInformationAnime";

const InformationAnime = () => {
  const [informationAnime, setInformationAnime] = useState([]);
  useEffect(() => {
    const anime = async () => {
      const res = await getInformationAnime();
      setInformationAnime([res]);
    };
    anime();
  }, []);
  console.log(informationAnime);

  const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  );
  const listData = [];
  return (
    <List
      itemLayout="vertical"
      size="large"
      dataSource={informationAnime}
      renderItem={(item) => (
        <List.Item
          key={item.title}
          actions={[
            <IconText
              icon={StarOutlined}
              text="156"
              key="list-vertical-star-o"
            />,
            <IconText
              icon={LikeOutlined}
              text="156"
              key="list-vertical-like-o"
            />,
            <IconText
              icon={MessageOutlined}
              text="2"
              key="list-vertical-message"
            />,
          ]}
          extra={
            <img width={300} height={420} alt="logo" src={item.image_url} />
          }
        >
          <List.Item.Meta title={item.title} description={item.description} />
          {item.synopsis}
        </List.Item>
      )}
    />
  );
};

export default InformationAnime;
