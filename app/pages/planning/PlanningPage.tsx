import React, { useState, useEffect } from "react";
import { addDays, startOfWeek, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { useForm, SubmitHandler } from "react-hook-form";

// Données mock pour la démo
const intervenants = [
  { id: "1", nom: "Antoine", initials: "AD" },
  { id: "2", nom: "Lucie", initials: "LM" },
  { id: "3", nom: "Marc", initials: "MB" },
];

const initialTaches = [
  { id: "t1", intervenantId: "1", date: "2025-04-28", chantier: "ZAC des Fleurs", type: "Levé", couleur: "bg-blue-200", etat: "À faire" },
  { id: "t2", intervenantId: "2", date: "2025-04-29", chantier: "Route D34", type: "Implantation", couleur: "bg-green-200", etat: "En cours" },
  { id: "t3", intervenantId: "3", date: "2025-04-30", chantier: "Beau Soleil", type: "Récolement", couleur: "bg-yellow-200", etat: "Fait" },
];

const joursSemaine = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."];

function getWeekDates(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

type PlanningTache = { id: string; intervenantId: string; date: string; chantier: string; type: string; couleur: string; etat: string };

type FormInputs = Omit<PlanningTache, 'id'>;

function TaskCard({ tache, dragListeners, isDragging, onDelete }: { tache: PlanningTache; dragListeners: Record<string, any>; isDragging: boolean; onDelete?: () => void }) {
  return (
    <div
      {...dragListeners}
      className={`rounded p-2 shadow text-xs cursor-move transition-transform duration-200 ${tache.couleur} ${isDragging ? "ring-2 ring-blue-400 scale-105 z-10" : ""}`}
      title={`Chantier: ${tache.chantier}\nType: ${tache.type}\nÉtat: ${tache.etat}`}
      style={{ opacity: isDragging ? 0.7 : 1 }}
    >
      <div className="font-bold">{tache.chantier}</div>
      <div>{tache.type}</div>
      <div className="italic text-gray-600">{tache.etat}</div>
      {onDelete && (
        <button
          className="text-red-500 text-xs ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Supprimer
        </button>
      )}
    </div>
  );
}

function DroppableCell({ cellId, children }: { cellId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: cellId });
  return (
    <td
      ref={setNodeRef}
      className={`p-2 border-b h-20 align-top transition-colors duration-150 ${isOver ? "bg-blue-50" : ""}`}
    >
      {children}
    </td>
  );
}

export default function PlanningPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-04-28"));
  const [taches, setTaches] = useState(initialTaches);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<PlanningTache | null>(null);
  const weekDates = getWeekDates(currentDate);
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormInputs>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les tâches depuis l'API au montage
  useEffect(() => {
    setLoading(true);
    fetch("/api/planning-tasks")
      .then((res) => res.json())
      .then((data) => {
        setTaches(data);
        setLoading(false);
      })
      .catch((e) => {
        setError("Erreur de chargement des tâches");
        setLoading(false);
      });
  }, [currentDate]);

  // Navigation semaine
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const goToday = () => setCurrentDate(new Date());

  // Drag & drop handlers
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    const t = taches.find((t) => t.id === event.active.id);
    setDraggedTask(t || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setDraggedTask(null);
    if (!over) return;
    const [intervenantId, date] = (over.id as string).split("|");
    setLoading(true);
    fetch("/api/planning-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: active.id, intervenantId, date }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTaches((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du déplacement");
        setLoading(false);
      });
  }

  function onAddTask(data: FormInputs) {
    setLoading(true);
    const newTask = {
      ...data,
      couleur: "bg-blue-200" // Couleur par défaut
    };
    fetch("/api/planning-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((newTask) => {
        setTaches((prev) => [...prev, newTask]);
        setShowForm(false);
        reset();
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors de l'ajout");
        setLoading(false);
      });
  }

  function handleDeleteTask(id: string) {
    setLoading(true);
    fetch("/api/planning-tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(() => {
        setTaches((prev) => prev.filter((t) => t.id !== id));
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur lors de la suppression");
        setLoading(false);
      });
  }

  return (
    <div className="p-6">
      {loading && <div className="mb-2 text-blue-600">Chargement...</div>}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {/* Header navigation semaine */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="px-2 py-1 bg-gray-100 rounded">←</button>
          <span className="font-semibold text-lg">
            {format(weekDates[0], "MMMM yyyy", { locale: fr })} – Semaine {format(weekDates[0], "I", { locale: fr })}
          </span>
          <button onClick={nextWeek} className="px-2 py-1 bg-gray-100 rounded">→</button>
          <button onClick={goToday} className="ml-4 px-2 py-1 bg-blue-100 rounded">Aujourd'hui</button>
        </div>
        <button
          className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowForm((v) => !v)}
        >
          + Nouvelle tâche
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={handleSubmit(onAddTask)}
          className="mb-4 p-4 bg-gray-50 rounded shadow flex flex-wrap gap-2 items-end"
        >
          <input {...register("chantier", { required: true })} placeholder="Chantier" className="border p-1 rounded" />
          <select {...register("intervenantId", { required: true })} className="border p-1 rounded">
            <option value="">Intervenant</option>
            {intervenants.map((i) => (
              <option key={i.id} value={i.id}>{i.nom}</option>
            ))}
          </select>
          <select {...register("date", { required: true })} className="border p-1 rounded">
            <option value="">Jour</option>
            {weekDates.map((d) => (
              <option key={d.toISOString()} value={format(d, "yyyy-MM-dd")}>{format(d, "EEEE dd/MM", { locale: fr })}</option>
            ))}
          </select>
          <select {...register("type", { required: true })} className="border p-1 rounded">
            <option value="Levé">Levé</option>
            <option value="Implantation">Implantation</option>
            <option value="Récolement">Récolement</option>
          </select>
          <select {...register("etat", { required: true })} className="border p-1 rounded">
            <option value="À faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Fait">Fait</option>
          </select>
          <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Ajouter</button>
          <button type="button" className="px-3 py-1 bg-gray-300 rounded ml-2" onClick={() => setShowForm(false)}>Annuler</button>
        </form>
      )}

      {/* Grille calendrier avec DndContext */}
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white rounded shadow">
            <thead>
              <tr>
                <th className="p-2 border-b bg-gray-50 w-32">Intervenant</th>
                {weekDates.map((date, idx) => (
                  <th key={idx} className="p-2 border-b text-center bg-gray-50">
                    {joursSemaine[idx]}<br />
                    <span className="text-xs text-gray-500">{format(date, "dd/MM")}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {intervenants.map((interv) => (
                <tr key={interv.id}>
                  <td className="p-2 border-b font-semibold flex items-center gap-2">
                    <span className="bg-gray-200 rounded-full px-2 py-1 text-xs">{interv.initials}</span> {interv.nom}
                  </td>
                  {weekDates.map((date, idx) => {
                    const cellId = `${interv.id}|${format(date, "yyyy-MM-dd")}`;
                    const tache = taches.find(
                      (t) => t.intervenantId === interv.id && t.date === format(date, "yyyy-MM-dd")
                    );
                    return (
                      <DroppableCell key={idx} cellId={cellId}>
                        {tache ? (
                          <DraggableTask tache={tache} isDragging={activeId === tache.id} onDelete={() => handleDeleteTask(tache.id)} />
                        ) : null}
                      </DroppableCell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DragOverlay>
          {draggedTask ? (
            <TaskCard 
              tache={draggedTask} 
              isDragging={true} 
              dragListeners={{}} 
              onDelete={() => handleDeleteTask(draggedTask.id)} 
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DraggableTask({ tache, isDragging, onDelete }: { tache: PlanningTache; isDragging: boolean; onDelete?: () => void }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: tache.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <TaskCard tache={tache} dragListeners={{}} isDragging={isDragging} onDelete={onDelete} />
    </div>
  );
} 