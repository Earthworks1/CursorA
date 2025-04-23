import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getTimeAgo } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { Link } from 'wouter';

type Activity = {
  id: number;
  type: string;
  description: string;
  userName: string;
  targetName: string;
  metadata?: {
    details?: string;
  };
  created_at: string;
};

// Icône et couleur selon le type d'activité
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'revision':
      return { icon: 'file-edit-line', bgColor: 'bg-blue-500' };
    case 'validation':
      return { icon: 'check-line', bgColor: 'bg-green-500' };
    case 'ajout_document':
      return { icon: 'attachment-line', bgColor: 'bg-secondary-500' };
    case 'retard':
      return { icon: 'alarm-warning-line', bgColor: 'bg-red-500' };
    case 'assignation':
      return { icon: 'user-add-line', bgColor: 'bg-primary-800' };
    case 'creation':
      return { icon: 'building-line', bgColor: 'bg-gray-400' };
    default:
      return { icon: 'information-line', bgColor: 'bg-gray-500' };
  }
};

// Rendu des icônes Remix (remixicon)
const RemixIcon = ({ icon, className }: { icon: string; className?: string }) => (
  <i className={`ri-${icon} ${className || ''}`}></i>
);

const RecentActivities = () => {
  const { data: activities, isLoading, refetch } = useQuery<Activity[]>({
    queryKey: ['/api/activites/recent'],
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card className="border border-gray-100">
      <CardHeader className="px-5 py-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-semibold text-gray-800">Activités récentes</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-gray-600 p-1 h-auto"
          onClick={handleRefresh}
        >
          <RefreshCw size={18} />
        </Button>
      </CardHeader>
      
      <CardContent className="p-5 h-[30rem] overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Chargement des activités...</p>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Aucune activité récente</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities.map((activity, index) => {
                const isLast = index === activities.length - 1;
                const { icon, bgColor } = getActivityIcon(activity.type);
                
                return (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {!isLast && (
                        <span 
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center ring-8 ring-white`}>
                            <RemixIcon icon={icon} className="text-white text-sm" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">{activity.userName || "Système"}</span> a{' '}
                              {activity.description}{' '}
                              <span className="font-medium">{activity.targetName}</span>
                            </p>
                            {activity.metadata?.details && (
                              <p className="mt-1 text-xs text-gray-500">{activity.metadata.details}</p>
                            )}
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-gray-500">
                            <time dateTime={activity.created_at}>
                              {getTimeAgo(activity.created_at)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t border-gray-200 flex justify-center">
        <Link href="/activites">
          <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-800">
            Voir toutes les activités
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentActivities;
