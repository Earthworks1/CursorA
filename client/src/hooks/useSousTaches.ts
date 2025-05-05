import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SousTache, sousTachesApi } from '@/api/sous-taches';
import { toast } from 'sonner';

export function useSousTaches(tacheId: number) {
  const queryClient = useQueryClient();

  const { data: sousTaches, isLoading, error } = useQuery({
    queryKey: ['/api/sous-taches', tacheId],
    queryFn: () => sousTachesApi.getByTache(tacheId),
  });

  const createMutation = useMutation({
    mutationFn: sousTachesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sous-taches', tacheId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { completed?: boolean; titre?: string } }) =>
      sousTachesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sous-taches', tacheId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: sousTachesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sous-taches', tacheId] });
    },
  });

  const createSousTache = async (titre: string) => {
    try {
      const newSousTache = await sousTachesApi.create({
        titre,
        tacheId,
      });
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
      toast.success('Sous-tâche mise à jour avec succès');
      return updatedSousTache;
    } catch (error) {
      throw error;
    }
  };

  const deleteSousTache = async (id: number) => {
    try {
      await sousTachesApi.delete(id);
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
    createSousTache: createMutation.mutate,
    updateSousTache: updateMutation.mutate,
    deleteSousTache: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    toggleSousTache,
  };
} 