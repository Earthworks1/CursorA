import { useState, useEffect, useCallback } from 'react';
import { SousTache, sousTachesApi } from '@/lib/api';
import { toast } from 'sonner';

export function useSousTaches(tacheId: number) {
  const [sousTaches, setSousTaches] = useState<SousTache[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSousTaches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedSousTaches = await sousTachesApi.getByTache(tacheId);
      setSousTaches(fetchedSousTaches);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  }, [tacheId]);

  useEffect(() => {
    fetchSousTaches();
  }, [fetchSousTaches]);

  const createSousTache = async (titre: string) => {
    try {
      const newSousTache = await sousTachesApi.create({
        titre,
        tacheId,
      });
      setSousTaches(current => [...current, newSousTache]);
      toast.success('Sous-tâche créée avec succès');
      return newSousTache;
    } catch (error) {
      throw error;
    }
  };

  const updateSousTache = async (
    id: number,
    updates: { completed?: boolean; titre?: string }
  ) => {
    try {
      const updatedSousTache = await sousTachesApi.update(id, updates);
      setSousTaches(current =>
        current.map(st => (st.id === id ? updatedSousTache : st))
      );
      toast.success('Sous-tâche mise à jour avec succès');
      return updatedSousTache;
    } catch (error) {
      throw error;
    }
  };

  const deleteSousTache = async (id: number) => {
    try {
      await sousTachesApi.delete(id);
      setSousTaches(current => current.filter(st => st.id !== id));
      toast.success('Sous-tâche supprimée avec succès');
    } catch (error) {
      throw error;
    }
  };

  const toggleSousTache = async (id: number, completed: boolean) => {
    return updateSousTache(id, { completed });
  };

  return {
    sousTaches,
    isLoading,
    error,
    refresh: fetchSousTaches,
    createSousTache,
    updateSousTache,
    deleteSousTache,
    toggleSousTache,
  };
} 