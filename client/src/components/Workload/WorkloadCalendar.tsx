import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { 
  format,
  parse,
  startOfWeek,
  getDay,
  addWeeks,
  subWeeks,
  parseISO,
  addDays,
} from 'date-fns';
import { fr } from 'date-fns/locale';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, User, Site } from '@/types/workload';
import { useQuery } from '@tanstack/react-query';
import { Droppable } from '@hello-pangea/dnd';
import { workloadApi } from '@/api/workload';
import { toast } from 'sonner';

// Configuration du localizer
const locales = { 'fr': fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Configuration des horaires
const minTime = new Date();
minTime.setHours(7, 0, 0);

const maxTime = new Date();
maxTime.setHours(18, 0, 0);

// Vues disponibles
const availableViews = [Views.WORK_WEEK];

// Fonction pour obtenir la couleur basée sur le type de tâche
const getTypeColor = (type: Task['type']): string => {
  switch (type) {
    case 'leve': return '#3b82f6';
    case 'implantation': return '#f97316';
    case 'recolement': return '#10b981';
    case 'etude': return '#8b5cf6';
    case 'dao': return '#6b7280';
    case 'autre': return '#a1a1aa';
    default: return '#a1a1aa';
  }
};

// Interfaces
interface WorkloadCalendarProps {
  onSelectEvent: (event: any) => void;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  isDroppable?: boolean;
  tasks: Task[];
  onTaskSelect: (task: Task | null) => void;
}

interface TimeSlotWrapperProps {
  children: React.ReactNode;
  value: Date;
  resource?: string | number;
}

// Composant Wrapper pour les créneaux horaires droppables
const DroppableTimeSlotWrapper: React.FC<TimeSlotWrapperProps & { isDroppable?: boolean }> = 
  ({ children, value, resource, isDroppable }) => {
    
  if (!isDroppable || !resource) {
    return <>{children}</>;
  }

  const dateStr = format(value, 'yyyyMMdd');
  const hourStr = format(value, 'HH');
  const droppableId = `calendar-slot-${dateStr}-${hourStr}-${resource}`;

  return (
    <Droppable droppableId={droppableId} type="TASK">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`rbc-time-slot h-full ${snapshot.isDraggingOver ? 'bg-blue-100' : ''}`}
        >
          {children}
          <div style={{ display: 'none' }}>{provided.placeholder}</div>
        </div>
      )}
    </Droppable>
  );
};

// Composants d'en-tête personnalisés
const CustomDateHeader: React.FC<{ date: Date }> = ({ date }) => {
  const dayName = format(date, 'EEEE', { locale: fr });
  const dayNumber = format(date, 'd MMMM', { locale: fr });

  return (
    <div className="flex flex-col items-center p-2 border-b bg-gray-50">
      <span className="text-sm font-semibold text-gray-900 capitalize">{dayName}</span>
      <span className="text-xs text-gray-600">{dayNumber}</span>
    </div>
  );
};

const CustomTimeGutter: React.FC<{ date: Date }> = ({ date }) => (
  <div className="flex items-center justify-end pr-2 h-full">
    <span className="text-xs font-medium text-gray-600">
      {format(date, 'HH:mm')}
    </span>
  </div>
);

const CustomTimeGutterHeader: React.FC = () => (
  <div className="p-2 border-b bg-gray-50">
    <span className="text-xs font-medium text-gray-600">Heures</span>
  </div>
);

// Composant principal du calendrier
const WorkloadCalendar: React.FC<WorkloadCalendarProps> = ({ 
  onSelectEvent, 
  onSelectSlot, 
  isDroppable = false, 
  tasks, 
  onTaskSelect 
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Requêtes pour les utilisateurs et les sites
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/workload/users'],
    queryFn: () => workloadApi.getUsers(),
    staleTime: Infinity,
  });

  const { data: sites } = useQuery<Site[]>({
    queryKey: ['/api/workload/sites'],
    queryFn: () => workloadApi.getSites(),
    staleTime: Infinity,
  });

  // Navigation dans le calendrier
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  }, []);

  // Formatage des événements pour le calendrier
  const events = tasks.map(task => ({
    id: task.id,
    title: `[${task.type.toUpperCase()}] ${sites?.find(s => s.id === task.siteId)?.name || 'N/A'}`,
    start: task.startTime ? new Date(task.startTime) : new Date(),
    end: task.endTime ? new Date(task.endTime) : new Date(),
    resourceId: task.assignedUserId,
    rawTask: task,
    style: {
      backgroundColor: getTypeColor(task.type),
    },
  }));

  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        views={availableViews}
        defaultView={Views.WORK_WEEK}
        min={minTime}
        max={maxTime}
        date={currentWeek}
        onNavigate={date => setCurrentWeek(date)}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        resourceIdAccessor="id"
        resources={users}
        components={{
          timeSlotWrapper: (props: any) => (
            <DroppableTimeSlotWrapper {...props} isDroppable={isDroppable} />
          ),
        }}
        className="flex-grow"
      />
    </div>
  );
};

export default WorkloadCalendar; 