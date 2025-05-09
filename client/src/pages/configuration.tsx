import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configurationApi } from '../api/configuration';
import { toast } from 'sonner';

export default function Configuration() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ['configuration'],
    queryFn: () => configurationApi.getConfig(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (newConfig: Record<string, unknown>) => configurationApi.updateConfig(newConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuration'] });
      toast.success('Configuration mise à jour avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour de la configuration');
    },
  });

  if (isLoading) return <div>Chargement...</div>;
  if (!config) return <div>Configuration non trouvée</div>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newConfig = Object.fromEntries(formData.entries());
    updateConfigMutation.mutate(newConfig);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuration</h1>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
              Thème
            </label>
            <select
              id="theme"
              name="theme"
              defaultValue={config.theme}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Langue
            </label>
            <select
              id="language"
              name="language"
              defaultValue={config.language}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Fuseau horaire
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={config.timezone}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="UTC">UTC</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              defaultChecked={config.notifications}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
              Activer les notifications
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={updateConfigMutation.isPending}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {updateConfigMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 