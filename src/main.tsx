import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Sync initial theme
const savedTheme = localStorage.getItem("sphere-theme") || "dark";
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
