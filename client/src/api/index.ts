import { chantiersApi } from './chantiers';
import { tachesApi } from './taches';
import { equipesApi } from './equipes';
import { ressourcesApi } from './ressources';
import { rapportsApi } from './rapports';
import { configurationApi } from './configuration';

export const api = {
  chantiers: chantiersApi,
  taches: tachesApi,
  equipes: equipesApi,
  ressources: ressourcesApi,
  rapports: rapportsApi,
  configuration: configurationApi,
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