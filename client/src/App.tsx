import { Switch, Route } from "wouter";
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
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Dynamic from "@/components/ui/dynamic";
import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";

function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <Layout>
            <Dashboard />
          </Layout>
        )}
      </Route>
      <Route path="/chantiers">
        {() => (
          <Layout>
            <Chantiers />
          </Layout>
        )}
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
            <Dynamic>
              {() => import("@/pages/planning").then(mod => <mod.default />)}
            </Dynamic>
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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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