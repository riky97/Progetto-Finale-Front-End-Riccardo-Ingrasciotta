//CSS
import "./component/home/home.css";
import "./component/partials/partials.css";

//REACT ROUTER DOM
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//COMPONENT
import AnimeSidebar from "./component/partials/AnimeSidebar";
import AnimeFooter from "./component/partials/AnimeFooter";
import RouterHome from "./component/home/RouterHome";
import AnimeGenre from "./component/genre/AnimeGenre";
import AllAnimeList from "./component/allAnimeList/AllAnimeList";
import InformationAnime from "./component/information/InformationAnime";
import AnimeSearch from "./component/search/AnimeSearch";

//SHARED
import { getPathName } from "./component/shared/getPathName";
import useWindowDimensions from "./component/shared/UseWindowDimensions";
import { getDescriprionHeader } from "./component/shared/getDescriprionHeader";

//ANTD
import { Layout, Menu, Breadcrumb } from "antd";
import { SmileOutlined } from "@ant-design/icons";
const { Header, Content, Footer, Sider } = Layout;

function App() {
  const { height, width } = useWindowDimensions();
  getPathName();
  return (
    <Layout hasSider>
      {width <= 768 ? (
        <AnimeSidebar pos="anime-sidebar-bottom" />
      ) : (
        <AnimeSidebar pos="anime-sidebar" />
      )}

      <Layout
        className="layout"
        style={width <= 768 ? { marginLeft: 0 } : { marginLeft: 200 }}
      >
        {/* <Header
          className="site-layout-background"
          style={{ padding: 0 }}
        ></Header> */}
        <Content
          style={
            width <= 768
              ? { margin: "24px 6px 0", overflow: "initial" }
              : { margin: "24px 16px 0", overflow: "initial" }
          }
        >
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item className="breadcrump">
              <h2>
                Welcome Visitor{" "}
                <SmileOutlined
                  style={{ fontSize: "1.4rem", color: "yellow" }}
                />
              </h2>
              <p>{getDescriprionHeader(localStorage.getItem("path"))}</p>
            </Breadcrumb.Item>
          </Breadcrumb>
          <hr />`
          <div
            className={`site-layout-content ${
              width <= 768 ? "site-layout-content-mobile" : ""
            }`}
          >
            <RouterHome />
            <Router>
              <Routes>
                <Route path="/genre" element={<AnimeGenre />} />
                <Route
                  path="/topanime/:id"
                  element={<AllAnimeList type="topanime" />}
                />
                <Route
                  path="/genre/:id"
                  element={<AllAnimeList type="genre" />}
                />
                <Route path="/information/:id" element={<InformationAnime />} />
                <Route path="/search" element={<AnimeSearch />} />
              </Routes>
            </Router>
          </div>
        </Content>
        <hr />
        <AnimeFooter />
      </Layout>
    </Layout>
  );
}

export default App;
