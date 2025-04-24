import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import StatusBadge from '@/components/ui/status-badge';
import ProgressWithText from '@/components/ui/progress-with-text';
import { formatDate, isDatePassed } from '@/lib/utils';
import { Clock } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  projectName: string;
  status: string;
  dueDate: string;
  progress: number;
};

const RecentTasks = () => {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/workload/tasks'],
  });

  const [selectedProject, setSelectedProject] = React.useState('tous');

  // Filtrer les tâches par projet si nécessaire
  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    if (selectedProject === 'tous') return tasks;
    return tasks.filter(task => task.projectName === selectedProject);
  }, [tasks, selectedProject]);

  // Liste des projets uniques pour le sélecteur
  const projects = React.useMemo(() => {
    if (!tasks) return [];
    const projectsSet = new Set(tasks.map(task => task.projectName));
    return Array.from(projectsSet);
  }, [tasks]);

  return (
    <Card className="lg:col-span-2 border border-gray-100">
      <CardHeader className="px-5 py-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-semibold text-gray-800">Tâches récentes</CardTitle>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 text-sm h-9 w-48">
                <SelectValue placeholder="Tous les projets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les projets</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Link href="/taches">
            <Button variant="link" className="text-primary-600 text-sm font-medium hover:text-primary-800">
              Voir tout
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">Titre</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Progression</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Chargement des tâches...
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Aucune tâche à afficher
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        <Link href={`/taches/${task.id}`} className="hover:text-primary-600">
                          {task.title}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-900">{task.projectName}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {isDatePassed(task.dueDate) ? (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-red-500" />
                        <span className="text-red-600 font-medium">{formatDate(task.dueDate)}</span>
                      </div>
                    ) : (
                      <span>{formatDate(task.dueDate)}</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <ProgressWithText value={task.progress} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentTasks;
