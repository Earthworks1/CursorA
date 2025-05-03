import React from 'react';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/dashboard/stats-card';
import ChartSection from '@/components/dashboard/chart-section';
import RecentTasks from '@/components/dashboard/recent-tasks';
import RecentActivities from '@/components/dashboard/recent-activities';
import CalendrierEcheances from '@/components/dashboard/CalendrierEcheances';
import { Building2, CalendarCheck2, AlertTriangle, FileText } from 'lucide-react';

type DashboardStats = {
  chantiersActifs: number;
  tachesEnCours: number;
  tachesEnRetard: number;
  revisionsPlans: number;
  chantiersEvolution: number;
  tachesEvolution: number;
  retardsEvolution: number;
  revisionsEvolution: number;
};

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/charge-de-travail/statistiques'],
  });

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Chantiers actifs"
          value={stats?.chantiersActifs || 0}
          change={{
            value: `${stats?.chantiersEvolution || 0}%`,
            positive: (stats?.chantiersEvolution || 0) >= 0
          }}
          period="depuis le mois dernier"
          icon={<Building2 size={20} />}
          iconBgColor="bg-primary-100"
          iconTextColor="text-primary-700"
        />

        <StatsCard
          title="Tâches en cours"
          value={stats?.tachesEnCours || 0}
          change={{
            value: `${stats?.tachesEvolution || 0}%`,
            positive: (stats?.tachesEvolution || 0) >= 0
          }}
          period="depuis la semaine dernière"
          icon={<CalendarCheck2 size={20} />}
          iconBgColor="bg-secondary-100"
          iconTextColor="text-secondary-700"
        />

        <StatsCard
          title="Tâches en retard"
          value={stats?.tachesEnRetard || 0}
          change={{
            value: `${stats?.retardsEvolution || 0}%`,
            positive: (stats?.retardsEvolution || 0) <= 0  // Négatif est positif ici
          }}
          period="depuis la semaine dernière"
          icon={<AlertTriangle size={20} />}
          iconBgColor="bg-red-100"
          iconTextColor="text-red-700"
        />

        <StatsCard
          title="Révisions de plans"
          value={stats?.revisionsPlans || 0}
          change={{
            value: `${stats?.revisionsEvolution || 0}%`,
            positive: (stats?.revisionsEvolution || 0) <= 0  // Négatif est positif ici
          }}
          period="depuis le mois dernier"
          icon={<FileText size={20} />}
          iconBgColor="bg-blue-100"
          iconTextColor="text-blue-700"
        />
      </div>

      {/* Calendrier des échéances */}
      <div className="mb-6">
        <CalendrierEcheances />
      </div>

      {/* Charts Section */}
      <ChartSection />

      {/* Tasks and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTasks />
        <RecentActivities />
      </div>
    </>
  );
};

export default Dashboard;
