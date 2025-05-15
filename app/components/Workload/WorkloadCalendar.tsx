import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { fr } from 'date-fns/locale/fr';
import { startOfDay, endOfDay, startOfWeek as getStartOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Task, TaskType } from '@/types';
import { CalendarFilters } from './CalendarFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConflictChecker } from './ConflictChecker';
import { ExportTasks } from './ExportTasks';

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface WorkloadCalendarProps {
  tasks: Task[];
  onSelectEvent?: (event: any) => void;
  onSelectSlot?: (slotInfo: any) => void;
  onTaskSelect?: (task: Task) => void;
  className?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: string | undefined;
  rawTask: Task;
  type: TaskType;
  status: string;
}

export default function WorkloadCalendar({
  tasks,
  onSelectEvent,
  onSelectSlot,
  onTaskSelect,
  className,
}: WorkloadCalendarProps) {
  const [view, setView] = useState<View>('week');
  const [filters, setFilters] = useState<CalendarFilters>({
    search: '',
    type: 'ALL',
    status: 'ALL',
    assignedTo: 'ALL',
    dateRange: 'WEEK',
  });

  // Filtrage des tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filtre par recherche
      if (filters.search && !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filtre par type
      if (filters.type !== 'ALL' && task.type !== filters.type) {
        return false;
      }

      // Filtre par statut
      if (filters.status !== 'ALL' && task.status !== filters.status) {
        return false;
      }

      // Filtre par assignation
      if (filters.assignedTo !== 'ALL' && task.assignedTo !== filters.assignedTo) {
        return false;
      }

      // Filtre par période
      const taskDate = new Date(task.startTime);
      switch (filters.dateRange) {
        case 'TODAY':
          return taskDate >= startOfDay(new Date()) && taskDate <= endOfDay(new Date());
        case 'WEEK':
          return taskDate >= getStartOfWeek(new Date()) && taskDate <= endOfWeek(new Date());
        case 'MONTH':
          return taskDate >= startOfMonth(new Date()) && taskDate <= endOfMonth(new Date());
        default:
          return true;
      }
    });
  }, [tasks, filters]);

  const events = useMemo(() => {
    return filteredTasks.map(task => ({
      id: task.id,
      title: task.description,
      start: new Date(task.startTime),
      end: new Date(task.endTime),
      resource: task.assignedTo,
      rawTask: task,
      type: task.type,
      status: task.status,
    }));
  }, [filteredTasks]);

  const resources = useMemo(() => {
    const uniqueUsers = Array.from(new Set(filteredTasks.map(task => task.assignedTo).filter(Boolean)));
    return uniqueUsers.map(userId => ({
      id: userId,
      title: filteredTasks.find(t => t.assignedTo === userId)?.assignedUser?.prenom + ' ' +
            filteredTasks.find(t => t.assignedTo === userId)?.assignedUser?.nom,
    }));
  }, [filteredTasks]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#265985';

    switch (event.type.toLowerCase()) {
      case 'etude':
        backgroundColor = '#4CAF50';
        borderColor = '#388E3C';
        break;
      case 'leve':
        backgroundColor = '#2196F3';
        borderColor = '#1976D2';
        break;
      case 'implantation':
        backgroundColor = '#9C27B0';
        borderColor = '#7B1FA2';
        break;
      case 'recolement':
        backgroundColor = '#FF9800';
        borderColor = '#F57C00';
        break;
      case 'dao':
        backgroundColor = '#00BCD4';
        borderColor = '#0097A7';
        break;
      case 'autre':
        backgroundColor = '#607D8B';
        borderColor = '#455A64';
        break;
    }

    switch (event.status.toLowerCase()) {
      case 'termine':
        backgroundColor = '#9E9E9E';
        borderColor = '#757575';
        break;
      case 'annule':
        backgroundColor = '#F44336';
        borderColor = '#D32F2F';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '3px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  }, []);

  const handleNavigate = useCallback((date: Date) => {
    // Mise à jour des filtres de date en fonction de la navigation
    const newFilters = { ...filters };
    if (view === 'day') {
      newFilters.dateRange = 'TODAY';
    } else if (view === 'week') {
      newFilters.dateRange = 'WEEK';
    } else if (view === 'month') {
      newFilters.dateRange = 'MONTH';
    }
    setFilters(newFilters);
  }, [filters, view]);

  const handleResolveConflict = useCallback((conflict: any, resolution: string) => {
    switch (resolution) {
      case 'KEEP_TASK1':
        // Supprimer la tâche 2
        onTaskSelect?.(conflict.task2);
        break;
      case 'KEEP_TASK2':
        // Supprimer la tâche 1
        onTaskSelect?.(conflict.task1);
        break;
      case 'MODIFY_TASK1':
        // Ouvrir le formulaire de modification pour la tâche 1
        onTaskSelect?.(conflict.task1);
        break;
      case 'MODIFY_TASK2':
        // Ouvrir le formulaire de modification pour la tâche 2
        onTaskSelect?.(conflict.task2);
        break;
    }
  }, [onTaskSelect]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-background border-b">
        <div className="flex-1">
          <CalendarFilters onFilterChange={setFilters} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView('day')}
            className={cn(view === 'day' && 'bg-primary text-primary-foreground')}
          >
            Jour
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView('week')}
            className={cn(view === 'week' && 'bg-primary text-primary-foreground')}
          >
            Semaine
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setView('month')}
            className={cn(view === 'month' && 'bg-primary text-primary-foreground')}
          >
            Mois
          </Button>
        </div>
      </div>

      <ConflictChecker
        tasks={filteredTasks}
        onResolveConflict={handleResolveConflict}
        className="p-4"
      />

      <div className="flex-1 min-h-[500px] md:min-h-[calc(100vh-300px)]">
        <Calendar
          localizer={localizer}
          events={events}
          resources={resources}
          resourceIdAccessor="id"
          resourceTitleAccessor="title"
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onNavigate={handleNavigate}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          popup
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement sur cette période",
            showMore: (total: number) => `+ ${total} événements`,
          }}
          components={{
            toolbar: CustomToolbar,
          }}
          className="h-full"
        />
      </div>
    </div>
  );
}

// Composant de barre d'outils personnalisé
function CustomToolbar(props: any) {
  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToCurrent = () => {
    props.onNavigate('TODAY');
  };

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToCurrent}>
          <CalendarIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold ml-2">
          {props.label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ExportTasks tasks={props.events.map((event: any) => event.rawTask)} />
      </div>
    </div>
  );
} 