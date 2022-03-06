import React, { useState, useEffect } from "react";

import "./information.css";

import { List, Avatar, Space } from "antd";
import {
  MessageOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  DesktopOutlined,
} from "@ant-design/icons";

//API
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

  const IconText = ({ icon, text }) => (
    <Space style={{ color: "#fff" }}>
      {React.createElement(icon)}
      {text}
    </Space>
  );

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
              icon={StarFilled}
              text={item.score ? item.score : "No score"}
              key="list-vertical-star-o"
            />,

            <IconText
              icon={HeartFilled}
              text={item.favorites ? item.favorites : "No likes"}
              key="list-vertical-like-o"
            />,
            <IconText
              icon={DesktopOutlined}
              text={item.episodes ? item.episodes + " ep" : "0 ep"}
              key="list-vertical-message"
            />,
          ]}
          extra={
            <img width={300} height={420} alt="logo" src={item.image_url} />
          }
        >
          <List.Item.Meta title={item.title} description={item.description} />
          <div className="box-information-anime" style={{}}>
            <h4>
              <b>Synopsis</b>
            </h4>

            {item.synopsis ? item.synopsis : "No synopsis"}
          </div>

          <div className="box-information-anime box2">
            <h4>
              <b>Background</b>
            </h4>
            {item.background ? item.background : "No background"}
          </div>
        </List.Item>
      )}
    />
  );
};

export default InformationAnime;
