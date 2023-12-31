import React from "react";
import ReactDOM from "react-dom/client";
import { Feed } from "./Feed.tsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { TweetView } from "./TweetView.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Twitter</div>,
  },
  {
    path: "/user/:userId",
    element: <Feed />,
  },
  {
    path: "/tweet/:id",
    element: <TweetView />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
