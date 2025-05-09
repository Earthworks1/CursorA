import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { equipesApi } from '../../api/equipes';

export default function EquipeDetails() {
  const [, params] = useParams();
  const id = parseInt(params?.id || '0');

  const { data: equipe, isLoading, error } = useQuery({
    queryKey: ['equipe', id],
    queryFn: () => equipesApi.getById(id),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement de l'équipe</div>;
  if (!equipe) return <div>Équipe non trouvée</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{equipe.nom}</h1>
      {equipe.description && (
        <p className="text-gray-600">{equipe.description}</p>
      )}
      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Membres de l'équipe</h2>
          {equipe.membres && equipe.membres.length > 0 ? (
            <ul className="space-y-2">
              {equipe.membres.map((membreId) => (
                <li key={membreId} className="text-gray-700">
                  Membre #{membreId}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Aucun membre dans cette équipe</p>
          )}
        </div>
      </div>
    </div>
  );
} 