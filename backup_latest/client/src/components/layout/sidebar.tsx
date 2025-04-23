import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  Users, 
  Package, 
  Settings, 
  Calendar,
  FolderTree,
  ChevronLeft,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Pour l'accès administrateur, nous autorisons plusieurs rôles
// Dans un cas réel, ceci serait récupéré de l'état d'authentification
const userInfo = {
  username: "antoine", // Supposons que vous êtes connecté
  role: "service_interne" // Votre rôle
};

// Fonction pour vérifier si l'utilisateur est administrateur du site
const isAdminUser = (username: string, role: string) => {
  // Seul Antoine est administrateur du site
  return username === "antoine";
};

const standardNavItems = [
  { label: 'Tableau de bord', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Chantiers', href: '/chantiers', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Arborescence', href: '/chantiers/arborescence', icon: <FolderTree className="h-5 w-5" /> },
  { label: 'Tâches', href: '/taches', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Équipes', href: '/equipes', icon: <Users className="h-5 w-5" /> },
  { label: 'Ressources', href: '/ressources', icon: <Package className="h-5 w-5" /> },
  { label: 'Planning', href: '/ressources/planning', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Paramètres', href: '/configuration', icon: <Settings className="h-5 w-5" /> },
];

// Ajouter l'élément d'administration pour les administrateurs du site
const adminNavItem = { 
  label: 'Administration', 
  href: '/admin', 
  icon: <ShieldCheck className="h-5 w-5" /> 
};

// Combiner les éléments de navigation en fonction des droits d'administration
const navItems = isAdminUser(userInfo.username, userInfo.role)
  ? [...standardNavItems, adminNavItem] 
  : standardNavItems;

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [location] = useLocation();

  return (
    <>
      {/* Sidebar pour desktop et mobile (quand ouvert) */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col h-full fixed md:sticky top-0 left-0 z-30 transition-all duration-300 shadow-lg md:shadow-none",
          open ? "w-64" : "w-0 md:w-64 -translate-x-full md:translate-x-0 overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Spiess TP</h1>
            <p className="text-gray-500 text-sm">Gestion de chantiers</p>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 md:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || 
                              (item.href !== '/dashboard' && location.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <div
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setOpen(false);
                      }
                    }}
                    className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                      isActive
                        ? 'text-blue-700 bg-blue-50 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Link href={item.href} className="flex items-center w-full">
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {userInfo.username === "antoine" ? "AN" : "JM"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{userInfo.username === "antoine" ? "Antoine" : "Jean-Michel"}</p>
              <p className="text-xs text-gray-500">{userInfo.username === "antoine" ? "Administrateur" : "Directeur"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de menu mobile (seulement quand sidebar fermé) */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 md:hidden z-40 bg-blue-600 text-white rounded-full p-3 shadow-lg",
          open ? "hidden" : "block"
        )}
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;