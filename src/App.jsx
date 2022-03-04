//CSS
import "./component/home/home.css";
import "./component/partials/partials.css";

//COMPONENT
import AnimeSidebar from "./component/partials/AnimeSidebar";
import AnimeFooter from "./component/partials/AnimeFooter";
import RouterHome from "./component/home/RouterHome";

//SHARED
import { getPathName } from "./component/shared/getPathName";
import useWindowDimensions from "./component/shared/UseWindowDimensions";

//ANTD
import { Layout, Menu, Breadcrumb } from "antd";
import { useEffect } from "react";
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
        <Header
          className="site-layout-background"
          style={{ padding: 0 }}
        ></Header>
        <Content
          style={
            width <= 768
              ? { margin: "24px 6px 0", overflow: "initial" }
              : { margin: "24px 16px 0", overflow: "initial" }
          }
        >
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-content">
            <RouterHome />
          </div>
        </Content>
        <AnimeFooter />
      </Layout>
    </Layout>
  );
}

export default App;
