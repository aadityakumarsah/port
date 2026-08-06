/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Blog } from "./Blog";
import { BlogAdmin } from "./BlogAdmin";
import "./index.css";

const elem = document.getElementById("root")!;

function Router() {
  const path = window.location.pathname;
  if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/blog/admin")) {
    return <BlogAdmin />;
  }
  if (path.startsWith("/blog")) {
    return <Blog />;
  }
  return <App />;
}

const app = (
  <StrictMode>
    <Router />
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
