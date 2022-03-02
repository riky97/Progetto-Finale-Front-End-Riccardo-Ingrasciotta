import { useEffect, useState } from "react";

//CSS
import "./component/home/home.css";

//API
import { getTopAnimeUpcoming } from "./api/home/getTopAnimeUpcoming";
import { getTopAnimeTV } from "./api/home/getTopAnimeTV";
import { getTopAnimeMovie } from "./api/home/getTopAnimeMovie";

//COMPONENT
import ViewListAnime from "./component/home/ViewListAnime";

//ANTD
import { Layout, Menu, Breadcrumb } from "antd";

const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [topAnimeUpcoming, setTopAnimeUpcoming] = useState([]);
  const [topAnimeTV, setTopAnimeTV] = useState([]);
  const [topAnimeMovie, setTopAnimeMovie] = useState([]);
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnimeUpcoming();

      setTopAnimeUpcoming(res.top.slice(0, 10));
    };
    anime();
  }, []);
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnimeTV();

      setTopAnimeTV(res.top.slice(0, 10));
    };
    anime();
  }, []);
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnimeMovie();

      setTopAnimeMovie(res.top.slice(0, 10));
    };
    anime();
  }, []);

  return (
    <Layout hasSider>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: "#1a1a1a",
        }}
      >
        <div className="logo" />
        <Menu mode="inline" defaultSelectedKeys={["4"]}>
          <Menu.Item key="home">home</Menu.Item>
          <Menu.Item key="home">home</Menu.Item>
          <Menu.Item key="home">home</Menu.Item>
        </Menu>
      </Sider>
      <Layout className="layout" style={{ marginLeft: 200 }}>
        <Header
          className="site-layout-background"
          style={{ padding: 0 }}
        ></Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-content">
            {" "}
            <ViewListAnime
              titleSection={`top ${topAnimeUpcoming.length} anime/movie upcoming`}
              pageSizeAnime={1}
              information={topAnimeUpcoming}
            />
            <hr />
            <ViewListAnime
              titleSection={`top ${topAnimeTV.length} anime`}
              pageSizeAnime={1}
              information={topAnimeTV}
            />
            <hr />
            <ViewListAnime
              titleSection={`top ${topAnimeTV.length} movie`}
              pageSizeAnime={1}
              information={topAnimeMovie}
            />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
