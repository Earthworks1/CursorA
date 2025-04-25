import { tagsApi } from './tags';
import { sousTachesApi } from './sous-taches';
import { workloadApi } from './workload';
import { ressourcesApi } from './ressources';
import { planningApi } from './planning';
import { tachesApi } from './taches';

export {
  tagsApi,
  sousTachesApi,
  workloadApi,
  ressourcesApi,
  planningApi,
  tachesApi
};

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Une erreur inconnue est survenue' }));
    throw new APIError(response.status, error.error || 'Une erreur est survenue');
  }
  return response.json();
} 