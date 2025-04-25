import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, User, Site } from '@shared/types/workload';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, fetchSites } from './WorkloadCalendar'; // Réutiliser les fonctions
import { formatISO, parseISO } from 'date-fns'; // Pour formater/parser les dates

interface TaskFormProps {
  isOpen: boolean;
  onRequestClose: () => void;
  taskToEdit: Partial<Task> | null; // Partial car on peut pré-remplir seulement certaines props
  onSave: (formData: Omit<Task, 'id' | 'createdAt'> | Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
}

// Helper pour formater une Date en string datetime-local
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  try {
    // Format YYYY-MM-DDTHH:mm
    return formatISO(date).substring(0, 16);
  } catch {
    return '';
  }
};

const TaskForm: React.FC<TaskFormProps> = ({ isOpen, onRequestClose, taskToEdit, onSave }) => {
  // États du formulaire
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Task['type']>('leve');
  const [siteId, setSiteId] = useState<string | null>(null);
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>(''); // Stocker comme string YYYY-MM-DDTHH:mm
  const [endTime, setEndTime] = useState<string>('');
  const [status, setStatus] = useState<Task['status']>('a_planifier');
  const [notes, setNotes] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Users & Sites pour les selects
  const { data: users, isLoading: isLoadingUsers } = 
    useQuery<User[]>({ queryKey: ['workloadUsers'], queryFn: fetchUsers, staleTime: Infinity });
  const { data: sites, isLoading: isLoadingSites } = 
    useQuery<Site[]>({ queryKey: ['workloadSites'], queryFn: fetchSites, staleTime: Infinity });

  // Pré-remplir le formulaire si taskToEdit est fourni
  useEffect(() => {
    if (taskToEdit) {
      setDescription(taskToEdit.description || '');
      setType(taskToEdit.type || 'leve');
      setSiteId(taskToEdit.siteId || null);
      setAssignedUserId(taskToEdit.assignedUserId || null);
      setStartTime(formatDateForInput(taskToEdit.startTime));
      setEndTime(formatDateForInput(taskToEdit.endTime));
      setStatus(taskToEdit.status || 'a_planifier');
      setNotes(taskToEdit.notes || null);
      setError(null);
    } else {
      // Reset form for new task
      setDescription('');
      setType('leve');
      setSiteId(null);
      setAssignedUserId(null);
      setStartTime('');
      setEndTime('');
      setStatus('a_planifier');
      setNotes(null);
      setError(null);
    }
  }, [taskToEdit, isOpen]); // Re-run quand la tâche change OU que la modale s'ouvre

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startTime || !endTime) {
        setError("Les dates et heures de début et de fin sont requises.");
        return;
    }
    
    const startDate = parseISO(startTime);
    const endDate = parseISO(endTime);

    if (endDate <= startDate) {
      setError("La date de fin doit être strictement postérieure à la date de début.");
      return;
    }

    const formData = {
      description,
      type,
      siteId,
      assignedUserId,
      startTime: startDate, // Envoyer objets Date
      endTime: endDate,
      status,
      notes,
    };

    onSave(formData);
  };

  // Options pour les selects (pourrait être mis en dehors du composant)
  const typeOptions: Task['type'][] = ['leve', 'implantation', 'recolement', 'etude', 'dao', 'autre'];
  const statusOptions: Task['status'][] = ['a_planifier', 'planifie', 'en_cours', 'termine', 'bloque'];

  return (
    <Dialog open={isOpen} onOpenChange={onRequestClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit?.id ? 'Modifier la Tâche' : 'Nouvelle Tâche'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={type} onValueChange={(value: Task['type']) => setType(value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner type..." />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="site" className="text-right">Site</Label>
              <Select value={siteId ?? 'none'} onValueChange={(value) => setSiteId(value === 'none' ? null : value)} >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner site..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {isLoadingSites ? <SelectItem value="loading" disabled>Chargement...</SelectItem> : 
                    sites?.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="user" className="text-right">Assigné à</Label>
              <Select value={assignedUserId ?? 'none'} onValueChange={(value) => setAssignedUserId(value === 'none' ? null : value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Assigner à..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  {isLoadingUsers ? <SelectItem value="loading" disabled>Chargement...</SelectItem> : 
                    users?.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">Début</Label>
              <Input id="startTime" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">Fin</Label>
              <Input id="endTime" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Statut</Label>
               <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner statut..." />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt.replace('_', ' ').charAt(0).toUpperCase() + opt.replace('_', ' ').slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea id="notes" value={notes ?? ''} onChange={(e) => setNotes(e.target.value || null)} className="col-span-3" />
            </div>
            {error && (
              <div className="col-span-4 text-red-600 text-sm text-center p-2 bg-red-100 border border-red-300 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onRequestClose}>Annuler</Button>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm; 