import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '@/types/workload';
import { Draggable } from '@hello-pangea/dnd';
import { cn } from '../../../lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TaskCardProps {
  task: Task;
  index: number;
  isDraggable?: boolean;
  onClick?: (task: Task) => void;
}

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'a_planifier':
      return 'bg-gray-500';
    case 'planifie':
      return 'bg-blue-500';
    case 'en_cours':
      return 'bg-yellow-500';
    case 'termine':
      return 'bg-green-500';
    case 'annule':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, index, isDraggable = true, onClick }) => {
  const content = (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-shadow',
        onClick && 'hover:border-primary'
      )}
      onClick={() => onClick?.(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary">{task.type.toUpperCase()}</Badge>
              <Badge className={cn('text-white', getStatusColor(task.status))}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-sm line-clamp-2">{task.description}</p>
          </div>
        </div>
        {task.startTime && (
          <div className="mt-2 text-xs text-gray-500">
            {format(task.startTime, 'EEEE d MMMM', { locale: fr })}
            <br />
            {format(task.startTime, 'HH:mm')} - {format(task.endTime!, 'HH:mm')}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!isDraggable) {
    return content;
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(snapshot.isDragging && 'opacity-50')}
        >
          {content}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard; 