import React from "react";
import { createRoot } from "react-dom/client";

import App from "./app.jsx";
import "./styles/global.css";
import "./styles/auth.css";
import "./styles/authForm.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
