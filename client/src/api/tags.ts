import { toast } from "sonner";
import { handleResponse } from './index';

export interface Tag {
  id: number;
  nom: string;
  couleur?: string;
  created_at: string;
}

export const tagsApi = {
  getAll: async (): Promise<Tag[]> => {
    try {
      const response = await fetch('/api/tags');
      return handleResponse<Tag[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des tags:', error);
      toast.error('Impossible de récupérer les tags');
      throw error;
    }
  },

  create: async (tag: { nom: string; couleur?: string }): Promise<Tag> => {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      });
      return handleResponse<Tag>(response);
    } catch (error) {
      console.error('Erreur lors de la création du tag:', error);
      toast.error('Impossible de créer le tag');
      throw error;
    }
  },

  delete: async (id: number): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`/api/tags?id=${id}`, {
        method: 'DELETE',
      });
      return handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Erreur lors de la suppression du tag:', error);
      toast.error('Impossible de supprimer le tag');
      throw error;
    }
  },
}; 