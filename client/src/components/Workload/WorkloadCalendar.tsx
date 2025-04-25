import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo, Event as BigCalendarEvent } from 'react-big-calendar';
import { 
  format,
  parse,
  startOfWeek,
  getDay,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  parseISO
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css'; // Import des styles personnalisés
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
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // Lundi
  getDay,
  locales,
});

// Créneaux horaires de 7h à 18h
const minTime = new Date();
minTime.setHours(7, 0, 0);

const maxTime = new Date();
maxTime.setHours(18, 0, 0);

// Définir les vues autorisées (semaine de travail)
const availableViews = [Views.WORK_WEEK];

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

const CustomDateHeader: React.FC<CustomDateHeaderProps> = ({ date }) => {
  // Formatter le nom du jour et la date
  const dayName = format(date, 'EEEE', { locale: fr }); // Nom complet du jour
  const dayNumber = format(date, 'd MMMM', { locale: fr }); // Jour et mois

  return (
    <div className="flex flex-col items-center p-2 border-b bg-gray-50">
      <span className="text-sm font-semibold text-gray-900 capitalize">{dayName}</span>
      <span className="text-xs text-gray-600">{dayNumber}</span>
    </div>
  );
};
// --- Composant CustomDateHeader --- END ---

// Composant personnalisé pour l'affichage des heures
const CustomTimeGutter: React.FC<{ date: Date }> = ({ date }) => {
  return (
    <div className="flex items-center justify-end pr-2 h-full">
      <span className="text-xs font-medium text-gray-600">
        {format(date, 'HH:mm')}
      </span>
    </div>
  );
};

// Composant personnalisé pour l'en-tête de la colonne des heures
const CustomTimeGutterHeader: React.FC = () => {
  return (
    <div className="p-2 border-b bg-gray-50">
      <span className="text-xs font-medium text-gray-600">Heures</span>
    </div>
  );
};

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

  const { data: sites, isLoading: isLoadingSites, error: sitesError } = 
    useQuery<Site[]>({ 
      queryKey: ['workloadSites'], 
      queryFn: fetchSites,
      staleTime: Infinity,
    });

  // Navigation
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  // Calculer les dates de début et de fin de la semaine affichée
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  // Formatage du titre de la semaine
  const weekLabel = `Semaine du ${format(weekStart, 'd')} au ${format(weekEnd, 'd MMMM yyyy', { locale: fr })}`;

  // Transformation des tâches en événements pour le calendrier
  const events = useMemo(() => {
    if (!tasks || !sites) return [];
    
    return tasks.map(task => {
      const site = sites.find(s => s.id === task.siteId);
      const siteName = site ? site.name : 'N/A';
      return {
        title: `${siteName} - ${task.description}`,
        start: task.startTime,
        end: task.endTime,
        allDay: false,
        resource: task,
      };
    });
  }, [tasks, sites]);

  // Style des événements basé sur le type
  const eventPropGetter = (event: any) => {
    const backgroundColor = getTypeColor(event.resource.type);
    return { 
      style: { 
        backgroundColor,
        color: 'white',
        border: 'none',
        borderRadius: '2px',
        fontSize: '0.875rem',
      } 
    };
  };

  if (isLoadingTasks || isLoadingSites) {
    return <div>Chargement...</div>;
  }

  if (tasksError || sitesError) {
    return <div>Erreur: {(tasksError || sitesError)?.message}</div>;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{weekLabel}</h2>
        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WORK_WEEK}
          views={availableViews}
          date={currentDate}
          onNavigate={() => {}}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          min={minTime}
          max={maxTime}
          eventPropGetter={eventPropGetter}
          culture='fr'
          step={60}
          timeslots={1}
          formats={{
            timeGutterFormat: 'HH:mm',
            dayFormat: 'EEEE d',
            dayHeaderFormat: (date: Date) => format(date, 'EEEE d MMMM', { locale: fr }),
          }}
          className="custom-calendar"
          style={{ height: '100%' }}
          dayLayoutAlgorithm="no-overlap"
        />
      </div>
    </div>
  );
};

// Export de fetchSites et fetchUsers pour réutilisation
export { fetchSites, fetchUsers }; 

export default WorkloadCalendar; 