'use client';

import { Task } from '@/types/task';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="text-muted-foreground">Aucune tâche</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="space-y-1">
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(task.start), 'PPp', { locale: fr })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(task.status)}>
              {task.status}
            </Badge>
            <Badge variant="outline">{task.type}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusVariant(status: Task['status']) {
  switch (status) {
    case 'PLANIFIE':
      return 'secondary';
    case 'EN_COURS':
      return 'default';
    case 'TERMINE':
      return 'success';
    case 'ANNULE':
      return 'destructive';
    default:
      return 'outline';
  }
} 