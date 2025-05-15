'use client';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Plus, Calendar, Clock, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskList from '@/components/planning/TaskList';

// Types de base
interface Intervenant {
  id: number;
  nom: string;
  prenom: string;
}

interface Tache {
  id: string;
  titre: string;
  description?: string;
  statut: string;
  assignedTo?: number; // id de l'intervenant
  date: string; // YYYY-MM-DD
  heureDebut: number; // ex: 8 pour 8h
  heureFin: number; // ex: 10 pour 10h
}

interface Chantier {
  id: number;
  nom: string;
}

interface Pilote {
  id: number;
  nom: string;
  prenom: string;
}

const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const heures = Array.from({ length: 12 }, (_, i) => 7 + i); // 7h à 18h

function getWeekDates(startDate: Date) {
  // Retourne les dates (YYYY-MM-DD) du lundi au vendredi de la semaine de startDate
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Tache> & { chantierId?: string; piloteId?: string }) => void;
  defaultDate: string;
  defaultHeure: number;
  defaultIntervenant?: number;
  intervenants: Intervenant[];
  chantiers: Chantier[];
  pilotes: Pilote[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  defaultHeure,
  defaultIntervenant,
  intervenants,
  chantiers,
  pilotes,
}) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [intervenantId, setIntervenantId] = useState<string>(defaultIntervenant?.toString() || '');
  const [heureDebut, setHeureDebut] = useState(defaultHeure);
  const [heureFin, setHeureFin] = useState(defaultHeure + 1);
  const [chantierId, setChantierId] = useState('');
  const [piloteId, setPiloteId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      titre,
      description,
      assignedTo: Number(intervenantId),
      date: defaultDate,
      heureDebut,
      heureFin,
      statut: 'a_planifier',
      chantierId,
      piloteId,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="intervenant">Intervenant</Label>
            <Select value={intervenantId} onValueChange={setIntervenantId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un intervenant" />
              </SelectTrigger>
              <SelectContent>
                {intervenants.map((i) => (
                  <SelectItem key={i.id} value={i.id.toString()}>
                    {i.prenom} {i.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="chantier">Chantier</Label>
            <Select value={chantierId} onValueChange={setChantierId} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un chantier" />
              </SelectTrigger>
              <SelectContent>
                {chantiers.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pilote">Pilote</Label>
            <Select value={piloteId} onValueChange={setPiloteId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un pilote" />
              </SelectTrigger>
              <SelectContent>
                {pilotes.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.prenom} {p.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="heureDebut">Heure de début</Label>
              <Select value={heureDebut.toString()} onValueChange={(v) => setHeureDebut(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {heures.map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="heureFin">Heure de fin</Label>
              <Select value={heureFin.toString()} onValueChange={(v) => setHeureFin(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {heures.filter(h => h > heureDebut).map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h}h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function PlanningHebdoPage() {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>(getWeekDates(new Date()));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    intervenantId: number;
    date: string;
    heure: number;
  } | null>(null);
  const [chantiers, setChantiers] = useState<Chantier[]>([]);
  const [pilotes, setPilotes] = useState<Pilote[]>([]);

  useEffect(() => {
    // Récupérer les intervenants
    fetch('/api/utilisateurs')
      .then(res => res.json())
      .then(data => setIntervenants(data));
    // Récupérer les tâches
    fetch('/api/planning/tasks')
      .then(res => res.json())
      .then(data => {
        // Adapter le mapping si besoin
        setTaches(
          data.map((t: any) => ({
            id: t.id?.toString() ?? '',
            titre: t.title || t.titre || '',
            statut: t.status || t.statut || '',
            assignedTo: t.assignedTo || t.intervenant_id,
            date: t.startDate ? t.startDate.slice(0, 10) : '',
            heureDebut: t.startDate ? new Date(t.startDate).getHours() : 8,
            heureFin: t.endDate ? new Date(t.endDate).getHours() : 17,
          }))
        );
      });
    fetch('/api/chantiers')
      .then(res => res.json())
      .then(data => setChantiers(data));
    fetch('/api/utilisateurs')
      .then(res => res.json())
      .then(data => setPilotes(data.filter((u: any) => u.role === 'pilote')));
  }, []);

  // Tâches à planifier (To-do)
  const tachesAPlanifier = taches.filter(t => !t.assignedTo || !t.date);
  // Tâches planifiées (affichées dans la grille)
  const tachesPlanifiees = taches.filter(t => t.assignedTo && t.date);

  // Gestion du drag & drop
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    setLoading(true);
    // Si on drop sur la To-do list, on "déplanifie" la tâche
    if (destination.droppableId === 'todo-list') {
      setTaches(prev => prev.map(t =>
        t.id === draggableId ? { ...t, assignedTo: undefined, date: '', heureDebut: 8, heureFin: 17 } : t
      ));
      try {
        await fetch(`/api/planning/tasks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: draggableId, assignedTo: null, startDate: null, endDate: null })
        });
        toast({
          title: 'Tâche déplanifiée',
          description: 'La tâche a été retirée du planning.',
        });
      } catch (e) {
        toast({
          title: 'Erreur',
          description: 'Erreur lors de la mise à jour de la tâche (déplanification)',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sinon, on drop sur une cellule de la grille
    // droppableId = cell-<intervenantId>-<date>-<heure>
    const match = destination.droppableId.match(/^cell-(\d+)-(\d{4}-\d{2}-\d{2})-(\d{1,2})$/);
    if (!match) {
      setLoading(false);
      return;
    }
    const [_, intervenantId, date, heure] = match;
    const heureDebut = parseInt(heure, 10);
    const heureFin = heureDebut + 1;

    setTaches(prev => prev.map(t =>
      t.id === draggableId
        ? { ...t, assignedTo: Number(intervenantId), date, heureDebut, heureFin }
        : t
    ));

    // Appel API pour mettre à jour la tâche
    try {
      await fetch(`/api/planning/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggableId,
          assignedTo: Number(intervenantId),
          startDate: `${date}T${heureDebut.toString().padStart(2, '0')}:00:00`,
          endDate: `${date}T${heureFin.toString().padStart(2, '0')}:00:00`
        })
      });
      toast({
        title: 'Tâche planifiée',
        description: `La tâche a été planifiée pour le ${date} à ${heureDebut}h.`,
      });
    } catch (e) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour de la tâche (planification)',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Ajout rapide d'une tâche (mock, à relier à l'API si besoin)
  const handleAddTask = () => {
    const titre = prompt('Titre de la nouvelle tâche :');
    if (titre && titre.trim().length > 0) {
      setTaches(prev => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          titre,
          statut: 'a_planifier',
          date: '',
          heureDebut: 8,
          heureFin: 9,
        },
      ]);
      toast({
        title: 'Tâche ajoutée',
        description: 'La tâche a été ajoutée à la To-do list.',
      });
    }
  };

  const handleCellClick = (intervenantId: number, date: string, heure: number) => {
    setSelectedCell({ intervenantId, date, heure });
    setIsCreateModalOpen(true);
  };

  async function checkTaskConsistency(taskId: string) {
    try {
      const res = await fetch(`/api/planning/tasks/${taskId}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la vérification de la tâche");
      }
      const data = await res.json();
      const { chantier, pilote, assignedTo, startDate, endDate } = data;
      if (!chantier || !pilote || !assignedTo || !startDate || !endDate) {
        toast({ title: "Attention", description: "La tâche a été créée mais certains champs (chantier, pilote, intervenant, dates) ne sont pas cohérents.", variant: "destructive" });
      } else {
        toast({ title: "Cohérence OK", description: "La tâche a été créée et est bien liée au chantier, au pilote et à l'intervenant.", variant: "default" });
      }
    } catch (e) {
      toast({ title: "Erreur de cohérence", description: "Impossible de vérifier la cohérence de la tâche.", variant: "destructive" });
    }
  }

  const handleCreateTask = async (taskData: Partial<Tache> & { chantierId?: string; piloteId?: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/planning/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskData.titre,
          description: taskData.description,
          assignedTo: taskData.assignedTo,
          chantierId: taskData.chantierId ? Number(taskData.chantierId) : undefined,
          piloteId: taskData.piloteId ? Number(taskData.piloteId) : undefined,
          startDate: `${taskData.date}T${taskData.heureDebut?.toString().padStart(2, '0')}:00:00`,
          endDate: `${taskData.date}T${taskData.heureFin?.toString().padStart(2, '0')}:00:00`,
          status: 'a_planifier',
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la tâche');
      
      const newTask = await response.json();
      setTaches(prev => [...prev, {
        id: newTask.id.toString(),
        titre: newTask.title,
        description: newTask.description,
        statut: newTask.status,
        assignedTo: newTask.assignedTo,
        date: newTask.startDate.slice(0, 10),
        heureDebut: new Date(newTask.startDate).getHours(),
        heureFin: new Date(newTask.endDate).getHours(),
      }]);

      // Vérifier la cohérence de la tâche créée
      await checkTaskConsistency(newTask.id.toString());

      toast({
        title: 'Tâche créée',
        description: 'La tâche a été créée avec succès.',
      });
    } catch (e) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de la tâche',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar avec la liste des tâches */}
        <div className="w-80 border-r bg-gray-50 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tâches à planifier</h2>
            <Button size="sm" onClick={handleAddTask}>
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <TaskList
            tasks={tachesAPlanifier}
            title="À planifier"
            droppableId="todo-list"
          />
        </div>

        {/* Zone principale */}
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Planning hebdomadaire</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Vue calendrier
                </Button>
                <Button variant="outline" size="sm">
                  <List className="w-4 h-4 mr-1" />
                  Vue liste
                </Button>
                <Button variant="outline" size="sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Vue horaire
                </Button>
              </div>
            </div>
          </div>

          {/* Grille du planning */}
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-[auto,repeat(5,1fr)] gap-px bg-gray-200">
              {/* En-tête avec les jours */}
              <div className="bg-gray-50 p-2 font-medium">Intervenants</div>
              {weekDates.map((date, index) => (
                <div key={date} className="bg-gray-50 p-2 font-medium">
                  {joursSemaine[index]}
                  <div className="text-sm text-gray-500">
                    {new Date(date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}

              {/* Corps de la grille */}
              {intervenants.map((intervenant) => (
                <React.Fragment key={intervenant.id}>
                  <div className="bg-white p-2 border-t">
                    {intervenant.prenom} {intervenant.nom}
                  </div>
                  {weekDates.map((date) => (
                    <div key={`${intervenant.id}-${date}`} className="bg-white p-2 border-t">
                      {heures.map((heure) => {
                        const cellId = `cell-${intervenant.id}-${date}-${heure}`;
                        const tasksInCell = tachesPlanifiees.filter(
                          (t) =>
                            t.assignedTo === intervenant.id &&
                            t.date === date &&
                            t.heureDebut <= heure &&
                            t.heureFin > heure
                        );

                        return (
                          <Droppable key={cellId} droppableId={cellId}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`h-8 border-b border-gray-100 ${
                                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleCellClick(intervenant.id, date, heure)}
                              >
                                {tasksInCell.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-1 text-sm rounded ${
                                          snapshot.isDragging ? 'shadow-lg' : ''
                                        }`}
                                      >
                                        {task.titre}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        );
                      })}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedCell(null);
        }}
        onSubmit={handleCreateTask}
        defaultDate={selectedCell?.date || ''}
        defaultHeure={selectedCell?.heure || 8}
        defaultIntervenant={selectedCell?.intervenantId}
        intervenants={intervenants}
        chantiers={chantiers}
        pilotes={pilotes}
      />
    </DragDropContext>
  );
} 