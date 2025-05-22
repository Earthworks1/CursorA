import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

export interface Task {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  type: 'CHANTIER' | 'FORMATION' | 'REUNION' | 'AUTRE';
  status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
}

export interface Resource {
  id: string;
  title: string;
  type: 'EMPLOYE' | 'MATERIEL' | 'VEHICULE';
}

interface PlanningCalendarProps {
  events: Task[];
  resources: Resource[];
  onEventClick?: (event: Task) => void;
  onEventDrop?: (event: Task, start: Date, end: Date, resourceId?: string) => void;
  onEventResize?: (event: Task, start: Date, end: Date) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; resourceId?: string }) => void;
}

const eventStyleGetter = (event: Task) => {
  let backgroundColor = '#3174ad';
  let borderColor = '#2a5a8a';

  switch (event.type) {
    case 'CHANTIER':
      backgroundColor = '#2196F3';
      borderColor = '#1976D2';
      break;
    case 'FORMATION':
      backgroundColor = '#4CAF50';
      borderColor = '#388E3C';
      break;
    case 'REUNION':
      backgroundColor = '#9C27B0';
      borderColor = '#7B1FA2';
      break;
    case 'AUTRE':
      backgroundColor = '#FF9800';
      borderColor = '#F57C00';
      break;
  }

  if (event.status === 'TERMINE') {
    backgroundColor = '#757575';
    borderColor = '#616161';
  } else if (event.status === 'ANNULE') {
    backgroundColor = '#E57373';
    borderColor = '#EF5350';
  }

  return {
    style: {
      backgroundColor,
      borderColor,
      opacity: event.status === 'ANNULE' ? 0.6 : 1,
    },
  };
};

const PlanningCalendar: React.FC<PlanningCalendarProps> = ({
  events,
  resources,
  onEventClick,
  onEventDrop,
  onEventResize,
  onSelectSlot,
}) => {
  return (
    // Adjusted height for better mobile responsiveness
    <div className="h-[70vh] sm:h-[calc(100vh-12rem)]"> 
      <Calendar
        localizer={localizer}
        events={events}
        resources={resources}
        startAccessor="start"
        endAccessor="end"
        resourceIdAccessor="id"
        resourceTitleAccessor="title"
        defaultView="week"
        views={['day', 'work_week', 'week', 'month']}
        step={30}
        timeslots={2}
        selectable
        resizable
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onEventClick}
        onEventDrop={({ event, start, end, resourceId }) => 
          onEventDrop?.(event as Task, start, end, resourceId as string)
        }
        onEventResize={({ event, start, end }) => 
          onEventResize?.(event as Task, start, end)
        }
        onSelectSlot={onSelectSlot}
        messages={{
          today: "Aujourd'hui",
          previous: 'Précédent',
          next: 'Suivant',
          month: 'Mois',
          week: 'Semaine',
          work_week: 'Semaine de travail',
          day: 'Jour',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Heure',
          event: 'Événement',
          allDay: 'Toute la journée',
          noEventsInRange: 'Aucun événement dans cette période',
        }}
        culture="fr"
      />
    </div>
  );
};

export default PlanningCalendar; 