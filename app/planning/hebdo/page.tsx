'use client';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Plus } from 'lucide-react';

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

export default function PlanningHebdoPage() {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [weekDates, setWeekDates] = useState<string[]>(getWeekDates(new Date()));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  return (
    <TooltipProvider>
      <div className="flex items-center justify-between mb-4 p-4">
        <h1 className="text-2xl font-bold">Planning hebdomadaire</h1>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex min-h-screen w-full bg-gray-50 relative flex-col md:flex-row">
          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          )}
          {/* Colonne To-do list */}
          <aside className="w-full md:w-1/4 p-4 border-r bg-white min-w-[220px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">À planifier</h2>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs shadow"
                onClick={handleAddTask}
                title="Ajouter une tâche"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
            <Droppable droppableId="todo-list">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                  {tachesAPlanifier.length === 0 && <div className="text-gray-400">Aucune tâche à planifier</div>}
                  {tachesAPlanifier.map((tache, index) => (
                    <Draggable key={tache.id} draggableId={tache.id} index={index}>
                      {(provided, snapshot) => (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-blue-100 border border-blue-300 rounded p-2 shadow-sm truncate ${snapshot.isDragging ? 'opacity-70' : ''}`}
                              style={{ maxWidth: '100%' }}
                            >
                              {tache.titre}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{tache.titre}</TooltipContent>
                        </Tooltip>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </aside>
          {/* Colonne Planning hebdo */}
          <main className="flex-1 p-4 overflow-x-auto">
            <h1 className="text-2xl font-bold mb-4">Planning hebdomadaire</h1>
            <div className="bg-white rounded shadow p-4 min-h-[500px] overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100"></th>
                    <th className="border p-2 bg-gray-100 text-center" colSpan={joursSemaine.length}>
                      Semaine du {weekDates[0]} au {weekDates[weekDates.length - 1]}
                    </th>
                  </tr>
                  <tr>
                    <th className="border p-2 bg-gray-100">Intervenant / Heure</th>
                    {joursSemaine.map((jour, idx) => (
                      <th key={jour} className="border p-2 bg-gray-100 text-center">
                        {jour}<br />
                        <span className="text-xs text-gray-400">{weekDates[idx]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {intervenants.map(intervenant => (
                    <React.Fragment key={intervenant.id}>
                      {heures.map(heure => (
                        <tr key={heure}>
                          {heure === 7 && (
                            <td className="border p-2 font-semibold bg-gray-50 w-40" rowSpan={heures.length} style={{ verticalAlign: 'top' }}>
                              {intervenant.prenom} {intervenant.nom}
                            </td>
                          )}
                          {weekDates.map((date, idx) => {
                            const droppableId = `cell-${intervenant.id}-${date}-${heure}`;
                            // Afficher la tâche si elle commence à cette heure/date/intervenant
                            const tache = tachesPlanifiees.find(
                              t => t.assignedTo === intervenant.id && t.date === date && t.heureDebut === heure
                            );
                            return (
                              <Droppable key={droppableId} droppableId={droppableId}>
                                {(provided, snapshot) => (
                                  <td
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`border min-w-[100px] h-10 align-top ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                                  >
                                    {tache ? (
                                      <Draggable draggableId={tache.id} index={0} key={tache.id}>
                                        {(provided, snapshot) => (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`bg-green-200 border border-green-400 rounded p-1 mb-1 shadow text-xs h-full flex flex-col justify-center truncate ${snapshot.isDragging ? 'opacity-70' : ''}`}
                                                style={{ minHeight: `${(tache.heureFin - tache.heureDebut) * 40}px`, maxWidth: '100%' }}
                                              >
                                                <div className="font-bold truncate">{tache.titre}</div>
                                                <div>{tache.heureDebut}h - {tache.heureFin}h</div>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>{tache.titre}</TooltipContent>
                                          </Tooltip>
                                        )}
                                      </Draggable>
                                    ) : null}
                                    {provided.placeholder}
                                  </td>
                                )}
                              </Droppable>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </DragDropContext>
    </TooltipProvider>
  );
} 