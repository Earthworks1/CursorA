import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export async function apiRequest(method: string, url: string, data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  // Pour GET, ne pas inclure body
  if (method.toUpperCase() === 'GET') {
    delete options.body;
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    let message = 'Erreur API';
    try {
      const err = await res.json();
      message = err.message || message;
    } catch {}
    throw new Error(message);
  }
  return res;
} 