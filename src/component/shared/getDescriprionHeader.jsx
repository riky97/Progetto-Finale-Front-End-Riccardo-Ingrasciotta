import React from "react";

export const getDescriprionHeader = (path) => {
  //const path = localStorage.getItem("path");
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
  return descr;
};
