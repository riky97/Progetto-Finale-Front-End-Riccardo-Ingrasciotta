import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "./styles/index.css";

import App from "./App";
import { TooltipProvider } from "@/components/ui/tooltip";

ReactDOM.render(
  <React.StrictMode>
    <TooltipProvider delayDuration={400}>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </BrowserRouter>
    </TooltipProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);
