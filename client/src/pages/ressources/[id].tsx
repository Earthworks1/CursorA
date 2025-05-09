import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ressourcesApi } from '../../api/ressources';

export default function RessourceDetails() {
  const [, params] = useParams();
  const id = parseInt(params?.id || '0');

  const { data: ressource, isLoading, error } = useQuery({
    queryKey: ['ressource', id],
    queryFn: () => ressourcesApi.getById(id),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement de la ressource</div>;
  if (!ressource) return <div>Ressource non trouvée</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{ressource.nom}</h1>
      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Informations</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{ressource.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Disponibilité</dt>
              <dd className="mt-1 text-sm text-gray-900">{ressource.disponibilite}</dd>
            </div>
            {ressource.competences && ressource.competences.length > 0 && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Compétences</dt>
                <dd className="mt-1">
                  <ul className="flex flex-wrap gap-2">
                    {ressource.competences.map((competence) => (
                      <li
                        key={competence}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {competence}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
} 