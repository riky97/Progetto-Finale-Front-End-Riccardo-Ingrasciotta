import React from "react";
import ReactDOM from "react-dom";
import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";

// antd's CSS-variable build — required for ConfigProvider theming on v4.
import "antd/dist/antd.variable.min.css";
import "./styles/tokens.css";
import "./styles/antd-overrides.css";
import "./styles/app.css";

import App from "./App";
import { configureAntdTheme } from "./theme/antdTheme";

configureAntdTheme();

ReactDOM.render(
  <React.StrictMode>
    <ConfigProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
