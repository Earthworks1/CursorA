import { useState } from 'react';

let tagId = 0;

export function useTags() {
  const [tags, setTags] = useState<any[]>([]);
  const isLoading = false;
  const error = null;
  const addTag = (tag: any) => setTags(t => [...t, tag]);
  const removeTag = (tag: any) => setTags(t => t.filter(x => x.id !== tag.id));
  const createTag = async (tag: { nom: string }) => {
    const newTag = { id: ++tagId, nom: tag.nom };
    addTag(newTag);
    return newTag;
  };
  return { tags, isLoading, error, addTag, removeTag, createTag };
} 