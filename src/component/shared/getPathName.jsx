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
