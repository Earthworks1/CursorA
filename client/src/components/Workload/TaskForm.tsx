import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskInput, TaskType, TaskStatus, TaskTypes, TaskStatuses } from '@/types/workload';
import { useQuery } from '@tanstack/react-query';
import { workloadApi } from '@/api/workload';
import { parseISO, addHours, format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { TaskSchema } from '@/types/workload';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { formatDateForInput } from './dateHelpers';

interface TaskFormProps {
  isOpen: boolean;
  onRequestClose: () => void;
  taskToEdit: Partial<Task> | null;
  onSave: (formData: TaskInput) => void;
}

// Schéma de validation du formulaire
const TaskFormSchema = TaskSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

type TaskFormData = z.infer<typeof TaskFormSchema>;

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onRequestClose, taskToEdit, onSave }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<TaskFormData>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      description: '',
      type: 'leve' as TaskType,
      siteId: null,
      assignedUserId: null,
      startTime: null,
      endTime: null,
      status: 'a_planifier' as TaskStatus,
      notes: null,
    },
  });

  // Requêtes pour les utilisateurs et les sites
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/workload/users'],
    queryFn: workloadApi.getUsers,
    staleTime: Infinity,
  });

  const { data: sites, isLoading: isLoadingSites } = useQuery({
    queryKey: ['/api/workload/sites'],
    queryFn: workloadApi.getSites,
    staleTime: Infinity,
  });

  // Reset le formulaire quand la tâche change ou que la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      form.reset(taskToEdit ? {
        ...taskToEdit,
        startTime: taskToEdit.startTime || null,
        endTime: taskToEdit.endTime || null,
      } : {
        description: '',
        type: 'leve',
        siteId: null,
        assignedUserId: null,
        startTime: null,
        endTime: null,
        status: 'a_planifier',
        notes: null,
      });
    }
  }, [taskToEdit, isOpen, form.reset]);

  const onSubmit = form.handleSubmit(async (data) => {
    // Validation supplémentaire des dates
    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      toast({
        title: 'Erreur',
        description: 'La date de fin doit être après la date de début.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      await onSave(data);
      toast({
        title: taskToEdit?.id ? 'Tâche modifiée' : 'Tâche créée',
        description: taskToEdit?.id ? 'La tâche a bien été modifiée.' : 'La tâche a bien été créée.',
      });
      onRequestClose();
    } catch (e) {
      toast({
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  });

  // Observer les changements de startTime pour mettre à jour endTime automatiquement
  const startTime = form.watch('startTime');
  useEffect(() => {
    if (startTime && !form.watch('endTime')) {
      form.reset({
        ...form.watch(),
        endTime: addHours(startTime, 2),
      }, { keepDefaultValues: true });
    }
  }, [startTime, form.reset, form.watch]);

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit?.id ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            id="description"
                            placeholder="Description de la tâche"
                            className={form.formState.errors.description ? "border-red-500" : ""}
                          />
                        </FormControl>
                        {form.formState.errors.description && (
                          <FormMessage className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className={form.formState.errors.type ? "border-red-500" : ""}>
                                <SelectValue placeholder="Sélectionner type..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TaskTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        {form.formState.errors.type && (
                          <FormMessage className="text-red-500 text-sm mt-1">{form.formState.errors.type.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site" className="text-right">Site</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="siteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value ?? "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner site..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucun</SelectItem>
                              {isLoadingSites ? (
                                <SelectItem value="loading" disabled>Chargement...</SelectItem>
                              ) : (
                                sites?.map(site => (
                                  <SelectItem key={site.id} value={site.id}>
                                    {site.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedUser" className="text-right">Assigné à</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="assignedUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value ?? "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Assigner à..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucun</SelectItem>
                              {isLoadingUsers ? (
                                <SelectItem value="loading" disabled>Chargement...</SelectItem>
                              ) : (
                                users?.map(user => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startTime" className="text-right">Début</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            id="startTime"
                            type="datetime-local"
                            value={value ? formatDateForInput(value) : ''}
                            onChange={(e) => onChange(e.target.value ? parseISO(e.target.value) : null)}
                            className={form.formState.errors.startTime ? "border-red-500" : ""}
                          />
                        </FormControl>
                        {form.formState.errors.startTime && (
                          <FormMessage className="text-red-500 text-sm mt-1">{form.formState.errors.startTime.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endTime" className="text-right">Fin</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            id="endTime"
                            type="datetime-local"
                            value={value ? formatDateForInput(value) : ''}
                            onChange={(e) => onChange(e.target.value ? parseISO(e.target.value) : null)}
                            className={form.formState.errors.endTime ? "border-red-500" : ""}
                          />
                        </FormControl>
                        {form.formState.errors.endTime && (
                          <FormMessage className="text-red-500 text-sm mt-1">{form.formState.errors.endTime.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Statut</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className={form.formState.errors.status ? "border-red-500" : ""}>
                                <SelectValue placeholder="Sélectionner statut..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TaskStatuses.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        {form.formState.errors.status && (
                          <FormMessage className="text-red-500 text-sm mt-1">{form.formState.errors.status.message}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value || null)}
                            placeholder="Notes optionnelles"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onRequestClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm; 