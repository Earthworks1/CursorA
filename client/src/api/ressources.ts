import { toast } from "sonner";
import { handleResponse } from './index';

export interface Ressource {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  competences: string[];
  disponibilite: {
    debut: string;
    fin: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const ressourcesApi = {
  getAll: async (): Promise<Ressource[]> => {
    try {
      const response = await fetch('/api/ressources');
      return handleResponse<Ressource[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources:', error);
      toast.error('Impossible de récupérer les ressources');
      throw error;
    }
  },

  getById: async (id: string): Promise<Ressource> => {
    try {
      const response = await fetch(`/api/ressources/${id}`);
      return handleResponse<Ressource>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de la ressource:', error);
      toast.error('Impossible de récupérer la ressource');
      throw error;
    }
  },

  create: async (ressource: Omit<Ressource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ressource> => {
    try {
      const response = await fetch('/api/ressources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ressource),
      });
      return handleResponse<Ressource>(response);
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error);
      toast.error('Impossible de créer la ressource');
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Omit<Ressource, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Ressource> => {
    try {
      const response = await fetch(`/api/ressources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse<Ressource>(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ressource:', error);
      toast.error('Impossible de mettre à jour la ressource');
      throw error;
    }
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/ressources/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la ressource:', error);
      toast.error('Impossible de supprimer la ressource');
      throw error;
    }
  },
}; 