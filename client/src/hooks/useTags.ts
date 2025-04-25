import { useState, useEffect, useCallback } from 'react';
import { Tag, tagsApi } from '@/lib/api';
import { toast } from 'sonner';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedTags = await tagsApi.getAll();
      setTags(fetchedTags);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (tagData: { nom: string; couleur?: string }) => {
    try {
      const newTag = await tagsApi.create(tagData);
      setTags(current => [...current, newTag]);
      toast.success('Tag créé avec succès');
      return newTag;
    } catch (error) {
      throw error;
    }
  };

  const deleteTag = async (id: number) => {
    try {
      await tagsApi.delete(id);
      setTags(current => current.filter(tag => tag.id !== id));
      toast.success('Tag supprimé avec succès');
    } catch (error) {
      throw error;
    }
  };

  return {
    tags,
    isLoading,
    error,
    refresh: fetchTags,
    createTag,
    deleteTag,
  };
} 