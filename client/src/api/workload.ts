import { toast } from "sonner";
import { handleResponse } from './index';
import { formatISO } from 'date-fns';

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  resourceId: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export const workloadApi = {
  getTasks: async (week?: string): Promise<Task[]> => {
    try {
      const url = week ? `/api/workload/tasks?week=${week}` : '/api/workload/tasks';
      const response = await fetch(url);
      return handleResponse<Task[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      toast.error('Impossible de récupérer les tâches');
      throw error;
    }
  },

  getTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await fetch(`/api/workload/tasks/${taskId}`);
      return handleResponse<Task>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      toast.error('Impossible de récupérer la tâche');
      throw error;
    }
  },

  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const bodyData = { ...task };
      if (bodyData.startTime) bodyData.startTime = formatISO(bodyData.startTime);
      if (bodyData.endTime) bodyData.endTime = formatISO(bodyData.endTime);

      const response = await fetch('/api/workload/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      return handleResponse<Task>(response);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      toast.error('Impossible de créer la tâche');
      throw error;
    }
  },

  updateTask: async (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
    try {
      const bodyData = { ...updates };
      if (bodyData.startTime && bodyData.startTime instanceof Date) {
        bodyData.startTime = formatISO(bodyData.startTime);
      }
      if (bodyData.endTime && bodyData.endTime instanceof Date) {
        bodyData.endTime = formatISO(bodyData.endTime);
      }

      const response = await fetch(`/api/workload/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      return handleResponse<Task>(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error('Impossible de mettre à jour la tâche');
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/workload/tasks/${taskId}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error('Impossible de supprimer la tâche');
      throw error;
    }
  },
}; 