import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CheckSquare, PlusCircle, Search, FilterX } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import StatusBadge from '@/components/ui/status-badge';
import ProgressWithText from '@/components/ui/progress-with-text';
import { formatDate, isDatePassed } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { StatutTache, TypeTache } from '@/types/schema';

type Tache = {
  id: number;
  titre: string;
  chantierId: number;
  chantierNom: string;
  type: string;
  statut: string;
  progression: number;
  dateDebut: string;
  dateLimite: string;
  pilote: { id: number; nom: string; prenom: string } | null;
  intervenant: { id: number; nom: string; prenom: string } | null;
  intervenants: {
    userId: number;
    nom: string;
    prenom: string;
  }[];
};

const TachesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [typeFilter, setTypeFilter] = useState('tous');
  const [chantierFilter, setChantierFilter] = useState('tous');

  const { data: taches, isLoading } = useQuery<Tache[]>({
    queryKey: ['/api/taches'],
  });

  const { data: chantiers } = useQuery<{ id: number; nom: string }[]>({
    queryKey: ['/api/chantiers/list'],
  });

  const filteredTaches = React.useMemo(() => {
    if (!taches) return [];
    
    return taches.filter(tache => {
      // Filtre par recherche
      const matchesSearch = !searchTerm.trim() || 
        tache.titre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tache.chantierNom.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par statut
      const matchesStatus = statusFilter === 'tous' || tache.statut === statusFilter;
      
      // Filtre par type
      const matchesType = typeFilter === 'tous' || tache.type === typeFilter;
      
      // Filtre par chantier
      const matchesChantier = chantierFilter === 'tous' || tache.chantierId.toString() === chantierFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesChantier;
    });
  }, [taches, searchTerm, statusFilter, typeFilter, chantierFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('tous');
    setTypeFilter('tous');
    setChantierFilter('tous');
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Tâches</h1>
          <p className="text-gray-500">
            Gestion et suivi des tâches
          </p>
        </div>
        <Link href="/taches/new">
          <Button className="mt-3 sm:mt-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle tâche
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle className="text-lg font-semibold">Liste des tâches</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value={StatutTache.A_FAIRE}>À faire</SelectItem>
                  <SelectItem value={StatutTache.EN_COURS}>En cours</SelectItem>
                  <SelectItem value={StatutTache.EN_VALIDATION}>En validation</SelectItem>
                  <SelectItem value={StatutTache.TERMINE}>Terminé</SelectItem>
                  <SelectItem value={StatutTache.EN_RETARD}>En retard</SelectItem>
                  <SelectItem value={StatutTache.EN_REVISION}>En révision</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les types</SelectItem>
                  <SelectItem value={TypeTache.ETUDE}>Étude</SelectItem>
                  <SelectItem value={TypeTache.CONCEPTION}>Conception</SelectItem>
                  <SelectItem value={TypeTache.EXECUTION}>Exécution</SelectItem>
                  <SelectItem value={TypeTache.VALIDATION}>Validation</SelectItem>
                  <SelectItem value={TypeTache.REVISION}>Révision</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={chantierFilter} onValueChange={setChantierFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Chantier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les chantiers</SelectItem>
                  {chantiers?.map(chantier => (
                    <SelectItem key={chantier.id} value={chantier.id.toString()}>
                      {chantier.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchTerm || statusFilter !== 'tous' || typeFilter !== 'tous' || chantierFilter !== 'tous') && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500" 
                onClick={resetFilters}
              >
                <FilterX className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
          
          <CardDescription className="mt-2">
            {filteredTaches.length} tâche{filteredTaches.length !== 1 ? 's' : ''} trouvée{filteredTaches.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tâche</TableHead>
                  <TableHead>Chantier</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Pilote et Intervenants</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      Chargement des tâches...
                    </TableCell>
                  </TableRow>
                ) : filteredTaches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      Aucune tâche ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTaches.map((tache) => (
                    <TableRow key={tache.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="h-4 w-4 text-gray-400" />
                          <Link href={`/taches/${tache.id}`} className="hover:text-primary-600">
                            {tache.titre}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>{tache.chantierNom}</TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{tache.type}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tache.statut} />
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {/* Pilote (avec border spéciale) */}
                          {tache.pilote && (
                            <div
                              className="h-7 w-7 rounded-full bg-primary-50 border-2 border-primary-200 flex items-center justify-center text-xs font-medium text-primary-700 z-30"
                              title={`Pilote: ${tache.pilote.prenom} ${tache.pilote.nom}`}
                            >
                              {tache.pilote.prenom.charAt(0)}{tache.pilote.nom.charAt(0)}
                            </div>
                          )}
                          
                          {/* Intervenant principal */}
                          {tache.intervenant && (
                            <div
                              className="h-7 w-7 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-xs font-medium z-20"
                              title={`Intervenant principal: ${tache.intervenant.prenom} ${tache.intervenant.nom}`}
                            >
                              {tache.intervenant.prenom.charAt(0)}{tache.intervenant.nom.charAt(0)}
                            </div>
                          )}
                          
                          {/* Autres intervenants */}
                          {tache.intervenants.slice(0, 2).map((intervenant, i) => (
                            <div
                              key={i}
                              className="h-7 w-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium z-10"
                              title={`${intervenant.prenom} ${intervenant.nom}`}
                            >
                              {intervenant.prenom.charAt(0)}{intervenant.nom.charAt(0)}
                            </div>
                          ))}
                          
                          {/* Indicateur de nombre supplémentaire */}
                          {tache.intervenants.length > 2 && (
                            <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">
                              +{tache.intervenants.length - 2}
                            </div>
                          )}
                          
                          {/* Message si aucun intervenant */}
                          {!tache.pilote && !tache.intervenant && tache.intervenants.length === 0 && (
                            <span className="text-xs text-gray-500">Non assigné</span>
                          )}
                        </div>
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
                      <TableCell>
                        <ProgressWithText value={tache.progression} status={tache.statut} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/taches/${tache.id}`}>
                            <Button variant="ghost" size="sm">
                              Détails
                            </Button>
                          </Link>
                          <Link href={`/taches/${tache.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Modifier
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TachesPage;
