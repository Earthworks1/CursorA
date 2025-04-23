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

type Tache = {
  id: number;
  titre: string;
  chantierNom: string;
  statut: string;
  dateLimite: string;
  progression: number;
};

const RecentTasks = () => {
  const { data: taches, isLoading } = useQuery<Tache[]>({
    queryKey: ['/api/taches/recent'],
  });

  const [selectedChantier, setSelectedChantier] = React.useState('tous');

  // Filtrer les tâches par chantier si nécessaire
  const filteredTaches = React.useMemo(() => {
    if (!taches) return [];
    if (selectedChantier === 'tous') return taches;
    return taches.filter(tache => tache.chantierNom === selectedChantier);
  }, [taches, selectedChantier]);

  // Liste des chantiers uniques pour le sélecteur
  const chantiers = React.useMemo(() => {
    if (!taches) return [];
    const chantiersSet = new Set(taches.map(tache => tache.chantierNom));
    return Array.from(chantiersSet);
  }, [taches]);

  return (
    <Card className="lg:col-span-2 border border-gray-100">
      <CardHeader className="px-5 py-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-semibold text-gray-800">Tâches récentes</CardTitle>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Select value={selectedChantier} onValueChange={setSelectedChantier}>
              <SelectTrigger className="bg-gray-50 border border-gray-200 text-sm h-9 w-48">
                <SelectValue placeholder="Tous les chantiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les chantiers</SelectItem>
                {chantiers.map(chantier => (
                  <SelectItem key={chantier} value={chantier}>
                    {chantier}
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
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tâche</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Chantier</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Chargement des tâches...
                </TableCell>
              </TableRow>
            ) : filteredTaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  Aucune tâche à afficher
                </TableCell>
              </TableRow>
            ) : (
              filteredTaches.map((tache) => (
                <TableRow key={tache.id} className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        <Link href={`/taches/${tache.id}`} className="hover:text-primary-600">
                          {tache.titre}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tache.chantierNom}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={tache.statut} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    {isDatePassed(tache.dateLimite) ? (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1 text-red-500" />
                        <span className="text-red-600 font-medium">{formatDate(tache.dateLimite)}</span>
                      </div>
                    ) : (
                      <span>{formatDate(tache.dateLimite)}</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-gray-500">
                    <ProgressWithText value={tache.progression} status={tache.statut} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <CardFooter className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
        <Link href="/taches/new">
          <Button className="bg-primary-800 hover:bg-primary-700">
            Nouvelle tâche
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentTasks;
