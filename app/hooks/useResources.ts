"use client";

import { useQuery } from '@tanstack/react-query';
import { Resource } from '@/types/resource';

const fetchResources = async (): Promise<Resource[]> => {
  const response = await fetch('/api/ressources');
  if (!response.ok) {
    throw new Error('Failed to fetch resources');
  }
  return response.json();
};

export function useResources() {
  const { data: resources = [], isLoading, error } = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  });

  return {
    resources,
    isLoading,
    error,
  };
} 