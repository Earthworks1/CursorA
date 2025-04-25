import React, { useEffect, StrictMode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task, Site } from '@shared/types/workload';
import { fetchSites } from './WorkloadCalendar'; // Réutiliser la fonction fetch
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';

// Fonction pour fetch les tâches "à planifier"
const fetchUnplannedTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/workload/tasks?status=a_planifier');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des tâches à planifier');
  }
  const tasks = await response.json();
  // Convertir dates
  return tasks.map((task: any) => ({
    ...task,
    startTime: task.startTime ? new Date(task.startTime) : null, // Gérer null
    endTime: task.endTime ? new Date(task.endTime) : null,
    createdAt: new Date(task.createdAt),
  }));
};

interface TaskListSidebarProps {
  onAddTask: () => void; // Callback pour ouvrir la modale
  droppableId: string; // ID pour la zone droppable
}

const TaskListSidebar: React.FC<TaskListSidebarProps> = ({ onAddTask, droppableId }) => {

  const { data: tasks, isLoading: isLoadingTasks, error: tasksError } = 
    useQuery<Task[]>({ 
      queryKey: ['unplannedTasks'], 
      queryFn: fetchUnplannedTasks 
    });

  const { data: sites, isLoading: isLoadingSites, error: sitesError } = 
    useQuery<Site[]>({ 
      queryKey: ['workloadSites'], // Utilise la même clé que le calendrier pour le cache
      queryFn: fetchSites,
      staleTime: Infinity, 
    });

  if (isLoadingTasks || isLoadingSites) {
    return <div>Chargement de la barre latérale...</div>;
  }

  if (tasksError || sitesError) {
    return <div>Erreur sidebar: {(tasksError || sitesError)?.message}</div>;
  }

  const getSiteName = (siteId: string | null): string => {
    if (!siteId || !sites) return 'N/A';
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : 'Inconnu';
  };

  const handleDragEnd = (result: DropResult) => {
    // Gérer le drag and drop ici
  };

  return (
    <StrictMode>
      <div className="p-4 border-r h-full flex flex-col bg-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">À Planifier</h3>
          <Button size="icon" variant="ghost" onClick={onAddTask}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={droppableId} type="TASK">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="flex-grow overflow-y-auto space-y-2"
              >
                {tasks && tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(providedDraggable) => (
                        <div 
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          {...providedDraggable.dragHandleProps}
                          className="p-2 border rounded bg-card-foreground/5 cursor-grab text-sm shadow-sm"
                        >
                          <p className="font-medium">
                            [{task.type.toUpperCase()}] {getSiteName(task.siteId)}
                          </p>
                          <p className="text-muted-foreground truncate">{task.description}</p>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Aucune tâche à planifier.</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </StrictMode>
  );
};

export default TaskListSidebar; 