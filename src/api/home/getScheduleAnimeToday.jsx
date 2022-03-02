import axios from "axios";

export const getScheduleAnimeToday = () => {
  const getTodayDay = () => {
    const day = new Date();
    let numDay = day.getDay();
    let today = "other";
    console.log(typeof numDay);
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
  const getAnime = async () => {
    const options = {
      method: "GET",
      url: `https://jikan1.p.rapidapi.com/schedule/${getTodayDay()}`,
      headers: {
        "x-rapidapi-host": "jikan1.p.rapidapi.com",
        "x-rapidapi-key": "02981a4988msh9df5c33d8f59e71p1dafacjsnd9ae58ff2120",
      },
    };
    const response = await axios.request(options);
    const data = response.data;
    return data;
  };
  return getAnime();
};
