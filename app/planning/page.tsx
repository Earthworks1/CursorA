'use client';

import React, { useState, useEffect } from 'react';
import Gantt from '@/components/Gantt';
import Heatmap from '@/components/Heatmap';
import { Task } from '@/types';

export default function PlanningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/planning/tasks');
      if (!response.ok) throw new Error('Erreur lors du chargement des tâches');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (task: Task) => {
    try {
      const response = await fetch(`/api/planning/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleTaskMove = async (taskId: string, newStartDate: Date, newEndDate: Date) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        startDate: newStartDate,
        endDate: newEndDate,
      };

      await handleTaskUpdate(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleHeatmapCellClick = (date: Date, tasksOnDate: Task[]) => {
    console.log(`Tâches du ${date.toLocaleDateString()}:`, tasksOnDate);
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Planification</h1>
        <a href="/planning/hebdo" className="btn btn-outline-primary px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50 transition">Vue hebdo</a>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Vue Gantt</h2>
          <div className="h-[500px]">
            <Gantt
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskMove={handleTaskMove}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Charge de travail</h2>
          <Heatmap
            tasks={tasks}
            startDate={new Date()}
            endDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            onCellClick={handleHeatmapCellClick}
          />
        </div>
      </div>
    </div>
  );
} 