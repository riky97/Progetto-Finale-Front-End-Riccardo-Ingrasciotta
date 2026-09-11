import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import App from "./App";
import { ErrorBannerProvider } from "./hooks/useErrorBanner";
import { LibraryProvider } from "./hooks/useLibrary";

/**
 * Clerk is stubbed rather than provided for real: `<ClerkProvider>` opens a
 * session with Clerk's frontend API on mount, which a unit test must not do.
 * `signedIn` below flips the whole stub, so the same shell can be asserted in
 * both auth states.
 */
let signedIn = false;

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: signedIn,
    getToken: async () => (signedIn ? "test-token" : null),
  }),
  SignedIn: ({ children }: { children: ReactNode }) =>
    signedIn ? <>{children}</> : null,
  SignedOut: ({ children }: { children: ReactNode }) =>
    signedIn ? null : <>{children}</>,
  UserButton: () => <div data-testid="user-button" />,
  SignIn: () => <div data-testid="clerk-sign-in" />,
  SignUp: () => <div data-testid="clerk-sign-up" />,
}));

vi.mock("@/api/library", () => ({
  getCollection: vi.fn(async () => []),
  addToCollection: vi.fn(async () => {}),
  removeFromCollection: vi.fn(async () => {}),
}));

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
  getAnimeByIds: vi.fn(() => new Promise(() => {})),
  scoreOutOfTen: (score: number | null) =>
    score === null ? null : (score / 10).toFixed(1),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ErrorBannerProvider>
        <LibraryProvider>
          <App />
        </LibraryProvider>
      </ErrorBannerProvider>
    </MemoryRouter>,
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signedIn = false;
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

  it("offers sign-in and hides the library nav while signed out", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /favourites/i })).toBeNull();
    expect(screen.queryByTestId("user-button")).toBeNull();
  });

  it("swaps in the user button and library nav once signed in", () => {
    signedIn = true;
    renderAt("/");

    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /favourites/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /watched/i })).toBeInTheDocument();
  });

  it("reads the genre filters out of the query string", async () => {
    const { getAnimeByGenre } = await import("@/api/anime");

    renderAt("/genre/Action?sort=score&format=movie&score=7.5&status=releasing&year=2020&page=2");

    expect(getAnimeByGenre).toHaveBeenCalledWith("Action", {
      page: 2,
      limit: 24,
      sort: "score",
      format: "movie",
      status: "releasing",
      minScore: 7.5,
      year: 2020,
    });
  });

  it("resets to page 1 when a filter changes, keeping the other filters", async () => {
    const { getAnimeByGenre } = await import("@/api/anime");

    renderAt("/genre/Action?format=movie&page=3");
    vi.mocked(getAnimeByGenre).mockClear();

    fireEvent.change(screen.getByLabelText(/sort/i), {
      target: { value: "trending" },
    });

    expect(getAnimeByGenre).toHaveBeenCalledWith(
      "Action",
      expect.objectContaining({ page: 1, sort: "trending", format: "movie" }),
    );
  });

  it("clears every filter from the URL with one control", async () => {
    const { getAnimeByGenre } = await import("@/api/anime");

    renderAt("/genre/Action?sort=score&format=movie&year=2020");
    vi.mocked(getAnimeByGenre).mockClear();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    expect(getAnimeByGenre).toHaveBeenCalledWith("Action", {
      page: 1,
      limit: 24,
      sort: "popularity",
      format: undefined,
      status: undefined,
      minScore: undefined,
      year: undefined,
    });
  });

  it("keeps the filter bar off the top charts, which are a fixed chart", () => {
    renderAt("/topanime/tv");
    expect(screen.queryByRole("button", { name: /clear filters/i })).toBeNull();
    expect(screen.queryByLabelText(/min score/i)).toBeNull();
  });

  it("explains the signed-out state on /favorites instead of redirecting", () => {
    renderAt("/favorites");

    expect(screen.getByText(/signed out/i)).toBeInTheDocument();
    // Still on the route — the URL is preserved for after sign-in.
    expect(
      screen.getByRole("heading", { level: 1, name: /favourites/i }),
    ).toBeInTheDocument();
  });
});
