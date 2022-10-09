import React from "react";

export const getTodayDay = () => {
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

export const getDescriprionHeader = (path) => {
  //const path = localStorage.getItem("path");
  let split = window.location.href.split("/");
  const topanime = split[split.length - 1];
  let descr = "";
  if (path === "home") {
    descr = "Scroll down and check out today's trending anime and releases !";
  }
  if (path === "genre") {
    descr = "Search anime by genre!";
  }
  if (path === "search") {
    descr =
      "Search all the anime you prefer by entering a title in the search bar !";
  }
  if (path === "information") {
    descr = "Description anime !";
  }

  if (path === "topanime") {
    descr = `Discover all topanime by category: ${topanime} !`;
  }
  return descr;
};

export const getPathName = () => {
  const href = window.location.href;
  const split = href.split("/");
  const pathSplit2 = split[split.length - 2];

  let path = "";
  if (pathSplit2 === "information") {
    path = pathSplit2;
  }
  if (pathSplit2 === "genre") {
    path = pathSplit2;
  }
  if (pathSplit2 === "topanime") {
    path = pathSplit2;
  }
  if (
    pathSplit2 !== "information" &&
    pathSplit2 !== "genre" &&
    pathSplit2 !== "topanime"
  ) {
    if (split[split.length - 1] === "") {
      path = "home";
    } else {
      path = split[split.length - 1];
    }
  }

  localStorage.setItem("path", path);

  return path;
};
