//ANTD
import { Layout, Menu, Breadcrumb } from "antd";

const { Header, Content, Footer, Sider } = Layout;

const AnimeSidebar = () => {
  return (
    <Sider className="anime-sidebar">
      <div className="logo" />
      <Menu mode="inline">
        <Menu.Item key="home">home</Menu.Item>
        <Menu.Item key="genre">genre</Menu.Item>
        <Menu.Item key="search">search</Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AnimeSidebar;
