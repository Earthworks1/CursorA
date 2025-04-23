import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Configuration de la police
const fontConfig = {
  className: "font-sans",
};

createRoot(document.getElementById("root")!).render(
  <div className={fontConfig.className}>
    <App />
  </div>
);
