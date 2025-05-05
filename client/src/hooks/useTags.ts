import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, tagsApi } from '@/api/tags';
import { toast } from 'sonner';

export function useTags() {
  const queryClient = useQueryClient();

  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['/api/tags'],
    queryFn: tagsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags'] });
    },
  });

  const createTag = async (tagData: { nom: string; couleur?: string }) => {
    try {
      const newTag = await createMutation.mutateAsync(tagData);
      toast.success('Tag créé avec succès');
      return newTag;
    } catch (error) {
      throw error;
    }
  };

  const deleteTag = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Tag supprimé avec succès');
    } catch (error) {
      throw error;
    }
  };

  return {
    tags,
    isLoading,
    error,
    createTag,
    deleteTag,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
} 