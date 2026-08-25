import { useLocation, useParams } from "react-router-dom";

/**
 * Derives the active section from the router rather than from
 * `window.location.href.split("/")` + `localStorage`, which is how the old
 * `getPathName` / `getDescriprionHeader` pair worked. Because this reads
 * `useLocation`, it re-renders correctly on back/forward navigation — the
 * localStorage version did not.
 */
export type SectionKey =
  | "home"
  | "genre"
  | "search"
  | "topanime"
  | "information"
  | "favorites"
  | "watched"
  | "auth";

export interface Section {
  key: SectionKey;
  /** Shown in the broadcast strip. */
  label: string;
  description: string;
}

export function useSection(): Section {
  const { pathname } = useLocation();
  const params = useParams();
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";

  switch (segment) {
    case "genre":
      return params.genreId
        ? {
            key: "genre",
            label: "Genre",
            description: "Every anime carrying this tag, most popular first.",
          }
        : {
            key: "genre",
            label: "Genre",
            description: "Pick a genre to browse what it's known for.",
          };
    case "search":
      return {
        key: "search",
        label: "Search",
        description: "Find any anime by title.",
      };
    case "topanime":
      return {
        key: "topanime",
        label: "Top anime",
        description: `The full ranking${
          params.type ? ` for ${params.type}` : ""
        }, straight from MyAnimeList.`,
      };
    case "information":
      return {
        key: "information",
        label: "Detail",
        description: "Synopsis, studio, score and where it sits in the ranking.",
      };
    case "favorites":
      return {
        key: "favorites",
        label: "Favourites",
        description: "Everything you've kept, newest first.",
      };
    case "watched":
      return {
        key: "watched",
        label: "Watched",
        description: "The titles you've marked as seen.",
      };
    case "sign-in":
    case "sign-up":
      return {
        key: "auth",
        label: "Account",
        description: "Sign in to keep favourites and track what you've watched.",
      };
    default:
      return {
        key: "home",
        label: "Home",
        description: "Today's airing schedule, plus what's topping the charts.",
      };
  }
}

/** Nav key used to highlight the sidebar/rail item for a given path. */
export function sectionKeyForPath(pathname: string): SectionKey {
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (segment === "genre") return "genre";
  if (segment === "search") return "search";
  if (segment === "topanime") return "topanime";
  if (segment === "information") return "information";
  if (segment === "favorites") return "favorites";
  if (segment === "watched") return "watched";
  if (segment === "sign-in" || segment === "sign-up") return "auth";
  return "home";
}
