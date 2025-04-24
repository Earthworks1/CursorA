import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

type Activity = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  project: {
    name: string;
  };
};

const RecentActivities: React.FC = () => {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/workload/activities'],
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Activités récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>
                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium">{activity.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.description} sur {activity.project.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
