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

//SHARED
import { getPathName } from "./component/shared/getPathName";
import useWindowDimensions from "./component/shared/UseWindowDimensions";

//ANTD
import { Layout, Menu, Breadcrumb } from "antd";
import { SmileOutlined } from "@ant-design/icons";
const { Header, Content, Footer, Sider } = Layout;

function App() {
  const { height, width } = useWindowDimensions();
  getPathName();
  return (
    <Layout hasSider>
      {width <= 768 ? "" : <AnimeSidebar />}

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
              <p>Today's home</p>
            </Breadcrumb.Item>
          </Breadcrumb>
          <hr />
          <div className="site-layout-content">
            <RouterHome />
            <Router>
              <Routes>
                <Route path="/genre" element={<AnimeGenre />} />
              </Routes>
            </Router>
          </div>
        </Content>
        <AnimeFooter />
      </Layout>
    </Layout>
  );
}

export default App;
