import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Inter } from "next/font/google";

// Chargement de la police Inter
const inter = {
  variable: "--font-sans",
  className: "font-sans",
};

createRoot(document.getElementById("root")!).render(
  <div className={inter.className}>
    <App />
  </div>
);
