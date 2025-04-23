import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Afficher un message de débogage
console.log("main.tsx chargé - initialisation de l'application React");

// Configuration de la police
const fontConfig = {
  className: "font-sans",
};

try {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Élément racine non trouvé !");
    throw new Error("Élément racine non trouvé");
  }
  
  console.log("Rendu de l'application...");
  createRoot(root).render(
    <div className={fontConfig.className}>
      <App />
    </div>
  );
  console.log("Rendu terminé");
} catch (error) {
  console.error("Erreur lors du rendu de l'application:", error);
  // Afficher l'erreur à l'utilisateur
  const errorDisplay = document.getElementById("error-display");
  if (errorDisplay) {
    errorDisplay.textContent = `Erreur de rendu: ${error instanceof Error ? error.message : String(error)}`;
    errorDisplay.style.display = "block";
  }
}
