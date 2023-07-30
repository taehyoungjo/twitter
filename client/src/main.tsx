import React from "react";
import ReactDOM from "react-dom/client";
import { Feed } from "./Feed.tsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Twitter</div>,
  },
  {
    path: "/user/:username",
    element: <Feed />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
