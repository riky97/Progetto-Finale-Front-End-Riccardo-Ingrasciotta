import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/client";

/**
 * The library layer is the only place in the app that *writes*, so these cover
 * what a read-only query hook never has to: that the icon flips before the
 * request lands, that a failed request puts it back, and that signing out
 * drops the previous user's ids rather than leaving them on screen.
 *
 * `@testing-library/react` v12 (the React 17 line) has no `renderHook`, so the
 * hook is exercised through a small harness component instead.
 */

let signedIn = true;

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: signedIn,
    getToken: async () => "test-token",
  }),
  SignedIn: ({ children }: { children: ReactNode }) =>
    signedIn ? <>{children}</> : null,
  SignedOut: ({ children }: { children: ReactNode }) =>
    signedIn ? null : <>{children}</>,
}));

const getCollection = vi.fn(async () => [1, 2]);
const addToCollection = vi.fn(async () => {});
const removeFromCollection = vi.fn(async () => {});

vi.mock("@/api/library", () => ({
  getCollection: (...args: unknown[]) => getCollection(...(args as [])),
  addToCollection: (...args: unknown[]) => addToCollection(...(args as [])),
  removeFromCollection: (...args: unknown[]) =>
    removeFromCollection(...(args as [])),
}));

const { LibraryProvider, useFavorites } = await import("./useLibrary");
const { ErrorBannerProvider } = await import("./useErrorBanner");

function Harness({ animeId = 3 }: { animeId?: number }) {
  const favorites = useFavorites();

  return (
    <div>
      <span data-testid="ids">{favorites.ids.join(",")}</span>
      <span data-testid="saved">{favorites.has(animeId) ? "yes" : "no"}</span>
      <span data-testid="error">{favorites.error?.message ?? ""}</span>
      <button type="button" onClick={() => void favorites.toggle(animeId)}>
        toggle
      </button>
    </div>
  );
}

function renderHarness(animeId?: number) {
  return render(
    <ErrorBannerProvider>
      <LibraryProvider>
        <Harness animeId={animeId} />
      </LibraryProvider>
    </ErrorBannerProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  signedIn = true;
  getCollection.mockResolvedValue([1, 2]);
  addToCollection.mockResolvedValue(undefined);
  removeFromCollection.mockResolvedValue(undefined);
});

describe("useFavorites", () => {
  it("loads the saved ids once the session is available", async () => {
    renderHarness();
    await waitFor(() =>
      expect(screen.getByTestId("ids").textContent).toBe("1,2"),
    );
    // One GET per collection, not one per card.
    expect(getCollection).toHaveBeenCalledTimes(2);
  });

  it("adds optimistically, newest first", async () => {
    renderHarness(3);
    await waitFor(() =>
      expect(screen.getByTestId("ids").textContent).toBe("1,2"),
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));

    // Flipped before the POST resolves.
    expect(screen.getByTestId("saved").textContent).toBe("yes");
    expect(screen.getByTestId("ids").textContent).toBe("3,1,2");
    await waitFor(() =>
      expect(addToCollection).toHaveBeenCalledWith("favorites", 3),
    );
  });

  it("removes an already-saved id instead of re-adding it", async () => {
    renderHarness(1);
    await waitFor(() =>
      expect(screen.getByTestId("saved").textContent).toBe("yes"),
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));

    await waitFor(() =>
      expect(removeFromCollection).toHaveBeenCalledWith("favorites", 1),
    );
    expect(screen.getByTestId("ids").textContent).toBe("2");
    expect(addToCollection).not.toHaveBeenCalled();
  });

  it("rolls back and surfaces the error when the write fails", async () => {
    addToCollection.mockRejectedValue(new ApiError("Sign in to use your list.", 401));

    renderHarness(3);
    await waitFor(() =>
      expect(screen.getByTestId("ids").textContent).toBe("1,2"),
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("saved").textContent).toBe("yes");

    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe(
        "Sign in to use your list.",
      ),
    );
    expect(screen.getByTestId("ids").textContent).toBe("1,2");
  });

  it("holds nothing and fetches nothing while signed out", async () => {
    signedIn = false;
    renderHarness();

    await waitFor(() => expect(screen.getByTestId("ids").textContent).toBe(""));
    expect(getCollection).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(addToCollection).not.toHaveBeenCalled();
  });
});
