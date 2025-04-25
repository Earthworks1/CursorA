import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Chantiers from "@/pages/chantiers/index";
import Taches from "@/pages/taches/index";
import TacheDetail from "@/pages/taches/[id]";
import Equipes from "@/pages/equipes/index";
import Plans from "@/pages/plans/index";
import Rapports from "@/pages/rapports/index";
import MonCompte from "@/pages/mon-compte/index";
import Configuration from "@/pages/configuration/index";
import WorkloadPage from "@/pages/WorkloadPage";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dynamic from "@/components/ui/dynamic";
import { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";

// Variables pour suivre l'état de la navigation
let isNavigating = false;
let pendingNavigation: string | null = null;

// Créer une version de wouter qui fonctionne avec les déploiements statiques
function useHashLocation(): [string, (to: string) => void] {
  // Obtenir le chemin actuel en enlevant le hash
  const getHashPath = () => {
    // Si nous avons un chemin initial stocké (pour la première navigation), utilisez-le
    if (window.initialPath) {
      const path = window.initialPath;
      console.log("Utilisation du chemin initial:", path);
      // Effacer pour ne pas le réutiliser
      window.initialPath = undefined;
      return path;
    }
    
    const path = window.location.hash.replace("#", "") || "/";
    console.log("Chemin hash actuel:", path);
    return path;
  };

  const [path, setPath] = useState(getHashPath());

  const navigate = (to: string) => {
    // Prévenir les navigations multiples rapprochées qui peuvent causer des problèmes DOM
    if (to === path) {
      console.log("Navigation évitée: déjà à la destination", to);
      return;
    }
    
    // Si une navigation est déjà en cours, mémoriser la suivante
    if (isNavigating) {
      console.log("Navigation en cours, mise en file d'attente de:", to);
      pendingNavigation = to;
      return;
    }
    
    isNavigating = true;
    console.log("Navigation vers:", to);
    
    // Délai pour permettre le nettoyage des composants avant de changer de route
    setTimeout(() => {
      try {
        window.location.hash = to;
      } catch (e) {
        console.error("Erreur de navigation:", e);
      }
      
      // Autoriser une nouvelle navigation après un délai pour éviter les problèmes DOM
      setTimeout(() => {
        isNavigating = false;
        
        // Traiter la navigation en attente s'il y en a une
        if (pendingNavigation) {
          const nextNav = pendingNavigation;
          pendingNavigation = null;
          navigate(nextNav);
        }
      }, 300);
    }, 100);
  };

  useEffect(() => {
    // Mettre à jour le chemin quand le hash change
    const handleHashChange = () => {
      console.log("Hash a changé, mise à jour du chemin");
      const newPath = getHashPath();
      if (newPath !== path) {
        setPath(newPath);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // Si nous n'avons pas de hash mais un chemin, initialiser le hash
    if (window.location.hash === "" && window.location.pathname !== "/") {
      console.log("Initialisation du hash avec le pathname:", window.location.pathname);
      window.location.hash = window.location.pathname;
    }
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [path]);

  return [path, navigate];
}

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div ref={contentRef} key={location.pathname} className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  console.log("Router component initializing");
  
  // Utilisation du crochet useLocation personnalisé
  const [location] = useHashLocation();
  
  return (
    <Switch hook={useHashLocation}>
      <Route path="/">
        {() => {
          console.log("Rendering dashboard route");
          return (
            <Layout>
              <Dashboard />
            </Layout>
          );
        }}
      </Route>
      <Route path="/chantiers">
        {() => {
          console.log("Rendering /chantiers route");
          return (
            <Layout>
              <Chantiers />
            </Layout>
          );
        }}
      </Route>
      <Route path="/chantiers/new">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/chantiers/new").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/chantiers/arborescence">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/chantiers/arborescence").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/chantiers/:id">
        {(params) => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/chantiers/[id]").then(mod => <mod.default id={params.id} />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/chantiers/:id/edit">
        {(params) => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/chantiers/[id]/edit").then(mod => <mod.default id={params.id} />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/taches">
        {() => (
          <Layout>
            <Taches />
          </Layout>
        )}
      </Route>
      <Route path="/taches/new">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/taches/new").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/taches/:id">
        {(params) => (
          <Layout>
            <TacheDetail id={params.id} />
          </Layout>
        )}
      </Route>
      <Route path="/taches/:id/edit">
        {(params) => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/taches/[id]/edit").then(mod => <mod.default id={params.id} />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/equipes">
        {() => (
          <Layout>
            <Equipes />
          </Layout>
        )}
      </Route>
      <Route path="/plans">
        {() => (
          <Layout>
            <Plans />
          </Layout>
        )}
      </Route>
      <Route path="/rapports">
        {() => (
          <Layout>
            <Rapports />
          </Layout>
        )}
      </Route>
      <Route path="/mon-compte">
        {() => (
          <Layout>
            <MonCompte />
          </Layout>
        )}
      </Route>
      <Route path="/configuration">
        {() => (
          <Layout>
            <Configuration />
          </Layout>
        )}
      </Route>
      <Route path="/configuration/interface">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/configuration/interface").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/ressources">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/ressources/index").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/ressources/new">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/ressources/new").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/ressources/planning">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/ressources/planning").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/planning">
        {() => (
          <Layout>
            <WorkloadPage />
          </Layout>
        )}
      </Route>
      <Route path="/ressources/:id">
        {(params) => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/ressources/[id]").then(mod => <mod.default id={params.id} />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      <Route path="/ressources/:id/edit">
        {(params) => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/ressources/[id]/edit").then(mod => <mod.default id={params.id} />)}
            </Dynamic>
          </Layout>
        )}
      </Route>
      
      <Route path="/admin">
        {() => (
          <Layout>
            <Dynamic>
              {() => import("@/pages/admin/index").then(mod => <mod.default />)}
            </Dynamic>
          </Layout>
        )}
      </Route>

      <Route>
        {(params) => {
          console.log("Route not found, path:", window.location.pathname);
          return <NotFound />;
        }}
      </Route>
    </Switch>
  );
}

function App() {
  console.log("App component initializing");
  
  useEffect(() => {
    console.log("App mounted");
    
    // Vérifier si les scripts et styles sont chargés correctement
    const checkResources = () => {
      const scripts = document.querySelectorAll('script');
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      
      console.log(`Resources loaded: ${scripts.length} scripts, ${styles.length} stylesheets`);
    };
    
    checkResources();
    
    // Supprimer l'écran de chargement après un délai
    const timeout = setTimeout(() => {
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.display = 'none';
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;