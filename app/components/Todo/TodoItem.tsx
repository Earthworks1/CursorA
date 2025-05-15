'use client';

import { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TrashIcon } from '@heroicons/react/24/outline';

interface TodoItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TodoItem({ task, onToggleComplete, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          id={`task-${task.id}`}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}
        >
          {task.title}
        </label>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700"
      >
        <TrashIcon className="h-4 w-4" />
      </Button>
    </div>
  );
} 