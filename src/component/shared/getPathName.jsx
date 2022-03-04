import React from "react";

export const getPathName = () => {
  const href = window.location.href;
  const split = href.split("/");
  const pathInformation = split[split.length - 2];
  let path = "";
  if (pathInformation !== "information") {
    if (split[split.length - 1] === "") {
      path = "home";
    } else {
      path = split[split.length - 1];
    }
  } else {
    path = pathInformation;
  }
  localStorage.setItem("path", path);

  return path;
};
