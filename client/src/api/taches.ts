import { toast } from "sonner";
import { handleResponse } from './index';

export interface Tache {
  id: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  priorite: 'low' | 'medium' | 'high';
  statut: 'pending' | 'in-progress' | 'completed';
  ressourceId: string;
  chantierId: string;
  createdAt: string;
  updatedAt: string;
}

export const tachesApi = {
  getAll: async (): Promise<Tache[]> => {
    try {
      const response = await fetch('/api/taches');
      return handleResponse<Tache[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      toast.error('Impossible de récupérer les tâches');
      throw error;
    }
  },

  getById: async (id: string): Promise<Tache> => {
    try {
      const response = await fetch(`/api/taches/${id}`);
      return handleResponse<Tache>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error);
      toast.error('Impossible de récupérer la tâche');
      throw error;
    }
  },

  create: async (tache: Omit<Tache, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tache> => {
    try {
      const response = await fetch('/api/taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tache),
      });
      return handleResponse<Tache>(response);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      toast.error('Impossible de créer la tâche');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Omit<Tache, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Tache> => {
    try {
      const response = await fetch(`/api/taches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse<Tache>(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error('Impossible de mettre à jour la tâche');
      throw error;
    }
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/taches/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error('Impossible de supprimer la tâche');
      throw error;
    }
  },

  exportPdf: async (id: string): Promise<Blob> => {
    try {
      const response = await fetch(`/api/taches/${id}/export-pdf`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export PDF');
      }
      return response.blob();
    } catch (error) {
      console.error('Erreur lors de l\'export PDF de la tâche:', error);
      toast.error('Impossible d\'exporter la tâche en PDF');
      throw error;
    }
  },

  addPieceJointe: async (id: string, file: File): Promise<{ success: boolean }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/taches/${id}/pieces-jointes`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce jointe:', error);
      toast.error('Impossible d\'ajouter la pièce jointe');
      throw error;
    }
  },
}; 