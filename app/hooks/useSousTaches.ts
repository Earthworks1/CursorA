import { useState } from 'react';

export function useSousTaches(_?: any) {
  const [sousTaches, setSousTaches] = useState<any[]>([]);
  const isLoading = false;
  const error = null;
  const createSousTache = async (_?: any) => {};
  const toggleSousTache = (_?: any, __?: any) => {};
  const deleteSousTache = (_?: any) => {};
  return { sousTaches, setSousTaches, isLoading, error, createSousTache, toggleSousTache, deleteSousTache };
} 