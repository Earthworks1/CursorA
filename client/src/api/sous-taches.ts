import { toast } from "sonner";
import { handleResponse } from './index';

export interface SousTache {
  id: number;
  titre: string;
  completed: boolean;
  tacheId: number;
  created_at: string;
  updated_at: string;
}

export const sousTachesApi = {
  getByTache: async (tacheId: number): Promise<SousTache[]> => {
    try {
      const response = await fetch(`/api/sous-taches?tacheId=${tacheId}`);
      return handleResponse<SousTache[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des sous-tâches:', error);
      toast.error('Impossible de récupérer les sous-tâches');
      throw error;
    }
  },

  create: async (sousTache: { titre: string; tacheId: number }): Promise<SousTache> => {
    try {
      const response = await fetch('/api/sous-taches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sousTache),
      });
      return handleResponse<SousTache>(response);
    } catch (error) {
      console.error('Erreur lors de la création de la sous-tâche:', error);
      toast.error('Impossible de créer la sous-tâche');
      throw error;
    }
  },

  update: async (id: number, updates: { completed?: boolean; titre?: string }): Promise<SousTache> => {
    try {
      const response = await fetch(`/api/sous-taches?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return handleResponse<SousTache>(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la sous-tâche:', error);
      toast.error('Impossible de mettre à jour la sous-tâche');
      throw error;
    }
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/sous-taches?id=${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression de la sous-tâche:', error);
      toast.error('Impossible de supprimer la sous-tâche');
      throw error;
    }
  },
}; 