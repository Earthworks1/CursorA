import React, { useState } from 'react';
import { Bell, Mail, Search, Menu, X, UserCircle2, Calendar, Settings, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [notificationCount, setNotificationCount] = useState(3);
  const [messageCount, setMessageCount] = useState(2);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  
  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = () => {
    setNotificationCount(0);
  };
  
  // Fonction pour marquer tous les messages comme lus
  const markAllMessagesAsRead = () => {
    setMessageCount(0);
  };
  
  // Effets pour marquer automatiquement comme lu lorsque le menu est ouvert
  React.useEffect(() => {
    if (isNotificationOpen && notificationCount > 0) {
      // Attendre un court délai pour simuler la lecture
      const timer = setTimeout(() => {
        setNotificationCount(0);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isNotificationOpen, notificationCount]);
  
  React.useEffect(() => {
    if (isMessageOpen && messageCount > 0) {
      // Attendre un court délai pour simuler la lecture
      const timer = setTimeout(() => {
        setMessageCount(0);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMessageOpen, messageCount]);
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-3 text-gray-700" 
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Tableau de bord</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeSelector />
          
          {/* Menu des notifications */}
          <DropdownMenu onOpenChange={setIsNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{notificationCount} nouvelles</span>
                  {notificationCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={markAllNotificationsAsRead}
                      title="Marquer tout comme lu"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="cursor-pointer focus:bg-blue-50">
                  <div className="flex items-start p-1">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <UserCircle2 className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nouvelle tâche assignée</p>
                      <p className="text-xs text-gray-500">Jean-Michel vous a assigné une nouvelle tâche sur le chantier Bellevue</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 30 minutes</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-blue-50">
                  <div className="flex items-start p-1">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Calendar className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Réunion de chantier</p>
                      <p className="text-xs text-gray-500">Rappel: Réunion avec les sous-traitants à 14h</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 1 heure</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-blue-50">
                  <div className="flex items-start p-1">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <Bell className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date limite proche</p>
                      <p className="text-xs text-gray-500">Tâche "Préparation fondations" arrive à échéance demain</p>
                      <p className="text-xs text-gray-400 mt-1">Il y a 3 heures</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Voir toutes les notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Menu des messages */}
          <DropdownMenu onOpenChange={setIsMessageOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                <Mail size={20} />
                {messageCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h3 className="font-medium">Messages</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{messageCount} non lus</span>
                  {messageCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={markAllMessagesAsRead}
                      title="Marquer tout comme lu"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="cursor-pointer focus:bg-blue-50">
                  <div className="flex items-start p-1">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        JM
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Jean-Michel</p>
                      <p className="text-xs text-gray-500">Pouvez-vous me faire un point sur l'avancement du chantier Bellevue?</p>
                      <p className="text-xs text-gray-400 mt-1">10:30</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-blue-50">
                  <div className="flex items-start p-1">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        RL
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Renaud</p>
                      <p className="text-xs text-gray-500">J'ai terminé la mise en place des fondations sur le chantier des Lilas</p>
                      <p className="text-xs text-gray-400 mt-1">Hier</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Voir tous les messages
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="relative hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <Search size={16} className="text-gray-400" />
              </span>
              <Input 
                type="text" 
                placeholder="Rechercher..." 
                className="block w-full bg-gray-100 border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
