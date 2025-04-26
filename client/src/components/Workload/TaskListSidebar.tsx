import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task, Site } from '@/types/workload';
import { fetchSites } from './WorkloadCalendar';
import { Draggable, Droppable } from '@hello-pangea/dnd';

// Fonction pour fetch les tâches "à planifier"
const fetchUnplannedTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/workload/tasks?status=a_planifier');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des tâches à planifier');
  }
  const tasks = await response.json();
  return tasks.map((task: Task) => ({
    ...task,
    startTime: task.startTime ? new Date(task.startTime) : null,
    endTime: task.endTime ? new Date(task.endTime) : null,
    createdAt: new Date(task.createdAt),
  }));
};

interface TaskListSidebarProps {
  onAddTask: () => void;
  droppableId: string;
}

const TaskListSidebar: React.FC<TaskListSidebarProps> = ({ onAddTask, droppableId }) => {
  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = 
    useQuery<Task[]>({ 
      queryKey: ['unplannedTasks'], 
      queryFn: fetchUnplannedTasks,
      staleTime: 30000, // 30 secondes
    });

  const { data: sites, isLoading: isLoadingSites, error: sitesError } = 
    useQuery<Site[]>({ 
      queryKey: ['workloadSites'],
      queryFn: fetchSites,
      staleTime: Infinity,
    });

  if (isLoadingTasks || isLoadingSites) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (tasksError || sitesError) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded">
        Erreur: {(tasksError || sitesError)?.message}
      </div>
    );
  }

  const getSiteName = (siteId: string | null): string => {
    if (!siteId || !sites) return 'N/A';
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : 'Inconnu';
  };

  return (
    <div className="p-4 border-r h-full flex flex-col bg-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">À Planifier</h3>
        <Button size="icon" variant="ghost" onClick={onAddTask}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <Droppable droppableId={droppableId} type="TASK">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="flex-grow overflow-y-auto space-y-2"
          >
            {tasks && tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Draggable 
                  key={task.id} 
                  draggableId={task.id.toString()} 
                  index={index}
                >
                  {(providedDraggable, snapshot) => (
                    <div 
                      ref={providedDraggable.innerRef}
                      {...providedDraggable.draggableProps}
                      {...providedDraggable.dragHandleProps}
                      className={`p-2 border rounded bg-card-foreground/5 cursor-grab text-sm shadow-sm
                        ${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <p className="font-medium">
                        [{task.type.toUpperCase()}] {getSiteName(task.siteId)}
                      </p>
                      <p className="text-muted-foreground truncate">
                        {task.description}
                      </p>
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Aucune tâche à planifier.
              </p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskListSidebar; 