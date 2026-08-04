import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "./App";

// The shell must render without hitting AniList. Note `scoreOutOfTen` is a
// pure helper that also lives in this module and is called during render, so
// the mock has to provide a real implementation rather than a stub.
vi.mock("@/api/anime", () => ({
  getTopAnime: vi.fn(() => new Promise(() => {})),
  getUpcomingAnime: vi.fn(() => new Promise(() => {})),
  getScheduleForDay: vi.fn(() => new Promise(() => {})),
  getAnimeGenres: vi.fn(() => new Promise(() => {})),
  searchAnime: vi.fn(() => new Promise(() => {})),
  getAnimeByGenre: vi.fn(() => new Promise(() => {})),
  getAnimeById: vi.fn(() => new Promise(() => {})),
  scoreOutOfTen: (score: number | null) =>
    score === null ? null : (score / 10).toFixed(1),
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

  it("marks the matching sidebar item active from the URL", () => {
    const { container } = renderAt("/genre");
    expect(
      container.querySelector(".ant-menu-item-selected")?.textContent,
    ).toMatch(/genre/i);
  });

  it("shows a not-found state for an unknown route", () => {
    renderAt("/nope");
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
