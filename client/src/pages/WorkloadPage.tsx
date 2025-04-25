import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import TaskListSidebar from '@/components/Workload/TaskListSidebar';
import WorkloadCalendar from '@/components/Workload/WorkloadCalendar';
import TaskForm from '@/components/Workload/TaskForm';
import { Task } from '@shared/types/workload';
import { useToast } from "@/hooks/use-toast";
import { formatISO, parse, addHours } from 'date-fns';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button'; // Potentiellement nécessaire

// Fonctions pour appeler l'API (création/mise à jour)
const createTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const response = await fetch('/api/workload/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Formater les dates en ISO string pour le JSON
    body: JSON.stringify({
      ...newTaskData,
      startTime: formatISO(newTaskData.startTime),
      endTime: formatISO(newTaskData.endTime),
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création de la tâche');
  }
  return response.json();
};

const updateTask = async (taskId: string, updatedData: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> => {
  // S'assurer que les dates sont au format ISO si elles sont présentes
  const bodyData = { ...updatedData };
  if (bodyData.startTime && bodyData.startTime instanceof Date) {
    bodyData.startTime = formatISO(bodyData.startTime);
  }
  if (bodyData.endTime && bodyData.endTime instanceof Date) {
    bodyData.endTime = formatISO(bodyData.endTime);
  }

  const response = await fetch(`/api/workload/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de la tâche');
  }
  return response.json();
};

const WorkloadPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Stocke soit la tâche complète pour édition, soit un objet partiel pour pré-remplir la création
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null); 
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation pour créer une tâche
  const createTaskMutation = useMutation({ 
    mutationFn: createTask,
    onSuccess: () => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['workloadTasks'] });
      queryClient.invalidateQueries({ queryKey: ['unplannedTasks'] });
      toast({ title: "Succès", description: "Tâche créée." });
      setIsModalOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Mutation pour mettre à jour une tâche
  const updateTaskMutation = useMutation({ 
    mutationFn: (variables: { taskId: string; data: Partial<Omit<Task, 'id' | 'createdAt'>> }) => 
      updateTask(variables.taskId, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workloadTasks'] });
      queryClient.invalidateQueries({ queryKey: ['unplannedTasks'] });
      toast({ title: "Succès", description: "Tâche mise à jour." });
      setIsModalOpen(false);
      setSelectedTask(null);
    },
     onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Gérer la sauvegarde depuis le formulaire
  const handleSaveTask = (formData: Omit<Task, 'id' | 'createdAt'> | Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    console.log('Saving task with data:', formData);
    
    if (selectedTask && selectedTask.id) {
      // Mode édition
      console.log('Updating existing task:', selectedTask.id);
      updateTaskMutation.mutate({ taskId: selectedTask.id, data: formData });
    } else {
      // Mode création
      // S'assurer que toutes les propriétés requises sont présentes
      const newTaskData = {
        ...formData,
        status: formData.status || 'a_planifier',
        startTime: formData.startTime || new Date(),
        endTime: formData.endTime || new Date(),
      } as Omit<Task, 'id' | 'createdAt'>;
      
      console.log('Creating new task with data:', newTaskData);
      createTaskMutation.mutate(newTaskData);
    }
  };

  // Ouvrir la modale pour la création
  const handleAddTask = () => {
    setSelectedTask(null); // Reset pour indiquer la création
    setIsModalOpen(true);
  };

  // Ouvrir la modale pour l'édition depuis le calendrier
  const handleSelectEvent = (event: any) => {
    // rawTask contient la tâche originale attachée à l'événement
    if (event.rawTask) {
      setSelectedTask(event.rawTask); 
      setIsModalOpen(true);
    }
  };
  
  // Ouvrir la modale depuis un créneau vide du calendrier
  const handleSelectSlot = (slotInfo: { start: Date, end: Date, resourceId?: string }) => {
    console.log('Selected slot:', slotInfo);
    
    const newTask = {
      startTime: slotInfo.start,
      endTime: slotInfo.end,
      assignedUserId: slotInfo.resourceId || null,
      status: 'planifie',
      type: 'leve', // Type par défaut
      description: '', // À remplir dans le formulaire
      siteId: null, // À sélectionner dans le formulaire
      notes: null,
    };
    
    console.log('Pre-filling task form with:', newTask);
    setSelectedTask(newTask);
    setIsModalOpen(true);
  };

  // Gérer la fin du drag & drop
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Drop en dehors d'une zone valide
    if (!destination) {
      return;
    }

    // Drop sur la même position (ou retour dans la sidebar pour l'instant)
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // --- Drop de la Sidebar vers le Calendrier --- 
    if (source.droppableId === 'sidebar-unplanned' && destination.droppableId.startsWith('calendar-slot-')) {
      console.log('Dropped from sidebar to calendar', result);
      const taskId = draggableId;
      
      // Décoder les informations du slot de destination
      // Format attendu : calendar-slot-YYYYMMDD-HH-userId
      const parts = destination.droppableId.split('-');
      if (parts.length < 5) {
          console.error("ID de slot de destination invalide:", destination.droppableId);
          toast({ title: "Erreur", description: "Impossible de placer la tâche ici.", variant: "destructive" });
          return;
      }
      const dateStr = parts[2];
      const hourStr = parts[3];
      const userId = parts.slice(4).join('-'); // Rejoindre au cas où l'userId contient des '-'
      
      try {
          // Recalculer la date/heure de début exacte
          const startTime = parse(`${dateStr}${hourStr}`, 'yyyyMMddHH', new Date());
          // Calculer l'heure de fin (par ex. +2 heures)
          const endTime = addHours(startTime, 2); 

          console.log(`Updating task ${taskId} to startTime: ${startTime}, endTime: ${endTime}, userId: ${userId}`);

          // Appeler la mutation pour mettre à jour la tâche
          updateTaskMutation.mutate({
              taskId: taskId,
              data: {
                  startTime: startTime,
                  endTime: endTime,
                  assignedUserId: userId,
                  status: 'planifie' // Mettre à jour le statut
              }
          });
          // Le onSuccess de la mutation gérera l'invalidation et le toast

      } catch (e) {
          console.error("Erreur lors du parsing de la date/heure du slot:", e);
          toast({ title: "Erreur", description: "Impossible de calculer la date/heure.", variant: "destructive" });
      }
      
    } else {
      // Gérer d'autres cas de DND (ex: réordonner dans la sidebar, déplacer dans le calendrier) si nécessaire
      console.log('Unhandled drag and drop:', result);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}> 
      <div className="flex h-[calc(100vh-var(--header-height,60px))] ">
        <div className="w-1/4 max-w-xs min-w-[250px]">
          {/* Passer l'id du droppable à la sidebar */}
          <TaskListSidebar onAddTask={handleAddTask} droppableId="sidebar-unplanned" /> 
        </div>
        <div className="flex-1 overflow-auto p-4">
          {/* Passer la prop pour activer le DND sur le calendrier */}
          <WorkloadCalendar 
            onSelectEvent={handleSelectEvent} 
            onSelectSlot={handleSelectSlot} 
            isDroppable={true} // Indiquer que le calendrier doit gérer le drop
          />
        </div>
        
        <TaskForm 
          isOpen={isModalOpen} 
          onRequestClose={() => {
            setIsModalOpen(false);
            setSelectedTask(null);
          }} 
          taskToEdit={selectedTask} 
          onSave={handleSaveTask} 
        />
      </div>
    </DragDropContext>
  );
};

export default WorkloadPage; 