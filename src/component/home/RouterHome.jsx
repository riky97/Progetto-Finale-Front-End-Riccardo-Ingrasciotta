//REACT ROUTER DOM
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useState, useEffect } from "react";

//API
import { getScheduleAnimeToday } from "../../api/home/getScheduleAnimeToday";
import axios from "axios";

//COMPONENT
import ViewListAnime from "./ViewListAnime";
import CarouselAnime from "./CarouselAnime";
import useWindowDimensions from "../shared/UseWindowDimensions";

//SHARED
import { getTodayDay } from "../shared/getTodayDay";

const RouterHome = () => {
  const [scheduleAnimeToday, setScheduleAnimeToday] = useState([]);
  const [topAnimeUpcoming, setTopAnimeUpcoming] = useState([]);
  const [topAnimeTV, setTopAnimeTV] = useState([]);
  const [topAnimeRecommended, setTopAnimeRecommended] = useState([]);
  const { height, width } = useWindowDimensions();

  // //schedule
  // useEffect(() => {
  //   const anime = async () => {
  //     const res = await getScheduleAnimeToday();
  //     const today = getTodayDay();
  //     setScheduleAnimeToday(res[today].slice(0, 10));
  //   };
  //   anime();
  // }, []);

  //upcoming
  useEffect(() => {
    getTopAnimeUpcoming();
    getTopAnimeTV();
    getTopAnimeMovie();
  }, []);

  //MOVIES
  const getTopAnimeMovie = async () => {
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v4/top/characters`,
    };
    try {
      const response = await axios.request(options);
      const { data } = response.data;
      setTopAnimeRecommended(data);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  //TOP ANIME TV
  const getTopAnimeTV = async () => {
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v4/top/anime`,
    };
    try {
      const response = await axios.request(options);
      const { data } = response.data;
      setTopAnimeTV(data);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  //TOP ANIME UPCOMING
  const getTopAnimeUpcoming = async () => {
    const options = {
      method: "GET",
      url: `https://api.jikan.moe/v4/seasons/upcoming`,
    };
    try {
      const response = await axios.request(options);
      const { data } = response.data;
      setTopAnimeUpcoming(data);
    } catch (error) {
      console.log("error :>> ", error);
    }
  };

  const Home = () => {
    return (
      <>
        <CarouselAnime
          animeList={scheduleAnimeToday}
          todayDay={getTodayDay()}
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
          path="/topanime/characters"
          titleSection={`top ${topAnimeRecommended.length} characters`}
          pageSizeAnime={1}
          information={topAnimeRecommended}
        />
        <hr />
      </>
    );
  };

  return (
    <Router>
      <Routes>
        <Route exact index element={<Home />} />
        {/* <Route path="*" element={<Home />} /> */}
      </Routes>
    </Router>
  );
};

export default RouterHome;
