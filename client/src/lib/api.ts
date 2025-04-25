import { toast } from "sonner";

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Une erreur inconnue est survenue' }));
    throw new APIError(response.status, error.error || 'Une erreur est survenue');
  }
  return response.json();
}

// Types
export interface Tag {
  id: number;
  nom: string;
  couleur?: string;
  created_at: string;
}

export interface SousTache {
  id: number;
  titre: string;
  completed: boolean;
  tacheId: number;
  created_at: string;
  updated_at: string;
}

// API Tags
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

// API Sous-tâches
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