import React from "react";
import ReactDOM from "react-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";

// antd's CSS-variable build — required for ConfigProvider theming on v4.
import "antd/dist/antd.variable.min.css";
import "./styles/tokens.css";
import "./styles/antd-overrides.css";
import "./styles/app.css";

import App from "./App";
import { ErrorBannerProvider } from "./hooks/useErrorBanner";
import { LibraryProvider } from "./hooks/useLibrary";
import { configureAntdTheme } from "./theme/antdTheme";
import { clerkAppearance } from "./theme/clerkAppearance";

configureAntdTheme();

/**
 * Clerk's publishable key. Not a secret — it identifies the Clerk instance and
 * ships in the bundle — but the app cannot render without it, so fail loudly
 * here rather than with an opaque Clerk error deeper in the tree.
 */
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY is not set. Copy .env.example to .env.local and fill it in.",
  );
}

ReactDOM.render(
  <React.StrictMode>
    {/*
      Nesting, outermost first:
        ClerkProvider      — session state, needed by the router-level guards
        ConfigProvider     — antd theming
        BrowserRouter      — one router for the whole tree (see App.tsx)
        ErrorBannerProvider — mid-session action failures; above LibraryProvider,
                              which reports its toggle failures through it
        LibraryProvider    — favorites/watched, needs Clerk's getToken above it
    */}
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkAppearance}
    >
      <ConfigProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ErrorBannerProvider>
            <LibraryProvider>
              <App />
            </LibraryProvider>
          </ErrorBannerProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ClerkProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
