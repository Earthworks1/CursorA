import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PlanningCalendar from '@/components/planning/PlanningCalendar';
import Gantt from '@/components/Gantt';
import Heatmap from '@/components/Heatmap';
import PlanCharge from '@/components/planning/PlanCharge';

// Types simplifiés pour l'exemple
interface Task {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId?: string;
  type: string;
  status: string;
}
interface Resource {
  id: string;
  title: string;
  type: string;
}

const PlanningPage: React.FC = () => {
  // États pour les données (à remplacer par des hooks/API réels)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Exemple de chargement de données (à remplacer par fetch/API)
    setLoading(true);
    Promise.all([
      fetch('/api/planning/tasks').then(res => res.json()),
      fetch('/api/planning/ressources').then(res => res.json()),
    ]).then(([tasksData, resourcesData]) => {
      setTasks(tasksData.map((t: any) => ({
        ...t,
        start: t.startTime ? new Date(t.startTime) : new Date(),
        end: t.endTime ? new Date(t.endTime) : new Date(),
      })));
      setResources(resourcesData.map((r: any) => ({
        id: r.id?.toString() ?? '',
        title: r.nom || r.title || '',
        type: r.type || '',
      })));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Chargement du planning...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Planification</h1>
      <Tabs defaultValue="calendrier">
        <TabsList className="mb-4">
          <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="charge">Charge</TabsTrigger>
        </TabsList>
        <TabsContent value="calendrier">
          <PlanningCalendar events={tasks} resources={resources} />
        </TabsContent>
        <TabsContent value="gantt">
          <Gantt tasks={tasks} />
        </TabsContent>
        <TabsContent value="heatmap">
          <Heatmap
            tasks={tasks}
            startDate={new Date()}
            endDate={(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })()}
            onCellClick={() => {}}
          />
        </TabsContent>
        <TabsContent value="charge">
          <PlanCharge />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningPage; 