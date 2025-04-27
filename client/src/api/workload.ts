import { toast } from "sonner";
import { handleResponse } from './index';
import { formatISO, parseISO } from 'date-fns';
import { Task, TaskInput, TaskUpdate, Site, User } from '@/types/workload';

// Fonction utilitaire pour convertir les dates
const convertDates = <T extends { startTime?: string | Date | null; endTime?: string | Date | null }>(data: T): T => {
  const converted = { ...data };
  if (converted.startTime instanceof Date) {
    converted.startTime = formatISO(converted.startTime);
  }
  if (converted.endTime instanceof Date) {
    converted.endTime = formatISO(converted.endTime);
  }
  return converted;
};

// Fonction utilitaire pour parser les dates dans la réponse
const parseDates = <T extends { startTime?: string | Date | null; endTime?: string | Date | null; createdAt: string | Date; updatedAt?: string | Date }>(data: T): T => {
  const parsed = { ...data };
  if (parsed.startTime) parsed.startTime = parseISO(String(parsed.startTime));
  if (parsed.endTime) parsed.endTime = parseISO(String(parsed.endTime));
  parsed.createdAt = parseISO(String(parsed.createdAt));
  if (parsed.updatedAt) parsed.updatedAt = parseISO(String(parsed.updatedAt));
  return parsed;
};

export const workloadApi = {
  // Tâches
  getAll: async (): Promise<Task[]> => {
    try {
      const response = await fetch('/api/workload/tasks');
      const data = await handleResponse<Task[]>(response);
      return data.map(task => parseDates(task));
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      toast.error('Impossible de récupérer les tâches');
      throw error;
    }
  },

  getTasksByWeek: async (week: string): Promise<Task[]> => {
    try {
      const response = await fetch(`/api/workload/tasks?week=${week}`);
      const data = await handleResponse<Task[]>(response);
      return data.map(task => parseDates(task));
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      toast.error('Impossible de récupérer les tâches');
      throw error;
    }
  },

  getTask: async (taskId: string): Promise<Task> => {
    try {
      const response = await fetch(`/api/workload/tasks/${taskId}`);
      const data = await handleResponse<Task>(response);
      return parseDates(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      toast.error('Impossible de récupérer la tâche');
      throw error;
    }
  },

  createTask: async (task: TaskInput): Promise<Task> => {
    try {
      const response = await fetch('/api/workload/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertDates(task)),
      });
      const data = await handleResponse<Task>(response);
      return parseDates(data);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      toast.error('Impossible de créer la tâche');
      throw error;
    }
  },

  update: async (taskId: string, updates: TaskUpdate): Promise<Task> => {
    try {
      const response = await fetch(`/api/workload/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(convertDates(updates)),
      });
      const data = await handleResponse<Task>(response);
      return parseDates(data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error('Impossible de mettre à jour la tâche');
      throw error;
    }
  },

  delete: async (taskId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/workload/tasks/${taskId}`, {
        method: 'DELETE',
      });
      await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error('Impossible de supprimer la tâche');
      throw error;
    }
  },

  // Utilisateurs
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch('/api/workload/users');
      const data = await handleResponse<User[]>(response);
      return data.map(user => ({
        ...user,
        createdAt: parseISO(String(user.createdAt)),
        updatedAt: user.updatedAt ? parseISO(String(user.updatedAt)) : undefined,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error('Impossible de récupérer les utilisateurs');
      throw error;
    }
  },

  // Sites
  getSites: async (): Promise<Site[]> => {
    try {
      const response = await fetch('/api/workload/sites');
      const data = await handleResponse<Site[]>(response);
      return data.map(site => ({
        ...site,
        createdAt: parseISO(String(site.createdAt)),
        updatedAt: site.updatedAt ? parseISO(String(site.updatedAt)) : undefined,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des sites:', error);
      toast.error('Impossible de récupérer les sites');
      throw error;
    }
  },
}; 