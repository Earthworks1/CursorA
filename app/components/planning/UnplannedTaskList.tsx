'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Copied from app/planning/page.tsx for now
interface Task {
  id: string;
  title: string;
  description?: string;
  startTime?: Date | null;
  endTime?: Date | null;
  status: string;
  priority?: string;
  assignedTo?: string;
  progress?: number;
  chantier?: {
    id: string;
    nom: string;
  };
  pilote?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

interface UnplannedTaskListItemProps {
  task: Task;
}

const UnplannedTaskListItem: React.FC<UnplannedTaskListItemProps> = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'UNPLANNED_TASK', // Type distinct
    item: { task }, // Passer l'objet tâche entier
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag as React.Ref<HTMLDivElement>} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move', marginBottom: '8px' }}>
      <Card>
        <CardHeader className="p-2"> {/* Padding réduit pour un affichage plus compact */}
          <CardTitle className="text-sm">{task.title || 'Tâche sans titre'}</CardTitle>
        </CardHeader>
        {task.description && (
          <CardContent className="p-2 text-xs"> {/* Padding réduit */}
            <p>{task.description}</p>
          </CardContent>
        )}
        {/* Ajoutez d'autres détails si nécessaire, ex: priorité, tags */}
      </Card>
    </div>
  );
};

interface UnplannedTaskListProps {
  tasks: Task[];
}

const UnplannedTaskList: React.FC<UnplannedTaskListProps> = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Aucune tâche non planifiée.
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2 h-full overflow-y-auto"> {/* Hauteur et scroll si besoin */}
      <h3 className="text-lg font-semibold mb-2">Tâches à planifier</h3>
      {tasks.map(task => (
        <UnplannedTaskListItem key={task.id} task={task} />
      ))}
    </div>
  );
};

export default UnplannedTaskList;
