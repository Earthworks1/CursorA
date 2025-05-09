import { QueryClient } from '@tanstack/react-query';
import { handleResponse } from '@/api/index';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }) => {
        const [url, ...params] = queryKey as [string, ...any[]];
        const queryParams = params[0] ? new URLSearchParams(params[0]).toString() : '';
        const fullUrl = queryParams ? `${url}?${queryParams}` : url;
        const response = await fetch(fullUrl);
        return handleResponse(response);
      },
    },
  },
});

export const apiRequest = async (url: string, method: string = 'GET', data?: any) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};
