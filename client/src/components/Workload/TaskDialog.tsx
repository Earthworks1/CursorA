import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '@/types/workload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import TaskForm from './TaskForm';

interface TaskDialogProps {
  task?: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Task>) => void;
  onDelete?: (task: Task) => void;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  task,
  isOpen,
  onOpenChange,
  onSave,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const handleClose = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleSave = (data: any) => {
    onSave(data);
    handleClose();
  };

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? (task ? 'Modifier la tâche' : 'Nouvelle tâche') : 'Détails de la tâche'}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <TaskForm
            initialData={task}
            onSubmit={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          task && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <p className="mt-1">{task.type.toUpperCase()}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{task.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Date et horaires</h4>
                <p className="mt-1">
                  {format(task.startTime!, 'EEEE d MMMM yyyy', { locale: fr })}
                  <br />
                  {format(task.startTime!, 'HH:mm')} - {format(task.endTime!, 'HH:mm')}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                <p className="mt-1">{task.status.replace('_', ' ')}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Supprimer
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Fermer
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </Button>
              </div>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog; 