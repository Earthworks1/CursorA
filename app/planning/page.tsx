'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
// useDrop n'est plus utilisé directement ici, il est dans PlanningInteractiveArea
import UnplannedTaskList from '@/components/planning/UnplannedTaskList';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CreateTaskForm from '@/components/planning/CreateTaskForm';
import PlanningInteractiveArea from '@/components/planning/PlanningInteractiveArea'; // Importation du nouveau composant

// Charger dynamiquement le DndProvider côté client uniquement
const PlanningClientDndProvider = dynamic(() => import('@/components/planning/PlanningClientDndProvider'), {
  ssr: false,
});

// Les imports de Tabs, PlanningCalendar, Gantt, Heatmap, PlanCharge sont maintenant gérés
// à l'intérieur de PlanningInteractiveArea si ce dernier les utilise directement,
// ou ils restent ici si PlanningInteractiveArea les reçoit en tant que children (ce qui n'est pas le cas ici).
// Pour ce refactoring, PlanningInteractiveArea rend ces composants, donc ils n'ont plus besoin d'être importés ici.
// Cependant, les types Task, User, Resource sont toujours nécessaires.

// Types pour la gestion multi-utilisateur
export interface Task { // Ajout de export
  id: string;
  title: string;
  description?: string;
  startTime?: Date | null; // Modifié pour les tâches non planifiées
  endTime?: Date | null;   // Modifié pour les tâches non planifiées
  status: string;
  priority?: string;
  assignedTo?: string;
  progress?: number;
  chantier?: {
    id: string;
    nom: string;
  };
  pilote?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

export interface User { // Ajout de export
  id: string;
  nom: string;
  prenom: string;
  role: string;
}

// Interface pour les ressources du calendrier, compatible avec PlanningCalendar
export interface Resource { // Ajout de export
  id: string;
  title: string;
  type: 'EMPLOYE' | 'MATERIEL' | 'VEHICULE';
}

const PlanningPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]); // Tâches planifiées
  const [unplannedTasks, setUnplannedTasks] = useState<Task[]>([]); // Tâches non planifiées
  const [users, setUsers] = useState<User[]>([]);
  const [calendarResources, setCalendarResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [draggedUnplannedItem, setDraggedUnplannedItem] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // État pour la modale de création
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<null | { start: Date; end: Date; resourceId?: string }>(null); // État pour les infos du créneau
  const [startDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 15);
    return date;
  });
  const [endDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 45); // 45 jours après
    return date;
  });

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, usersRes] = await Promise.all([
          fetch('/api/planning/tasks'),
          fetch('/api/utilisateurs')
        ]);

        if (!tasksRes.ok || !usersRes.ok) {
          throw new Error('Erreur lors du chargement des données');
        }

        const [tasksData, usersData] = await Promise.all([
          tasksRes.json(),
          usersRes.json()
        ]);

        // Séparer les tâches planifiées et non planifiées
        const planned: Task[] = [];
        const unplanned: Task[] = [];

        // tasksData est un tableau de tâches brutes de l'API.
        // La propriété Task.startTime est une string issue du JSON, ou potentiellement null/undefined.
        (tasksData as any[]).forEach(task => {
          if (task.startTime && task.startTime !== '') {
            const startTime = new Date(task.startTime);
            let endTime;
            if (task.endTime && task.endTime !== '') {
              endTime = new Date(task.endTime);
            } else {
              // Si endTime est manquant ou vide, définir une durée par défaut (ex: 1 heure après startTime)
              endTime = new Date(startTime.getTime() + 3600000); 
            }
            planned.push({
              ...task,
              startTime: startTime,
              endTime: endTime,
            });
          } else {
            unplanned.push({
              ...task,
              startTime: null,
              endTime: null,
            });
          }
        });

        setTasks(planned);
        setUnplannedTasks(unplanned);
        setUsers(usersData); // Conserver l'état original des utilisateurs si nécessaire ailleurs

        // Transformer usersData en calendarResources
        const resources: Resource[] = usersData.map((user: User) => ({
          id: user.id,
          title: `${user.prenom} ${user.nom}`,
          type: 'EMPLOYE' as 'EMPLOYE', // Type par défaut
        }));
        setCalendarResources(resources);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du planning',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Fonction utilitaire pour mettre à jour une tâche (appel API et état local)
  const updateTaskOnServerAndState = async (taskId: string, updates: Partial<Task> & { startDate?: Date, endDate?: Date, resourceId?: string }) => {
    // Prépare les données pour l'API, en s'assurant que les dates sont en ISO string si elles existent
    const apiPayload: any = { id: taskId };
    if (updates.startDate) apiPayload.startDate = updates.startDate.toISOString();
    if (updates.endDate) apiPayload.endDate = updates.endDate.toISOString();
    if (updates.resourceId) apiPayload.resourceId = updates.resourceId;
    // Inclure d'autres champs si nécessaire, par ex. updates.title, updates.description
    // Pour l'instant, on se concentre sur le déplacement/redimensionnement.
    // Le champ `assignedTo` dans l'interface Task est probablement ce qui correspond à resourceId.
    // Si l'API attend `assignedTo` plutôt que `resourceId`, il faudra mapper ici.
    // Pour l'instant, on suppose que l'API peut gérer `resourceId` directement pour la mise à jour.

    try {
      const response = await fetch(`/api/planning/tasks`, { // L'API PUT actuelle est sur /api/planning/tasks
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour de la tâche');
      }

      const updatedTaskFromAPI = await response.json();

      // Mettre à jour l'état local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                startTime: new Date(updatedTaskFromAPI.start), 
                endTime: new Date(updatedTaskFromAPI.end),
                assignedTo: updatedTaskFromAPI.resourceId || task.assignedTo, // Mettre à jour assignedTo si resourceId a changé
              }
            : task
        )
      );

      toast({
        title: 'Tâche mise à jour',
        description: 'La tâche a été mise à jour avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de mise à jour',
        description: error.message || 'Impossible de mettre à jour la tâche.',
        variant: 'destructive',
      });
      // Potentiellement, ici, il faudrait réinitialiser la tâche à son état précédent si l'API échoue,
      // mais react-big-calendar gère cela visuellement par défaut.
    }
  };
  
  // Pour le Gantt - conserve l'ancienne signature pour l'instant
  const handleTaskMove = async (taskId: string, newStartTime: Date, newEndTime: Date) => {
    await updateTaskOnServerAndState(taskId, { startDate: newStartTime, endDate: newEndTime });
  };

  // Pour le PlanningCalendar onEventDrop (déplacement d'une tâche existante)
  const handleCalendarEventMove = async (dropInfo: { event: Task; start: Date; end: Date; resourceId?: string }) => {
    const { event, start, end, resourceId } = dropInfo;
    // Le resourceId vient de react-big-calendar et correspond à l'ID de la ressource sur laquelle l'événement a été déposé.
    // L'interface Task a `assignedTo`. Il faut s'assurer que c'est bien ce champ qui est mis à jour.
    await updateTaskOnServerAndState(event.id, { startDate: start, endDate: end, resourceId: resourceId });
  };

  // Pour le PlanningCalendar onEventResize (redimensionnement d'une tâche existante)
  const handleCalendarEventResize = async (resizeInfo: { event: Task; start: Date; end: Date }) => {
    const { event, start, end } = resizeInfo;
    await updateTaskOnServerAndState(event.id, { startDate: start, endDate: end });
  };

  const handleCellClick = (date: Date, tasksOnDate: Task[]) => {
    // TODO: Afficher un modal avec les détails des tâches
    console.log('Tâches du', date, ':', tasksOnDate);
  };

  // La logique de useDrop a été déplacée dans PlanningInteractiveArea.
  // L'état isOver n'est plus nécessaire ici.

  const handleSelectSlot = (slotInfo: { start: Date; end: Date; resourceId?: string }) => {
    if (draggedUnplannedItem) {
      const taskToUpdate = draggedUnplannedItem;
      setDraggedUnplannedItem(null); // Réinitialiser

      const newStartTime = slotInfo.start;
      // Calculez newEndTime. Si la tâche a une durée, utilisez-la. Sinon, default (ex: 1h ou fin du slot).
      // Les tâches non planifiées n'ont pas de startTime/endTime fiables pour calculer une durée.
      // Prenons une durée par défaut de 1 heure pour l'instant.
      const taskDuration = 3600000; // 1 heure en millisecondes
      const newEndTime = new Date(newStartTime.getTime() + taskDuration);

      console.log(
        'Unplanned task dropped and slot selected:', 
        { task: taskToUpdate.title, id: taskToUpdate.id }, 
        'newStartTime:', newStartTime, 
        'newEndTime:', newEndTime,
        'resourceId:', slotInfo.resourceId
      );

      // TODO: Appeler API PUT /api/planning/tasks/{taskToUpdate.id} avec startTime, endTime, resourceId, et nouveau statut
      // Exemple:
      // const updatedTaskFromAPI = await api.updateTask({ 
      //   id: taskToUpdate.id, 
      //   startTime: newStartTime.toISOString(), 
      //   endTime: newEndTime.toISOString(), 
      //   resourceId: slotInfo.resourceId,
      //   status: 'planifié' // ou un statut approprié
      // });

      // TODO: Mettre à jour les états setTasks et setUnplannedTasks
      // Exemple (après succès API):
      // setTasks(prevTasks => [...prevTasks, { ...taskToUpdate, startTime: newStartTime, endTime: newEndTime, assignedTo: slotInfo.resourceId, status: 'planifié' }]);
      // setUnplannedTasks(prevUnplanned => prevUnplanned.filter(t => t.id !== taskToUpdate.id));
      // toast({ title: 'Tâche planifiée', description: `${taskToUpdate.title} a été planifiée.` });
      
      toast({
        title: "Action (simulation)",
        description: `Tâche "${taskToUpdate.title}" déposée sur le créneau du ${newStartTime.toLocaleDateString()} à ${newStartTime.toLocaleTimeString()}. Resource ID: ${slotInfo.resourceId || 'N/A'}`,
        duration: 5000,
      });

    } else {
      // Logique existante pour "click to create" (ou future logique)
      console.log('Slot selected (no dragged item):', slotInfo);
      // Logique existante pour "click to create" (ou future logique)
      console.log('Slot selected for new task creation:', slotInfo);
      setSelectedSlotInfo({ start: slotInfo.start, end: slotInfo.end, resourceId: slotInfo.resourceId });
      setIsCreateModalOpen(true);
    }
  };

  const handleCreateTaskSubmit = async (formData: { title: string; description?: string; startTime: Date; endTime: Date; resourceId?: string; type: string; status: string }) => {
    if (!selectedSlotInfo) return;

    const newTaskPayload = {
      title: formData.title,
      description: formData.description || '',
      startDate: formData.startTime.toISOString(),
      endDate: formData.endTime.toISOString(),
      resourceId: formData.resourceId, // Ou selectedSlotInfo.resourceId si le formulaire ne le gère pas
      type: formData.type, // Assurez-vous que ces valeurs sont fournies par le formulaire ou des valeurs par défaut
      status: formData.status, // Idem
    };

    try {
      const response = await fetch('/api/planning/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la tâche');
      }

      const createdTask = await response.json();
      
      // Transformer les dates string en objets Date pour l'état local
      const newTaskForState: Task = {
        ...createdTask,
        startTime: new Date(createdTask.start),
        endTime: new Date(createdTask.end),
      };

      setTasks(prevTasks => [...prevTasks, newTaskForState]);
      setIsCreateModalOpen(false);
      toast({
        title: 'Tâche créée',
        description: `La tâche "${newTaskForState.title}" a été créée avec succès.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de création',
        description: error.message || 'Une erreur inconnue est survenue.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <PlanningClientDndProvider>
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-1/3 xl:w-1/4 p-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
            <UnplannedTaskList tasks={unplannedTasks} />
          </div>
          {/* PlanningInteractiveArea remplace l'ancienne div avec dropRef et Tabs */}
          <PlanningInteractiveArea
            tasks={tasks}
            calendarResources={calendarResources}
            users={users} // Pour PlanCharge à l'intérieur de PlanningInteractiveArea
            startDate={startDate} // Pour Heatmap
            endDate={endDate} // Pour Heatmap
            setDraggedUnplannedItem={setDraggedUnplannedItem} // Nécessaire pour la logique de drop externe
            // Callbacks
            handleCalendarEventMove={handleCalendarEventMove}
            handleCalendarEventResize={handleCalendarEventResize}
            handleSelectSlot={handleSelectSlot}
            handleTaskMove={handleTaskMove} // Pour Gantt
            handleCellClick={handleCellClick} // Pour Heatmap
          />
        </div>
      </div>

      {selectedSlotInfo && (
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            </DialogHeader>
            <CreateTaskForm
              initialData={{
                startTime: selectedSlotInfo.start,
                endTime: selectedSlotInfo.end,
                resourceId: selectedSlotInfo.resourceId,
              }}
              onSubmit={handleCreateTaskSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </PlanningClientDndProvider>
  );
};

export default PlanningPage; 