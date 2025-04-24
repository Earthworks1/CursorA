import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo, Event as BigCalendarEvent } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import fr from 'date-fns/locale/fr'; // Importer la locale française
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import parseISO from 'date-fns/parseISO'; // Pour parser les dates de l'API

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, User, Site } from '@shared/types/workload'; // Import des types
import { useQuery } from '@tanstack/react-query'; // Import pour le fetching
import { Droppable } from 'react-beautiful-dnd';

// Configuration du localizer avec date-fns et la locale française
const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // Lundi
  getDay,
  locales,
});

// Créneaux horaires de 7h à 18h
const minTime = new Date();
minTime.setHours(7, 0, 0);

const maxTime = new Date();
maxTime.setHours(18, 0, 0);

// Définir les vues autorisées (semaine de travail)
// On utilise la vue 'week' et on la filtre plus tard si besoin ou on utilise dayLayoutAlgorithm
// Pour limiter aux jours 1-5 (Lun-Ven), on peut filtrer les jours dans les props du Calendar
// Ou utiliser `formats` pour cacher les jours non désirés si la vue le permet.
// react-big-calendar n'a pas de vue "work_week" par défaut qui exclut Sam/Dim aussi facilement.
// On va utiliser la vue 'week' et la gérer.
const availableViews = [Views.WEEK];

// Fonctions de fetch API (à adapter selon votre client HTTP, ex: fetch, axios)
const fetchTasks = async (week: string): Promise<Task[]> => {
  const response = await fetch(`/api/workload/tasks?week=${week}`);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des tâches');
  }
  const tasks = await response.json();
  // Convertir les chaînes de date en objets Date
  return tasks.map((task: any) => ({
    ...task,
    startTime: parseISO(task.startTime),
    endTime: parseISO(task.endTime),
    createdAt: parseISO(task.createdAt),
  }));
};

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/workload/users');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des utilisateurs');
  }
  return response.json();
};

const fetchSites = async (): Promise<Site[]> => {
  const response = await fetch('/api/workload/sites');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des sites');
  }
  return response.json();
};

// Fonction pour obtenir la couleur basée sur le type de tâche
const getTypeColor = (type: Task['type']): string => {
  switch (type) {
    case 'leve': return '#3b82f6'; // blue-500
    case 'conception': return '#10b981'; // emerald-500
    case 'implantation': return '#f97316'; // orange-500
    case 'reunion': return '#8b5cf6'; // violet-500
    case 'administratif': return '#6b7280'; // gray-500
    default: return '#a1a1aa'; // zinc-400
  }
};

// Interface pour les props du composant
interface WorkloadCalendarProps {
  onSelectEvent: (event: any) => void; // Callback pour la sélection d'un événement existant
  onSelectSlot: (slotInfo: SlotInfo) => void; // Callback pour la sélection d'un créneau vide
  isDroppable?: boolean; // Optionnel pour activer le DND
}

// Interface pour les props du wrapper de créneau
interface TimeSlotWrapperProps {
  children: React.ReactNode;
  value: Date; // La date/heure de début du créneau
  resource?: string | number; // L'ID de la ressource (utilisateur) associé à ce créneau
}

// Composant Wrapper pour rendre les créneaux horaires droppables
const DroppableTimeSlotWrapper: React.FC<TimeSlotWrapperProps & { isDroppable?: boolean }> = 
  ({ children, value, resource, isDroppable }) => {
    
  if (!isDroppable || !resource) {
    // Si DND n'est pas activé ou si pas de ressource (ex: en-tête d'heure), rendre l'enfant normal
    return <>{children}</>;
  }

  // Générer l'ID pour Droppable: calendar-slot-YYYYMMDD-HH-userId
  const dateStr = format(value, 'yyyyMMdd');
  const hourStr = format(value, 'HH'); // Heure de début du créneau
  const droppableId = `calendar-slot-${dateStr}-${hourStr}-${resource}`;

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{ 
            height: '100%', // Important pour que Droppable prenne la taille du slot
            backgroundColor: snapshot.isDraggingOver ? 'lightblue' : undefined, // Feedback visuel
          }}
          className="rbc-time-slot" // Garder les classes RBC si nécessaire
        >
          {children} {/* Affiche le contenu original du slot */}
          {/* Le placeholder est souvent caché ou n'a pas de contenu visible ici */}
          {provided.placeholder} 
        </div>
      )}
    </Droppable>
  );
};

// --- Composant CustomDateHeader --- START ---
interface CustomDateHeaderProps {
  date: Date;
  label: string; // Le label par défaut (ex: "Lundi 21")
  localizer: any; // Le localizer pour le formatage
}

const CustomDateHeader: React.FC<CustomDateHeaderProps> = ({ date, localizer }) => {
  // Formatter le nom du jour abrégé (ex: "Lun.")
  const dayName = format(date, 'EEE', { locale: fr }); // Utilise 'EEE' pour le nom abrégé
  // Formatter le numéro du jour (ex: "21")
  const dayNumber = format(date, 'd', { locale: fr });

  return (
    <div className="flex flex-col items-center p-1"> {/* Centre le contenu */}
      <span className="text-xs font-medium text-gray-600 uppercase">{dayName}.</span> {/* Nom du jour */} 
      <span className="text-xl font-bold">{dayNumber}</span> {/* Numéro du jour */}
    </div>
  );
};
// --- Composant CustomDateHeader --- END ---

const WorkloadCalendar: React.FC<WorkloadCalendarProps> = ({ onSelectEvent, onSelectSlot, isDroppable = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Format de semaine YYYY-WNN pour l'API
  const currentWeek = format(currentDate, 'yyyy-\'W\'II', { locale: fr, weekStartsOn: 1 });

  // --- Fetching des données avec React Query ---
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = 
    useQuery<Task[]>({ 
      queryKey: ['workloadTasks', currentWeek], 
      queryFn: () => fetchTasks(currentWeek) 
    });

  const { data: users, isLoading: isLoadingUsers, error: usersError } = 
    useQuery<User[]>({ 
      queryKey: ['workloadUsers'], 
      queryFn: fetchUsers,
      staleTime: Infinity, // Les utilisateurs changent rarement
    });

  const { data: sites, isLoading: isLoadingSites, error: sitesError } = 
    useQuery<Site[]>({ 
      queryKey: ['workloadSites'], 
      queryFn: fetchSites,
      staleTime: Infinity, // Les sites changent rarement
    });
  // ----------------------------------------------

  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  // Calculer les dates de début et de fin de la semaine affichée
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Formatage du titre de la semaine
  const weekLabel = `Semaine du ${format(weekStart, 'd MMMM', { locale: fr })} au ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;

  // Transformation des tâches en événements pour le calendrier
  const events = useMemo(() => {
    if (!tasks || !sites) return [];
    
    return tasks.map(task => {
      const site = sites.find(s => s.id === task.siteId);
      const siteName = site ? site.name : 'N/A';
      const title = `[${task.type.toUpperCase()}] ${siteName} - ${task.description}`;

      return {
        title: title,
        start: task.startTime,
        end: task.endTime,
        allDay: false, // Assumer que ce ne sont pas des événements sur toute la journée
        resourceId: task.assignedUserId, // L'ID de l'utilisateur est la resource
        rawTask: task, // Garder la tâche originale
      };
    });
  }, [tasks, sites]);

  // Préparer les utilisateurs comme ressources pour le calendrier
  const resourceMap = useMemo(() => {
    return users?.map(user => ({
      resourceId: user.id,
      resourceTitle: user.name,
    })) || [];
  }, [users]);

  // Style des événements basé sur le type
  const eventPropGetter = (event: any) => {
    const backgroundColor = getTypeColor(event.rawTask.type);
    return { style: { backgroundColor, color: 'white', border: 'none', borderRadius: '3px' } };
  };
  
  // Définir les composants personnalisés
  const components = useMemo(() => ({
    timeSlotWrapper: (props: TimeSlotWrapperProps) => (
      <DroppableTimeSlotWrapper {...props} isDroppable={isDroppable} />
    ),
    // Utiliser notre composant personnalisé pour l'en-tête de date
    dateHeader: CustomDateHeader,
  }), [isDroppable]); // Recréer si isDroppable change

  if (isLoadingTasks || isLoadingUsers || isLoadingSites) {
    return <div>Chargement...</div>; // Ou un spinner
  }

  if (tasksError || usersError || sitesError) {
    return <div>Erreur: {(tasksError || usersError || sitesError)?.message}</div>;
  }

  return (
    <div className="h-[80vh] flex flex-col"> {/* Hauteur ajustable */}
      <div className="flex items-center justify-between mb-4 p-2 border-b">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek} disabled={isLoadingTasks}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{weekLabel}</h2>
        <Button variant="outline" size="icon" onClick={goToNextWeek} disabled={isLoadingTasks}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          views={availableViews} // Seulement la vue semaine
          date={currentDate} // Contrôler la date affichée
          onNavigate={() => {}} // Désactiver la navigation interne car on la gère
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable // Permettre la sélection de créneaux
          resources={resourceMap} // Fournir les utilisateurs comme ressources
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          min={minTime}
          max={maxTime}
          eventPropGetter={eventPropGetter}
          components={components} // Utiliser les composants personnalisés
          culture='fr' // Spécifier la culture française
          style={{ flex: '1' }} // Assurer que le calendrier prend l'espace disponible
        />
      </div>
    </div>
  );
};

// Export de fetchSites et fetchUsers pour réutilisation
export { fetchSites, fetchUsers }; 

export default WorkloadCalendar; 