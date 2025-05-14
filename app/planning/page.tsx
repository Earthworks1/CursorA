'use client';

import React, { useState, useEffect } from 'react';
import Gantt from '@/components/Gantt';
import Heatmap from '@/components/Heatmap';
import { Task, Chantier, User } from '@/types';
import PlanningHebdoPage from './hebdo/page';
import { Calendar } from '@/components/ui/calendar';

export default function PlanningPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'hebdo' | 'mois' | 'gantt' | 'heatmap'>('hebdo');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tasksRes, chantiersRes, usersRes] = await Promise.all([
        fetch('/api/planning/tasks'),
        fetch('/api/chantiers'),
        fetch('/api/utilisateurs'),
      ]);
      if (!tasksRes.ok || !chantiersRes.ok || !usersRes.ok) throw new Error('Erreur lors du chargement des données');
      const tasksData = await tasksRes.json();
      const chantiersData = await chantiersRes.json();
      const usersData = await usersRes.json();
      setChantiers(chantiersData);
      setUtilisateurs(usersData);
      // Mapping enrichi
      setTasks(tasksData.map((t: any) => ({
        ...t,
        chantier: chantiersData.find((c: any) => c.id === (t.chantierId || t.chantier_id)),
        pilote: usersData.find((u: any) => u.id === (t.piloteId || t.pilote_id)),
      })));
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
      await fetchAll();
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
      <h1 className="text-2xl font-bold mb-4">Planification</h1>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('hebdo')} className={`px-4 py-2 rounded ${tab === 'hebdo' ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600'}`}>Hebdo</button>
        <button onClick={() => setTab('mois')} className={`px-4 py-2 rounded ${tab === 'mois' ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600'}`}>Mois</button>
        <button onClick={() => setTab('gantt')} className={`px-4 py-2 rounded ${tab === 'gantt' ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600'}`}>Gantt</button>
        <button onClick={() => setTab('heatmap')} className={`px-4 py-2 rounded ${tab === 'heatmap' ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600'}`}>Heatmap</button>
      </div>
      {tab === 'hebdo' && <PlanningHebdoPage />}
      {tab === 'mois' && <div className="bg-white rounded-lg shadow p-4"><Calendar /></div>}
      {tab === 'gantt' && <div className="bg-white rounded-lg shadow p-4"><Gantt /></div>}
      {tab === 'heatmap' && <div className="bg-white rounded-lg shadow p-4"><Heatmap /></div>}
    </div>
  );
} 