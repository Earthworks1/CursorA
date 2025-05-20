"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTags } from '@/hooks/useTags';
import { Spinner } from '@/components/ui/spinner';

interface TagInputProps {
  selectedTags: number[];
  onTagsChange: (tagIds: number[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  selectedTags = [],
  onTagsChange,
  placeholder = "Ajouter un tag...",
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const { tags, isLoading, error, createTag } = useTags();

  const selectedTagObjects = (tags ?? []).filter(tag => selectedTags.includes(tag.id));

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      await addTag();
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const addTag = async () => {
    const tagName = inputValue.trim().toLowerCase();
    if (!tagName || selectedTags.length >= maxTags) return;

    // Vérifier si le tag existe déjà
    const existingTag = (tags ?? []).find(tag => tag.nom.toLowerCase() === tagName);
    
    try {
      if (existingTag) {
        if (!selectedTags.includes(existingTag.id)) {
          onTagsChange([...selectedTags, existingTag.id]);
        }
      } else {
        const newTag = await createTag({ nom: tagName });
        onTagsChange([...selectedTags, newTag.id]);
      }
      setInputValue('');
    } catch (error) {
      // L'erreur est déjà gérée par le hook et affichée via toast
      console.error('Erreur lors de la création du tag:', error);
    }
  };

  const removeTag = (tagId: number) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Une erreur est survenue lors du chargement des tags
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTagObjects.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
            style={tag.couleur ? { backgroundColor: tag.couleur } : undefined}
          >
            {tag.nom}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag()}
        placeholder={selectedTags.length < maxTags ? placeholder : "Nombre maximum de tags atteint"}
        disabled={selectedTags.length >= maxTags}
        className="w-full"
      />
      <p className="text-xs text-gray-500 mt-1">
        Appuyez sur Entrée ou utilisez une virgule pour ajouter un tag
      </p>
    </div>
  );
};

export default TagInput; 