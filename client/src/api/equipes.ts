import { Equipe } from '../types';

export const equipesApi = {
  getAll: async (): Promise<Equipe[]> => {
    const response = await fetch('/api/equipes');
    if (!response.ok) {
      throw new Error('Failed to fetch equipes');
    }
    return response.json();
  },
  
  getById: async (id: number): Promise<Equipe> => {
    const response = await fetch(`/api/equipes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch equipe');
    }
    return response.json();
  },
  
  create: async (equipe: Omit<Equipe, 'id'>): Promise<Equipe> => {
    const response = await fetch('/api/equipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipe),
    });
    if (!response.ok) {
      throw new Error('Failed to create equipe');
    }
    return response.json();
  },
  
  update: async (id: number, equipe: Partial<Equipe>): Promise<Equipe> => {
    const response = await fetch(`/api/equipes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipe),
    });
    if (!response.ok) {
      throw new Error('Failed to update equipe');
    }
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`/api/equipes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete equipe');
    }
  },
}; 