'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PlanningCalendar from '@/components/planning/PlanningCalendar';
import Gantt from '@/components/Gantt';
import Heatmap from '@/components/Heatmap';
import PlanCharge from '@/components/planning/PlanCharge';
import { useToast } from '@/hooks/use-toast';

// Types pour la gestion multi-utilisateur
interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
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

interface User {
  id: string;
  nom: string;
  prenom: string;
  role: string;
}

const PlanningPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [startDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 15); // 15 jours avant
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

        setTasks(tasksData);
        setUsers(usersData);
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

  const handleTaskMove = async (taskId: string, newStartTime: Date, newEndTime: Date) => {
    try {
      const response = await fetch(`/api/planning/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          startDate: newStartTime.toISOString(),
          endDate: newEndTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour de la tâche');

      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

      toast({
        title: 'Tâche mise à jour',
        description: 'La tâche a été déplacée avec succès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la tâche',
        variant: 'destructive',
      });
    }
  };

  const handleCellClick = (date: Date, tasksOnDate: Task[]) => {
    // TODO: Afficher un modal avec les détails des tâches
    console.log('Tâches du', date, ':', tasksOnDate);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="hebdo" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="hebdo">Vue Hebdomadaire</TabsTrigger>
          <TabsTrigger value="gantt">Vue Gantt</TabsTrigger>
          <TabsTrigger value="heatmap">Vue Heatmap</TabsTrigger>
          <TabsTrigger value="charge">Plan de charge</TabsTrigger>
        </TabsList>

        <TabsContent value="hebdo">
          <PlanningCalendar tasks={tasks} users={users} />
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
          <PlanCharge tasks={tasks} users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningPage; 