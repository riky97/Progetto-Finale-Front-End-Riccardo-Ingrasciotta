import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "./App";

// The shell must render without hitting the network.
vi.mock("@/api/anime", () => ({
  getTopAnime: vi.fn(() => new Promise(() => {})),
  getUpcomingAnime: vi.fn(() => new Promise(() => {})),
  getScheduleForDay: vi.fn(() => new Promise(() => {})),
  getAnimeGenres: vi.fn(() => new Promise(() => {})),
  searchAnime: vi.fn(() => new Promise(() => {})),
  getAnimeByGenre: vi.fn(() => new Promise(() => {})),
  getAnimeById: vi.fn(() => new Promise(() => {})),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the shell and the home section heading", () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { level: 1, name: /home/i }),
    ).toBeInTheDocument();
  });

  it("labels the section from the route, not from localStorage", () => {
    renderAt("/search");
    expect(
      screen.getByRole("heading", { level: 1, name: /search/i }),
    ).toBeInTheDocument();
  });

  it("marks the matching nav item active from the URL", () => {
    renderAt("/genre");
    // `aria-current` is set from the router, not from localStorage.
    const current = screen.getByRole("link", { current: "page" });
    expect(current).toHaveTextContent(/genre/i);
    expect(current).toHaveAttribute("href", "/genre");
  });

  it("shows a not-found state for an unknown route", () => {
    renderAt("/nope");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
