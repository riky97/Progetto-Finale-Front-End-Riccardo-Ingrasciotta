import { useEffect, useState } from "react";

//CSS
import "./component/home/home.css";
import "./component/partials/partials.css";

//API
import { getTopAnimeUpcoming } from "./api/home/getTopAnimeUpcoming";
import { getTopAnimeTV } from "./api/home/getTopAnimeTV";
import { getTopAnimeMovie } from "./api/home/getTopAnimeMovie";
import { getScheduleAnimeToday } from "./api/home/getScheduleAnimeToday";

//COMPONENT
import ViewListAnime from "./component/home/ViewListAnime";

import AnimeSidebar from "./component/partials/AnimeSidebar";
import AnimeFooter from "./component/partials/AnimeFooter";

//ANTD
import { Layout, Menu, Breadcrumb } from "antd";
const { Header, Content, Footer, Sider } = Layout;

function App() {
  const [topAnimeUpcoming, setTopAnimeUpcoming] = useState([]);
  const [topAnimeTV, setTopAnimeTV] = useState([]);
  const [topAnimeMovie, setTopAnimeMovie] = useState([]);
  const [scheduleAnimeToday, setScheduleAnimeToday] = useState([]);
  //upcoming
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnimeUpcoming();
      setTopAnimeUpcoming(res.top.slice(0, 20));
    };
    anime();
  }, []);
  //TV
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnimeTV();
      setTopAnimeTV(res.top.slice(0, 10));
    };
    anime();
  }, []);
  //movies
  useEffect(() => {
    const anime = async () => {
      const res = await getTopAnimeMovie();
      setTopAnimeMovie(res.top.slice(0, 10));
    };
    anime();
  }, []);

  //schedule
  const getTodayDay = () => {
    const day = new Date();
    let numDay = day.getDay();
    let today = "other";

    switch (numDay) {
      case 0:
        return (today = "sunday");
      case 1:
        return (today = "monday");
      case 2:
        return (today = "tuesday");
      case 3:
        return (today = "wednesday");
      case 4:
        return (today = "thursday");
      case 5:
        return (today = "friday");
      case 6:
        return (today = "saturday");
      default:
        return today;
    }
  };
  useEffect(() => {
    const anime = async () => {
      const res = await getScheduleAnimeToday();
      const today = getTodayDay();
      console.log(res[today]);
      setScheduleAnimeToday(res[today]);
    };
    anime();
  }, []);

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
            {" "}
            <ViewListAnime
              path="/schedule/today"
              titleSection={`${getTodayDay()} anime `}
              pageSizeAnime={1}
              information={scheduleAnimeToday}
            />
            <hr />
            <ViewListAnime
              path="/topanime/upcoming"
              titleSection={`top ${topAnimeUpcoming.length} anime/movie upcoming`}
              pageSizeAnime={1}
              information={topAnimeUpcoming}
            />
            <hr />
            <ViewListAnime
              path="/topanime/anime"
              titleSection={`top ${topAnimeTV.length} anime`}
              pageSizeAnime={1}
              information={topAnimeTV}
            />
            <hr />
            <ViewListAnime
              path="/topanime/movie"
              titleSection={`top ${topAnimeTV.length} movie`}
              pageSizeAnime={1}
              information={topAnimeMovie}
            />
          </div>
        </Content>
        <AnimeFooter />
      </Layout>
    </Layout>
  );
}

export default App;
