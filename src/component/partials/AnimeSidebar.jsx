import { BrowserRouter as Router, Routes, Link } from "react-router-dom";

//ANTD
import { Layout, Menu } from "antd";

const { Sider } = Layout;

const AnimeSidebar = () => {
  return (
    <Sider className="anime-sidebar">
      <div className="logo" />
      <Menu mode="inline" selectedKeys={localStorage.getItem("path")}>
        <Menu.Item key="home">
          <a href="/home">Home</a>
        </Menu.Item>

        <Menu.Item key="genre">
          <a href="/genre">Genre</a>
        </Menu.Item>
        <Menu.Item key="search">
          <a href="/search">Search</a>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AnimeSidebar;
