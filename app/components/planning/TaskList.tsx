import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Task {
  id: string;
  titre: string;
  description?: string;
  statut: string;
  assignedTo?: number;
  date: string;
  heureDebut: number;
  heureFin: number;
}

interface TaskListProps {
  tasks: Task[];
  title: string;
  droppableId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'a_planifier':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'en_cours':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'termine':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'annule':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, title, droppableId }) => {
  return (
    <div className="w-80 bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-sm text-gray-500">{tasks.length} tâches</div>
      </div>
      
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="p-2 space-y-2"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-3 ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="font-medium">{task.titre}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500">
                            {task.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(task.statut)}>
                            {task.statut.replace('_', ' ')}
                          </Badge>
                          {task.date && (
                            <Badge variant="outline">
                              {task.date} ({task.heureDebut}h-{task.heureFin}h)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
};

export default TaskList; 