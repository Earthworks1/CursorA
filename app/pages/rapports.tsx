import { useQuery } from '@tanstack/react-query';
import { rapportsApi } from '@/api/rapports';

export default function Rapports() {
  const { data: statistiques, isLoading: isLoadingStats } = useQuery({
    queryKey: ['statistiques'],
    queryFn: () => rapportsApi.getStatistiques(),
  });

  const { data: chargesTravail, isLoading: isLoadingCharges } = useQuery({
    queryKey: ['charges-travail'],
    queryFn: () => rapportsApi.getChargesTravail(),
  });

  if (isLoadingStats || isLoadingCharges) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rapports</h1>
      
      {/* Statistiques */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Statistiques générales</h2>
        {statistiques && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">Projets</h3>
              <p className="mt-1 text-2xl font-semibold text-blue-900">
                {statistiques.projets || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Tâches</h3>
              <p className="mt-1 text-2xl font-semibold text-green-900">
                {statistiques.totalTaches || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">Utilisateurs</h3>
              <p className="mt-1 text-2xl font-semibold text-purple-900">
                {statistiques.utilisateurs || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charges de travail */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Charges de travail</h2>
        {chargesTravail && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ressource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charge totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibilité
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chargesTravail.ressources.map((ressource) => (
                  <tr key={ressource.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ressource.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ressource.charge}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 