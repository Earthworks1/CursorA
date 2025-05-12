import React, { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import TaskListSidebar from '@/components/Workload/TaskListSidebar';
import WorkloadCalendar from '@/components/Workload/WorkloadCalendar';
import TaskDialog from '@/components/Workload/TaskDialog';
import { Task } from '@/types/workload';
import { useToast } from "@/hooks/use-toast";
import { formatISO, parse, addHours } from 'date-fns';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { workloadApi } from '@/api/workload';
import { toast } from 'sonner';

// Utilitaire pour formater les dates
const formatDatesForApi = (data: any) => {
  const formattedData = { ...data };
  if (formattedData.startTime instanceof Date) {
    formattedData.startTime = formatISO(formattedData.startTime);
  }
  if (formattedData.endTime instanceof Date) {
    formattedData.endTime = formatISO(formattedData.endTime);
  }
  return formattedData;
};

// Fonction pour appeler l'API avec timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 5000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Fonctions pour appeler l'API (création/mise à jour)
const createTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const formattedData = formatDatesForApi(newTaskData);
  const response = await fetchWithTimeout('/api/workload/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création de la tâche');
  }
  return response.json();
};

const updateTask = async (taskId: string, updatedData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> => {
  const formattedData = formatDatesForApi(updatedData);
  const response = await fetchWithTimeout(`/api/workload/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formattedData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de la tâche');
  }
  return response.json();
};

const WorkloadPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();
  const { toast: toastHook } = useToast(); // Renommé pour éviter la confusion
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mutation pour créer une tâche
  const createTaskMutation = useMutation({ 
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workload/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/unplannedTasks'] });
      toastHook({ title: "Succès", description: "Tâche créée." });
      setIsModalOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      toastHook({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Mutation pour mettre à jour une tâche
  const updateTaskMutation = useMutation({ 
    mutationFn: (variables: { taskId: string; data: Partial<Omit<Task, 'id' | 'createdAt'>> }) => 
      updateTask(variables.taskId, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workload/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/unplannedTasks'] });
      toastHook({ title: "Succès", description: "Tâche mise à jour." });
      setIsModalOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      toastHook({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workloadApi.getTasks();
      setTasks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des tâches';
      setError(errorMessage);
      toastHook({ 
        title: "Erreur", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreate = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    createTaskMutation.mutate(taskData);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ taskId, data: updates });
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await workloadApi.deleteTask(taskId);
      toastHook({ title: "Succès", description: "Tâche supprimée avec succès" });
      setSelectedTask(null);
      queryClient.invalidateQueries({ queryKey: ['/api/workload/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/unplannedTasks'] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la tâche';
      toastHook({ 
        title: "Erreur", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  // Gérer la sauvegarde depuis le formulaire
  const handleSaveTask = (formData: Omit<Task, 'id' | 'createdAt'> | Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    if (selectedTask?.id) {
      updateTaskMutation.mutate({ 
        taskId: selectedTask.id, 
        data: formData 
      });
    } else {
      const newTaskData = {
        ...formData,
        status: formData.status || 'a_planifier',
        startTime: formData.startTime || new Date(),
        endTime: formData.endTime || new Date(),
      } as Omit<Task, 'id' | 'createdAt'>;
      
      createTaskMutation.mutate(newTaskData);
    }
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; resourceId?: string | number }) => {
    const resourceId = slotInfo.resourceId !== undefined ? String(slotInfo.resourceId) : null;
    const newTask = {
      id: crypto.randomUUID(), // Génère un ID unique temporaire
      createdAt: new Date(),
      startTime: slotInfo.start,
      endTime: slotInfo.end,
      assignedUserId: resourceId,
      status: 'planifie' as const,
      type: 'leve' as const,
      description: '',
      siteId: null,
      notes: null,
    };
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };

  // Gérer la sélection d'un événement dans le calendrier
  const handleSelectEvent = (event: { rawTask: Task }) => {
    if (event.rawTask) {
      setSelectedTask(event.rawTask);
      setIsModalOpen(true);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (source.droppableId === 'sidebar-unplanned' && destination.droppableId.startsWith('calendar-slot-')) {
      const taskId = draggableId;
      const [, , dateStr, hourStr, ...userIdParts] = destination.droppableId.split('-');
      const userId = userIdParts.join('-');
      
      try {
        const startTime = parse(`${dateStr}${hourStr}`, 'yyyyMMddHH', new Date());
        const endTime = addHours(startTime, 2);

        updateTaskMutation.mutate({
          taskId,
          data: {
            startTime,
            endTime,
            assignedUserId: userId,
            status: 'planifie'
          }
        });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Erreur lors du calcul de la date/heure";
        toastHook({ 
          title: "Erreur", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 bg-red-100 p-4 rounded-lg">
          <h3 className="font-bold">Erreur</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}> 
      <div className="flex h-[calc(100vh-var(--header-height,60px))]">
        <div className="w-1/4 max-w-xs min-w-[250px]">
          <TaskListSidebar 
            onAddTask={handleAddTask} 
            droppableId="sidebar-unplanned" 
          /> 
        </div>
        <div className="flex-1 overflow-auto p-4">
          <WorkloadCalendar 
            tasks={tasks}
            onTaskSelect={(task) => {
              if (task) {
                setSelectedTask(task);
                setIsModalOpen(true);
              }
            }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            isDroppable={true}
          />
        </div>
        <TaskDialog
          task={selectedTask || undefined}
          isOpen={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={selectedTask && selectedTask.id ? () => handleTaskDelete(selectedTask.id) : undefined}
        />
      </div>
    </DragDropContext>
  );
};

export default WorkloadPage; 