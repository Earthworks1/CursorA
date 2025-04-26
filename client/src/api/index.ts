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
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: response.statusText || 'Une erreur inconnue est survenue',
      };
    }

    throw new APIError(
      response.status,
      errorData.error || 'Une erreur est survenue',
      errorData.details
    );
  }

  // Pour les réponses 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new APIError(
      500,
      'Erreur lors de la lecture de la réponse',
      error
    );
  }
} 