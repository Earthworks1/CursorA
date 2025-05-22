'use client';

import React from 'react';
import { useDrop } from 'react-dnd'; // DndItem is not used, item type is explicit
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PlanningCalendar from '@/components/planning/PlanningCalendar';
import Gantt from '@/components/Gantt';
import Heatmap from '@/components/Heatmap';
import PlanCharge from '@/components/planning/PlanCharge';
import { Task, Resource, User } from '@/app/planning/page'; // Types imported from page.tsx

// Définir les props attendues par ce composant
interface PlanningInteractiveAreaProps {
  tasks: Task[];
  // unplannedTasks: Task[]; // Not used in this component directly, removed for now
  calendarResources: Resource[];
  users: User[];
  startDate: Date;
  endDate: Date;
  // draggedUnplannedItem: Task | null; // This state is managed by the parent, only setter is needed
  setDraggedUnplannedItem: (task: Task | null) => void;
  
  // Callbacks pour les interactions
  handleCalendarEventMove: (dropInfo: { event: Task; start: Date; end: Date; resourceId?: string }) => void;
  handleCalendarEventResize: (resizeInfo: { event: Task; start: Date; end: Date }) => void;
  handleSelectSlot: (slotInfo: { start: Date; end: Date; resourceId?: string }) => void;
  handleTaskMove: (taskId: string, newStartTime: Date, newEndTime: Date) => void;
  handleCellClick: (date: Date, tasksOnDate: Task[]) => void;
}

const PlanningInteractiveArea: React.FC<PlanningInteractiveAreaProps> = ({
  tasks,
  calendarResources,
  users,
  startDate,
  endDate,
  setDraggedUnplannedItem,
  handleCalendarEventMove,
  handleCalendarEventResize,
  handleSelectSlot,
  handleTaskMove,
  handleCellClick
}) => {
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'UNPLANNED_TASK',
    drop: (item: { task: Task }, monitor) => { 
      console.log('Dropped item on calendar area (within InteractiveArea):', item.task);
      setDraggedUnplannedItem(item.task); 
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div className="flex-1" ref={dropRef} style={{ backgroundColor: isOver ? 'rgba(0,255,0,0.1)' : 'transparent' }}>
      <Tabs defaultValue="hebdo" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          <TabsTrigger value="hebdo">Vue Hebdomadaire</TabsTrigger>
          <TabsTrigger value="gantt">Vue Gantt</TabsTrigger>
          <TabsTrigger value="heatmap">Vue Heatmap</TabsTrigger>
          <TabsTrigger value="charge">Plan de charge</TabsTrigger>
        </TabsList>

        <TabsContent value="hebdo">
          <PlanningCalendar 
            tasks={tasks} 
            resources={calendarResources} 
            onEventDrop={handleCalendarEventMove}
            onEventResize={handleCalendarEventResize}
            onSelectSlot={handleSelectSlot} 
          />
        </TabsContent>

        <TabsContent value="gantt">
          <Gantt
            tasks={tasks}
            onTaskMove={handleTaskMove}
          />
        </TabsContent>

        <TabsContent value="heatmap">
          <Heatmap
            tasks={tasks}
            startDate={startDate}
            endDate={endDate}
            onCellClick={handleCellClick}
          />
        </TabsContent>

        <TabsContent value="charge">
          {/* Assuming PlanCharge expects Task[] for its tasks prop */}
          <PlanCharge tasks={tasks as any} users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningInteractiveArea;
