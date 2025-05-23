'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ShieldCheck,
  FileText,
  User
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const standardNavItems = [
  { label: 'Tableau de bord', href: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Planning', href: '/planning', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Chantiers', href: '/chantiers', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Arborescence', href: '/chantiers/arborescence', icon: <FolderTree className="h-5 w-5" /> },
  { label: 'Tâches', href: '/taches', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Équipes', href: '/equipes', icon: <Users className="h-5 w-5" /> },
  { label: 'Ressources', href: '/ressources', icon: <Users className="h-5 w-5" /> },
  { label: 'Rapports', href: '/rapports', icon: <FileText className="h-5 w-5" /> },
  { label: 'Mon Compte', href: '/mon-compte', icon: <User className="h-5 w-5" /> },
  { label: 'Configuration', href: '/configuration', icon: <Settings className="h-5 w-5" /> },
];

const adminNavItem = { 
  label: 'Administration', 
  href: '/admin', 
  icon: <ShieldCheck className="h-5 w-5" /> 
};

// Créer un composant qui affiche un message d'aide pour l'accès admin
const AdminAccessHelper = () => {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="mt-2 pt-2 border-t border-gray-200">
      <button
        className="text-xs text-blue-600 hover:underline"
        onClick={() => setShowHelp(!showHelp)}
      >
        {showHelp ? "Masquer l'aide" : "Besoin d'accès administrateur ?"}
      </button>
      
      {showHelp && (
        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <p>Pour accéder au panneau d'administration, ajoutez <strong>?admin_access=Spiess2025!</strong> à l'URL.</p>
          <p className="mt-1">Par exemple: <code>{typeof window !== 'undefined' ? window.location.origin : ''}/?admin_access=Spiess2025!</code></p>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const pathname = usePathname();
  
  // État pour stocker les infos utilisateur avec admin par défaut sur false
  const [userInfo, setUserInfo] = useState({
    username: "antoine",
    role: "service_interne",
    isAdmin: false
  });
  
  // Vérifier si l'accès admin est activé
  useEffect(() => {
    // Vérifier le paramètre d'URL
    const urlParams = new URLSearchParams(window.location.search);
    const adminAccessKey = urlParams.get('admin_access');
    const secretKey = "Spiess2025!";
    
    // Vérifier la session storage
    const isAdminSession = sessionStorage.getItem('admin_mode') === 'true';
    
    // Si la clé est valide ou la session existe déjà
    if (adminAccessKey === secretKey || isAdminSession) {
      setUserInfo({
        username: "antoine",
        role: "geometre_projeteur",
        isAdmin: true
      });
      
      // Sauvegarder dans la session
      sessionStorage.setItem('admin_mode', 'true');
      
      // Masquer le paramètre d'URL pour plus de sécurité
      if (adminAccessKey) {
        const currentPath = window.location.pathname;
        window.history.replaceState({}, document.title, currentPath);
      }
    }
  }, []);
  
  // Déterminer les éléments de navigation à afficher
  const finalNavItems = userInfo.isAdmin 
    ? [...standardNavItems, adminNavItem]
    : standardNavItems;

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
            {finalNavItems.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href !== '/' && pathname?.startsWith(item.href));
              
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
              <p className="text-xs text-gray-500">
                {userInfo.isAdmin ? "Administrateur" : (userInfo.username === "antoine" ? "Géomètre" : "Directeur")}
              </p>
            </div>
          </div>
          
          {/* Afficher le composant d'aide pour l'accès admin */}
          <AdminAccessHelper />
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

