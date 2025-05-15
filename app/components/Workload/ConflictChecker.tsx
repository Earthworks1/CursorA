import React, { useMemo } from 'react';
import { Task } from '@/types';
import { areIntervalsOverlapping } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Conflict {
  task1: Task;
  task2: Task;
  type: 'OVERLAP' | 'SAME_USER' | 'SAME_CHANTIER';
  severity: 'WARNING' | 'ERROR';
}

interface ConflictCheckerProps {
  tasks: Task[];
  onResolveConflict?: (conflict: Conflict, resolution: 'KEEP_TASK1' | 'KEEP_TASK2' | 'MODIFY_TASK1' | 'MODIFY_TASK2') => void;
  className?: string;
}

export function ConflictChecker({ tasks, onResolveConflict, className }: ConflictCheckerProps) {
  const conflicts = useMemo(() => {
    const foundConflicts: Conflict[] = [];

    // Vérification des chevauchements et des conflits
    for (let i = 0; i < tasks.length; i++) {
      const task1 = tasks[i];
      
      for (let j = i + 1; j < tasks.length; j++) {
        const task2 = tasks[j];

        // Vérification des chevauchements temporels
        if (areIntervalsOverlapping(
          { start: new Date(task1.startTime), end: new Date(task1.endTime) },
          { start: new Date(task2.startTime), end: new Date(task2.endTime) }
        )) {
          // Conflit de ressource (même utilisateur)
          if (task1.assignedTo === task2.assignedTo && task1.assignedTo) {
            foundConflicts.push({
              task1,
              task2,
              type: 'SAME_USER',
              severity: 'ERROR',
            });
          }

          // Conflit de chantier
          if (task1.chantierId === task2.chantierId && task1.chantierId) {
            foundConflicts.push({
              task1,
              task2,
              type: 'SAME_CHANTIER',
              severity: 'WARNING',
            });
          }

          // Chevauchement simple
          if (task1.assignedTo !== task2.assignedTo && task1.chantierId !== task2.chantierId) {
            foundConflicts.push({
              task1,
              task2,
              type: 'OVERLAP',
              severity: 'WARNING',
            });
          }
        }
      }
    }

    return foundConflicts;
  }, [tasks]);

  if (conflicts.length === 0) {
    return null;
  }

  const errorConflicts = conflicts.filter(c => c.severity === 'ERROR');
  const warningConflicts = conflicts.filter(c => c.severity === 'WARNING');

  return (
    <div className={className}>
      {errorConflicts.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Conflits critiques détectés</AlertTitle>
          <AlertDescription>
            {errorConflicts.length} conflit(s) de ressource détecté(s). Certaines tâches sont assignées au même utilisateur sur des périodes qui se chevauchent.
          </AlertDescription>
        </Alert>
      )}

      {warningConflicts.length > 0 && (
        <Alert variant="default" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Avertissements</AlertTitle>
          <AlertDescription>
            {warningConflicts.length} chevauchement(s) détecté(s). Certaines tâches se chevauchent temporellement.
          </AlertDescription>
        </Alert>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Voir les détails des conflits ({conflicts.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails des conflits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {conflicts.map((conflict, index) => (
              <div
                key={`${conflict.task1.id}-${conflict.task2.id}`}
                className={`p-4 rounded-lg border ${
                  conflict.severity === 'ERROR' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <h4 className="font-semibold mb-2">
                  Conflit #{index + 1} - {conflict.type === 'SAME_USER' ? 'Conflit de ressource' :
                    conflict.type === 'SAME_CHANTIER' ? 'Conflit de chantier' : 'Chevauchement'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-1">Tâche 1</h5>
                    <p className="text-sm">{conflict.task1.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(conflict.task1.startTime).toLocaleString()} - {new Date(conflict.task1.endTime).toLocaleString()}
                    </p>
                    {conflict.task1.assignedUser && (
                      <p className="text-xs text-gray-500">
                        Assigné à: {conflict.task1.assignedUser.prenom} {conflict.task1.assignedUser.nom}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-1">Tâche 2</h5>
                    <p className="text-sm">{conflict.task2.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(conflict.task2.startTime).toLocaleString()} - {new Date(conflict.task2.endTime).toLocaleString()}
                    </p>
                    {conflict.task2.assignedUser && (
                      <p className="text-xs text-gray-500">
                        Assigné à: {conflict.task2.assignedUser.prenom} {conflict.task2.assignedUser.nom}
                      </p>
                    )}
                  </div>
                </div>

                {onResolveConflict && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveConflict(conflict, 'KEEP_TASK1')}
                    >
                      Garder la tâche 1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveConflict(conflict, 'KEEP_TASK2')}
                    >
                      Garder la tâche 2
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveConflict(conflict, 'MODIFY_TASK1')}
                    >
                      Modifier la tâche 1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResolveConflict(conflict, 'MODIFY_TASK2')}
                    >
                      Modifier la tâche 2
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 