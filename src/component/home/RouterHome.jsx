//REACT ROUTER DOM
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { useState, useEffect } from "react";

//API
import { getTopAnimeUpcoming } from "../../api/home/getTopAnimeUpcoming";
import { getTopAnimeTV } from "../../api/home/getTopAnimeTV";
import { getTopAnimeMovie } from "../../api/home/getTopAnimeMovie";
import { getScheduleAnimeToday } from "../../api/home/getScheduleAnimeToday";

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
  const [topAnimeMovie, setTopAnimeMovie] = useState([]);
  const { height, width } = useWindowDimensions();

  //schedule
  useEffect(() => {
    const anime = async () => {
      const res = await getScheduleAnimeToday();
      const today = getTodayDay();

      setScheduleAnimeToday(res[today]);

      // setScheduleAnimeToday(res[today].slice(0, 10));

      // setScheduleAnimeToday(res[today].slice(0, 15));
    };
    anime();
  }, []);

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

  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/"
          element={
            <>
              <CarouselAnime
                animeList={
                  width > 768
                    ? scheduleAnimeToday.slice(0, 20)
                    : scheduleAnimeToday.slice(0, 10)
                }
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
                path="/topanime/movie"
                titleSection={`top ${topAnimeMovie.length} movie`}
                pageSizeAnime={1}
                information={topAnimeMovie}
              />
              <hr />
            </>
          }
        />
        <Route
          exact
          path="/home"
          element={
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
                path="/topanime/movie"
                titleSection={`top ${topAnimeMovie.length} movie`}
                pageSizeAnime={1}
                information={topAnimeMovie}
              />
              <hr />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default RouterHome;
