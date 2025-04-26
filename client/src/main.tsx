import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Afficher un message de débogage
console.log("main.tsx chargé - initialisation de l'application React");

// Configuration de la police
const fontConfig = {
  className: "font-sans",
};

// Fonction pour nettoyer les ressources
function cleanupResources() {
  // Nettoyer d'autres ressources si nécessaire
}

// Écouter les événements de navigation
window.addEventListener("beforeunload", cleanupResources);
window.addEventListener("hashchange", cleanupResources);

// Gestionnaire d'erreurs global
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Erreur globale:", { message, source, lineno, colno, error });
  return false;
};

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Élément racine non trouvé");
  }
  
  // Nettoyer le contenu existant pour éviter les problèmes de cache DOM
  root.innerHTML = '';
  
  console.log("Rendu de l'application...");
  const rootInstance = createRoot(root);
  
  rootInstance.render(
    <div className={fontConfig.className}>
      <App />
    </div>
  );
  console.log("Rendu terminé");
} catch (error) {
  console.error("Erreur lors du rendu de l'application:", error);
  
  // Afficher l'erreur à l'utilisateur de manière plus robuste
  const errorDisplay = document.createElement("div");
  errorDisplay.id = "error-display";
  errorDisplay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f44336;
    color: white;
    padding: 10px;
    z-index: 9999;
    text-align: center;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  errorDisplay.textContent = `Erreur de rendu: ${errorMessage}`;
  
  // Supprimer l'ancien affichage d'erreur s'il existe
  const existingError = document.getElementById("error-display");
  if (existingError) {
    existingError.remove();
  }
  
  document.body.prepend(errorDisplay);
}
