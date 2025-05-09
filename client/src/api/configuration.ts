import { handleResponse } from './index';

export interface Configuration {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en';
  timezone: string;
  notifications: boolean;
}

export const configurationApi = {
  getConfig: async (): Promise<Configuration> => {
    const response = await fetch('/api/configuration');
    return handleResponse<Configuration>(response);
  },

  updateConfig: async (config: Partial<Configuration>): Promise<Configuration> => {
    const response = await fetch('/api/configuration', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    return handleResponse<Configuration>(response);
  },
}; 