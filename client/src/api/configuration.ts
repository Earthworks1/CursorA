import { api } from './api';

export interface Configuration {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  timezone: string;
  notifications: boolean;
}

export const configurationApi = {
  getConfig: async (): Promise<Configuration> => {
    const response = await api.get('/api/configuration');
    return response.data;
  },

  updateConfig: async (config: Partial<Configuration>): Promise<Configuration> => {
    const response = await api.put('/api/configuration', config);
    return response.data;
  },
}; 