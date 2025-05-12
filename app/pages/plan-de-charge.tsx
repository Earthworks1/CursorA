import { useEffect, useState } from 'react';

type User = { id: number | string; nom: string };
type Task = { id: number | string; titre: string };
type Planning = { id: number | string; utilisateur_id: number | string; tache_id: number | string; date: string; heure_debut: string; heure_fin: string; heures: string; statut: string };

export default function PlanDeChargeRapide() {
  const [planning, setPlanning] = useState<Planning[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch('/api/planning').then(res => res.json()).then(setPlanning);
    fetch('/api/utilisateurs').then(res => res.json()).then(setUsers);
    fetch('/api/taches').then(res => res.json()).then(setTasks);
  }, []);

  const getUser = (id: number | string) => users.find(u => u.id === id)?.nom || id;
  const getTask = (id: number | string) => tasks.find(t => t.id === id)?.titre || id;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Plan de charge rapide</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intervenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heures</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {planning.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">{getUser(p.utilisateur_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getTask(p.tache_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.heure_debut}h</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.heure_fin}h</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.heures}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.statut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 