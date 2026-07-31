import { Route, Routes } from "react-router-dom";
import SheetFooter from "@/components/layout/SheetFooter";
import SheetHeader from "@/components/layout/SheetHeader";
import Spine from "@/components/layout/Spine";
import BrowsePage from "@/features/browse/BrowsePage";
import GenreIndexPage from "@/features/genre/GenreIndexPage";
import HomePage from "@/features/home/HomePage";
import InformationPage from "@/features/information/InformationPage";
import SearchPage from "@/features/search/SearchPage";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { EmptyState } from "@/components/States";
import { cn } from "@/lib/utils";

/**
 * The layout shell plus the route table. `<BrowserRouter>` lives in main.tsx
 * so it wraps everything — previously the app nested two separate `<Router>`
 * elements partway down the tree, which is why the sidebar and header could
 * not read router state.
 */
export default function App() {
  const { isMobile } = useWindowDimensions();

  return (
    <div className="min-h-screen bg-paper">
      <a
        href="#sheet"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:bg-ink focus-visible:px-4 focus-visible:py-2 focus-visible:font-mono focus-visible:text-xs focus-visible:tracking-widest focus-visible:text-paper focus-visible:uppercase"
      >
        Skip to content
      </a>

      <Spine isMobile={isMobile} />

      <div
        className={cn(
          "flex min-h-screen flex-col px-5 sm:px-8 lg:px-12",
          isMobile
            ? "pb-[var(--rail-h)]"
            : "ml-[var(--spine-w)] pl-9 lg:pl-14 xl:pl-16",
        )}
      >
        <div className="mx-auto flex w-full max-w-[110rem] flex-1 flex-col">
          <SheetHeader />

          <main id="sheet" className="flex-1 pb-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/genre" element={<GenreIndexPage />} />
              <Route
                path="/genre/:genreId"
                element={<BrowsePage mode="genre" />}
              />
              <Route
                path="/topanime/:type"
                element={<BrowsePage mode="topanime" />}
              />
              <Route path="/information/:id" element={<InformationPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route
                path="*"
                element={
                  <EmptyState
                    mark="No such cut"
                    title="Page not found"
                    body="That route doesn't exist. Use the sections on the left to get back to the charts."
                  />
                }
              />
            </Routes>
          </main>

          <SheetFooter />
        </div>
      </div>
    </div>
  );
}
