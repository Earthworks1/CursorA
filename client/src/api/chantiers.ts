import { Chantier } from '../types';

export const chantiersApi = {
  getAll: async (): Promise<Chantier[]> => {
    const response = await fetch('/api/chantiers');
    if (!response.ok) {
      throw new Error('Failed to fetch chantiers');
    }
    return response.json();
  },
  
  getById: async (id: number): Promise<Chantier> => {
    const response = await fetch(`/api/chantiers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chantier');
    }
    return response.json();
  },
  
  create: async (chantier: Omit<Chantier, 'id'>): Promise<Chantier> => {
    const response = await fetch('/api/chantiers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chantier),
    });
    if (!response.ok) {
      throw new Error('Failed to create chantier');
    }
    return response.json();
  },
  
  update: async (id: number, chantier: Partial<Chantier>): Promise<Chantier> => {
    const response = await fetch(`/api/chantiers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chantier),
    });
    if (!response.ok) {
      throw new Error('Failed to update chantier');
    }
    return response.json();
  },
  
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`/api/chantiers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete chantier');
    }
  },
}; 