import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { useSousTaches } from '@/hooks/useSousTaches';
import { Spinner } from '@/components/ui/spinner';

interface SubtaskListProps {
  tacheId: number;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ tacheId }) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const {
    sousTaches,
    isLoading,
    error,
    createSousTache,
    toggleSousTache,
    deleteSousTache,
  } = useSousTaches(tacheId);

  const handleAddSubtask = async () => {
    if (newSubtaskTitle.trim()) {
      try {
        await createSousTache({ titre: newSubtaskTitle.trim(), tacheId });
        setNewSubtaskTitle('');
      } catch (error) {
        // L'erreur est déjà gérée par le hook et affichée via toast
        console.error('Erreur lors de la création de la sous-tâche:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Une erreur est survenue lors du chargement des sous-tâches
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Nouvelle sous-tâche..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleAddSubtask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {(sousTaches ?? []).map((sousTache) => (
          <div
            key={sousTache.id}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
          >
            <Checkbox
              checked={sousTache.completed}
              onCheckedChange={(checked) => 
                toggleSousTache(sousTache.id, checked as boolean)
              }
            />
            <span className={`flex-1 ${sousTache.completed ? 'line-through text-gray-500' : ''}`}>
              {sousTache.titre}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => deleteSousTache(sousTache.id)}
              className="h-8 w-8 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtaskList; 