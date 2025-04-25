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
  parseISO,
  addDays,
  isSameDay
} from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css'; // Import des styles personnalisés
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, User, Site } from '@shared/types/workload'; // Import des types
import { useQuery } from '@tanstack/react-query'; // Import pour le fetching
import { Droppable } from '@hello-pangea/dnd';
import { workloadApi } from '@/api/workload';
import { toast } from 'sonner';

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
    case 'implantation': return '#f97316'; // orange-500
    case 'recolement': return '#10b981'; // emerald-500
    case 'etude': return '#8b5cf6'; // violet-500
    case 'dao': return '#6b7280'; // gray-500
    case 'autre': return '#a1a1aa'; // zinc-400
    default: return '#a1a1aa'; // zinc-400
  }
};

// Interface pour les props du composant
interface WorkloadCalendarProps {
  onSelectEvent: (event: any) => void; // Callback pour la sélection d'un événement existant
  onSelectSlot: (slotInfo: SlotInfo) => void; // Callback pour la sélection d'un créneau vide
  isDroppable?: boolean; // Optionnel pour activer le DND
  tasks: Task[];
  onTaskSelect: (task: Task | null) => void;
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

const WorkloadCalendar: React.FC<WorkloadCalendarProps> = ({ onSelectEvent, onSelectSlot, isDroppable = false, tasks, onTaskSelect }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeekTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const week = format(currentWeek, 'yyyy-MM-dd');
      const data = await workloadApi.getTasksByWeek(week);
      setWeekTasks(data);
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekTasks();
  }, [currentWeek]);

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(currentWeek), i)
  );

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousWeek}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Semaine précédente
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentWeek, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={handleNextWeek}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Semaine suivante
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map(day => (
          <div key={day.toString()} className="border rounded p-2">
            <div className="font-semibold text-center mb-2">
              {format(day, 'EEEE', { locale: fr })}
            </div>
            <div className="text-center mb-2">
              {format(day, 'd')}
            </div>
            <div className="space-y-2">
              {weekTasks
                .filter(task => 
                  task.startTime && 
                  isSameDay(new Date(task.startTime), day)
                )
                .map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskSelect(task)}
                    className="p-2 bg-blue-100 rounded cursor-pointer hover:bg-blue-200"
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-600">
                      {task.startTime && format(new Date(task.startTime), 'HH:mm')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export de fetchSites et fetchUsers pour réutilisation
export { fetchSites, fetchUsers }; 

export default WorkloadCalendar; 