import React from 'react';
import { Task } from '@/types/workload';
import TaskCard from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  droppableId: string;
  title: string;
  onTaskClick?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, droppableId, title, onTaskClick }) => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 p-4 rounded-lg border border-dashed min-h-[200px]',
              snapshot.isDraggingOver ? 'bg-gray-50 border-gray-400' : 'border-gray-200'
            )}
          >
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  isDraggable
                  onClick={onTaskClick}
                />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default TaskList; 