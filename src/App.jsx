//CSS
import "./component/home/home.css";
import "./component/partials/partials.css";

//COMPONENT
import AnimeSidebar from "./component/partials/AnimeSidebar";
import AnimeFooter from "./component/partials/AnimeFooter";
import RouterHome from "./component/home/RouterHome";

//ANTD
import { Layout, Menu, Breadcrumb } from "antd";
const { Header, Content, Footer, Sider } = Layout;

function App() {
  return (
    <Layout hasSider>
      <AnimeSidebar />
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
            <RouterHome />
          </div>
        </Content>
        <AnimeFooter />
      </Layout>
    </Layout>
  );
}

export default App;
