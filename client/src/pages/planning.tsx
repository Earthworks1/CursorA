import { useQuery } from '@tanstack/react-query';
import { tachesApi } from '../api/taches';

export default function Planning() {
  const { data: taches, isLoading, error } = useQuery({
    queryKey: ['taches'],
    queryFn: () => tachesApi.getAll(),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement des tâches</div>;
  if (!taches) return <div>Aucune tâche trouvée</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Planning</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tâche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de fin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taches.map((tache) => (
                <tr key={tache.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tache.titre}</div>
                    {tache.description && (
                      <div className="text-sm text-gray-500">{tache.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tache.statut === 'termine' ? 'bg-green-100 text-green-800' :
                      tache.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                      tache.statut === 'en_retard' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tache.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tache.priorite === 'haute' ? 'bg-red-100 text-red-800' :
                      tache.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {tache.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tache.dateDebut).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tache.dateFin ? new Date(tache.dateFin).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 