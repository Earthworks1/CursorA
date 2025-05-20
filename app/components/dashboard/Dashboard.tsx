'use client';

import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskList } from '@/components/planning/TaskList';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Dashboard() {
  const { tasks, isLoading } = useTasks();

  const today = new Date();
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.start);
    return taskDate.toDateString() === today.toDateString();
  });

  const upcomingTasks = tasks
    .filter(task => new Date(task.start) > today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  const stats = {
    total: tasks.length,
    today: todayTasks.length,
    upcoming: upcomingTasks.length,
    completed: tasks.filter(t => t.status === 'TERMINE').length,
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches terminées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tâches d'aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={todayTasks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Prochaines tâches</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={upcomingTasks} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 