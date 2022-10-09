import React, { useState, useEffect } from "react";

//API
import axios from "axios";

//CSS
import "./information.css";

//COMPONENTS
import { List, Avatar, Space } from "antd";
import {
  MessageOutlined,
  HeartOutlined,
  HeartFilled,
  StarOutlined,
  StarFilled,
  DesktopOutlined,
} from "@ant-design/icons";

const InformationAnime = () => {
  const [informationAnime, setInformationAnime] = useState([]);
  useEffect(() => {
    getInformationAnime();
  }, []);

  const getInformationAnime = async () => {
    const href = window.location.href;
    const split = href.split("/");
    const id_anime = split[split.length - 1];
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v4/anime/${id_anime}`,
    };
    try {
      const response = await axios.request(options);
      const { data } = response.data;
      console.log("data :>> ", data);
      setInformationAnime([data]);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

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
            <img
              width={300}
              height={420}
              alt="logo"
              src={item?.images?.jpg?.image_url}
            />
          }
        >
          <List.Item.Meta title={item.title} description={item.description} />
          <div className="box-information-anime">
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
