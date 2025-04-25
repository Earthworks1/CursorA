import React, { useState } from 'react';
import TagInput from './ui/tag-input';
import SubtaskList from './tasks/subtask-list';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function TestComponent() {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [tacheId] = useState<number>(1); // ID de test pour la tâche

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Test des composants</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test des Tags</h2>
        <TagInput
          selectedTags={selectedTagIds}
          onTagsChange={setSelectedTagIds}
          placeholder="Ajouter des tags de test..."
        />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Tags sélectionnés: {selectedTagIds.join(', ')}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Test des Sous-tâches</h2>
        <SubtaskList tacheId={tacheId} />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            ID de la tâche parent: {tacheId}
          </p>
        </div>
      </Card>
    </div>
  );
} 