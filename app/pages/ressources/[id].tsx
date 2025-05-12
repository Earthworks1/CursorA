import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ressourcesApi } from '../../api/ressources';

export default function RessourceDetails() {
  const params = useParams();
  const id = parseInt(params?.id || '0');

  const { data: ressource, isLoading, error } = useQuery({
    queryKey: ['ressource', id],
    queryFn: () => ressourcesApi.getRessource(id)
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement de la ressource</div>;
  if (!ressource) return <div>Ressource non trouvée</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ressource.nom}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Informations</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{ressource.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Compétences</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {ressource.competences.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Disponibilité</dt>
              <dd className="mt-1 text-sm text-gray-900">{ressource.disponibilite}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Charge actuelle</dt>
              <dd className="mt-1 text-sm text-gray-900">{ressource.charge}%</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
} 