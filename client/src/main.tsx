import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Afficher un message de débogage
console.log("main.tsx chargé - initialisation de l'application React");

// Monkey patch pour résoudre les problèmes de removeChild
try {
  // Sauvegarder la méthode originale
  const originalRemoveChild = Node.prototype.removeChild;
  
  // Remplacer par une version sécurisée
  Node.prototype.removeChild = function(child) {
    // Si l'enfant n'est pas un enfant direct, ignorer l'erreur
    if (!this.contains(child)) {
      console.warn("Tentative de suppression d'un nœud qui n'est pas enfant, ignorée");
      return child; // Retourner l'enfant pour compatibilité
    }
    
    // Sinon, utiliser la méthode d'origine
    try {
      return originalRemoveChild.call(this, child);
    } catch (e) {
      console.warn("Erreur lors de removeChild, ignorée:", e);
      // Essayer de nettoyer les portails après une erreur
      setTimeout(() => {
        document.querySelectorAll('[data-radix-portal]').forEach(portal => {
          try {
            if (portal.parentNode) {
              portal.parentNode.removeChild(portal);
            }
          } catch (e) { /* ignorer */ }
        });
      }, 0);
      return child;
    }
  };
  
  console.log("Patch de sécurité appliqué pour removeChild");
} catch (e) {
  console.error("Échec de l'application du patch:", e);
}

// Configuration de la police
const fontConfig = {
  className: "font-sans",
};

// Fonction pour gérer le nettoyage lors des rechargements de page
function handleBeforeUnload() {
  // Nettoyer les nœuds DOM potentiellement problématiques
  const root = document.getElementById("root");
  if (root) {
    // Essayer de nettoyer le contenu si nécessaire
    try {
      // Nettoyer les portails Radix qui pourraient causer des problèmes
      document.querySelectorAll('[data-radix-portal]').forEach(portal => {
        try {
          document.body.removeChild(portal);
        } catch (e) { /* ignorer */ }
      });
      
      // Nettoyer les effets React d'abord
      if (window.__REACT_ROOT_INSTANCE) {
        // @ts-ignore - Propriété interne de React
        window.__REACT_ROOT_INSTANCE.unmount();
      }
    } catch (e) {
      console.warn("Erreur lors du nettoyage React:", e);
    }
  }
}

// Écouter les événements de navigation
window.addEventListener("beforeunload", handleBeforeUnload);

// Nettoyer le DOM au changement de route
window.addEventListener("hashchange", () => {
  document.querySelectorAll('[data-radix-portal]').forEach(portal => {
    try {
      if (portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
    } catch (e) { /* ignorer */ }
  });
});

try {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Élément racine non trouvé !");
    throw new Error("Élément racine non trouvé");
  }
  
  // Nettoyer le contenu existant pour éviter les problèmes de cache DOM
  root.innerHTML = '';
  
  console.log("Rendu de l'application...");
  const rootInstance = createRoot(root);
  
  // Stocker l'instance pour un nettoyage potentiel
  // @ts-ignore
  window.__REACT_ROOT_INSTANCE = rootInstance;
  
  rootInstance.render(
    <div className={fontConfig.className}>
      <App />
    </div>
  );
  console.log("Rendu terminé");
} catch (error) {
  console.error("Erreur lors du rendu de l'application:", error);
  // Afficher l'erreur à l'utilisateur
  const errorDisplay = document.getElementById("error-display") || document.createElement("div");
  errorDisplay.id = "error-display";
  errorDisplay.style.cssText = "position: fixed; top: 0; left: 0; right: 0; background: #f44336; color: white; padding: 10px; z-index: 9999; text-align: center;";
  errorDisplay.textContent = `Erreur de rendu: ${error instanceof Error ? error.message : String(error)}`;
  
  if (!document.getElementById("error-display")) {
    document.body.prepend(errorDisplay);
  }
}
