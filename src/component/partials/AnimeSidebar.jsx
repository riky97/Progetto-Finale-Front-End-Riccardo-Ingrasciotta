import { BrowserRouter as Router, Routes, Link } from "react-router-dom";

//ANTD
import { Layout, Menu } from "antd";
import { HomeFilled, SearchOutlined, EyeOutlined } from "@ant-design/icons";

import useWindowDimensions from "../shared/UseWindowDimensions";

const { Sider } = Layout;
//<HomeFilled />
//<SearchOutlined />
//<EyeOutlined />
const AnimeSidebar = ({ pos }) => {
  const { height, width } = useWindowDimensions();
  return (
    <Sider className={pos}>
      <div className="logo">ANIME LIST</div>
      <Menu mode="inline" selectedKeys={localStorage.getItem("path")}>
        <Menu.Item key="home">
          {width > 768 ? (
            <a href="/">Home</a>
          ) : (
            <a href="/">
              <HomeFilled />
            </a>
          )}
        </Menu.Item>
        <Menu.Item key="genre">
          {width > 768 ? (
            <a href="/genre">Genre</a>
          ) : (
            <a href="/genre">
              <EyeOutlined />
            </a>
          )}
        </Menu.Item>
        <Menu.Item key="search">
          {width > 768 ? (
            <a href="/search">Search</a>
          ) : (
            <a href="/search">
              <SearchOutlined />
            </a>
          )}
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AnimeSidebar;
