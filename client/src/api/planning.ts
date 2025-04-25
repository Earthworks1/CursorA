import { toast } from "sonner";
import { handleResponse } from './index';

export interface PlanningRessource {
  id: string;
  ressourceId: string;
  date: string;
  charge: number;
  createdAt: string;
  updatedAt: string;
}

export const planningApi = {
  getRessources: async (params?: URLSearchParams): Promise<PlanningRessource[]> => {
    try {
      const url = params ? `/api/planning/ressources?${params.toString()}` : '/api/planning/ressources';
      const response = await fetch(url);
      return handleResponse<PlanningRessource[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération du planning des ressources:', error);
      toast.error('Impossible de récupérer le planning des ressources');
      throw error;
    }
  },

  updateRessource: async (id: string, updates: Partial<Omit<PlanningRessource, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PlanningRessource> => {
    try {
      const response = await fetch(`/api/planning/ressources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse<PlanningRessource>(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du planning de la ressource:', error);
      toast.error('Impossible de mettre à jour le planning de la ressource');
      throw error;
    }
  },

  createRessource: async (planning: Omit<PlanningRessource, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlanningRessource> => {
    try {
      const response = await fetch('/api/planning/ressources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planning),
      });
      return handleResponse<PlanningRessource>(response);
    } catch (error) {
      console.error('Erreur lors de la création du planning de la ressource:', error);
      toast.error('Impossible de créer le planning de la ressource');
      throw error;
    }
  },

  deleteRessource: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/planning/ressources/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du planning de la ressource:', error);
      toast.error('Impossible de supprimer le planning de la ressource');
      throw error;
    }
  },
}; 