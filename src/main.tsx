import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import Homepage from "./Homepage";  // Changed from App to Homepage
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Homepage />  {/* Changed from App to Homepage */}
    </HashRouter>
  </StrictMode>,
);