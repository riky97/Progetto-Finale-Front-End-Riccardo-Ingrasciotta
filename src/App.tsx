import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";
import AnimeFooter from "@/components/layout/AnimeFooter";
import AnimeSidebar from "@/components/layout/AnimeSidebar";
import BroadcastHeader from "@/components/layout/BroadcastHeader";
import AuthPage from "@/features/auth/AuthPage";
import BrowsePage from "@/features/browse/BrowsePage";
import GenreIndexPage from "@/features/genre/GenreIndexPage";
import HomePage from "@/features/home/HomePage";
import InformationPage from "@/features/information/InformationPage";
import LibraryPage from "@/features/library/LibraryPage";
import SearchPage from "@/features/search/SearchPage";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { EmptyState } from "@/components/States";

const { Content } = Layout;

/**
 * The layout shell plus the route table. `<BrowserRouter>` lives in main.tsx
 * so it wraps everything — previously the app nested two separate `<Router>`
 * elements partway down the tree, which is why the sidebar and header could
 * not read router state.
 */
export default function App() {
  const { isMobile } = useWindowDimensions();

  return (
    <Layout className="app-shell" hasSider>
      <AnimeSidebar isMobile={isMobile} />

      <Layout className={`app-main${isMobile ? " app-main--mobile" : ""}`}>
        <BroadcastHeader />

        <Content className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/genre" element={<GenreIndexPage />} />
            <Route path="/genre/:genreId" element={<BrowsePage mode="genre" />} />
            <Route
              path="/topanime/:type"
              element={<BrowsePage mode="topanime" />}
            />
            <Route path="/information/:id" element={<InformationPage />} />
            <Route path="/search" element={<SearchPage />} />

            {/* Signed-in surfaces. They render their own "sign in to see
                this" state rather than redirecting, so the URL survives. */}
            <Route
              path="/favorites"
              element={<LibraryPage collection="favorites" />}
            />
            <Route
              path="/watched"
              element={<LibraryPage collection="watched" />}
            />

            {/* Splat routes: Clerk's routed <SignIn>/<SignUp> own their own
                sub-paths for verification, factor two and the like. */}
            <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
            <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />
            <Route
              path="*"
              element={
                <EmptyState
                  title="Page not found"
                  body="That route doesn't exist. Use the sidebar to get back to the charts."
                />
              }
            />
          </Routes>
        </Content>

        <AnimeFooter />
      </Layout>
    </Layout>
  );
}
