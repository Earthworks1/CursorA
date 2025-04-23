import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { format, startOfMonth, endOfMonth, addMonths, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Ressource = {
  id: number;
  nom: string;
  type: string;
  disponibilite: string;
};

type AffectationRessource = {
  id: number;
  ressourceId: number;
  tacheId: number;
  debut: string;
  fin: string;
  quantite: number;
  tache: {
    id: number;
    titre: string;
    chantierId: number;
    lotId: number;
    chantier: {
      nom: string;
    };
  };
};

type DisponibiliteRessource = {
  id: number;
  ressourceId: number;
  debut: string;
  fin: string;
  statut: 'disponible' | 'indisponible';
  motif: string | null;
};

type PlanningItem = {
  ressource: Ressource;
  affectations: AffectationRessource[];
  disponibilites: DisponibiliteRessource[];
};

const PlanningRessources: React.FC = () => {
  const [location, setLocation] = useLocation();
  // Vérifier si l'URL contient un point d'interrogation
  const hasQueryParams = location.includes('?');
  const queryParams = new URLSearchParams(hasQueryParams ? location.split('?')[1] : '');
  const dateParam = queryParams.get('date');
  const initialDate = dateParam ? new Date(dateParam) : new Date();
  
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [filterType, setFilterType] = useState<string>('');
  
  const periodStart = startOfMonth(currentDate);
  const periodEnd = endOfMonth(currentDate);
  
  const { data: planning = [], isLoading } = useQuery<PlanningItem[]>({
    queryKey: ['/api/planning/ressources', format(periodStart, 'yyyy-MM-dd'), format(periodEnd, 'yyyy-MM-dd')],
    enabled: true
  });
  
  const handlePrevMonth = () => {
    const newDate = addMonths(currentDate, -1);
    setCurrentDate(newDate);
    const newParams = new URLSearchParams();
    newParams.set('date', newDate.toISOString());
    setLocation(`/ressources/planning?${newParams.toString()}`);
  };
  
  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    const newParams = new URLSearchParams();
    newParams.set('date', newDate.toISOString());
    setLocation(`/ressources/planning?${newParams.toString()}`);
  };
  
  // Filtrer les ressources par type
  const filteredPlanning = React.useMemo(() => {
    if (!planning || !Array.isArray(planning)) return [];
    
    if (!filterType || filterType === 'all') return planning;
    
    return planning.filter((item: PlanningItem) => item.ressource.type === filterType);
  }, [planning, filterType]);
  
  // Extraire la liste des types de ressources uniques
  const ressourceTypes = React.useMemo(() => {
    if (!planning || !Array.isArray(planning)) return [];
    
    const types = new Set<string>();
    planning.forEach((item: PlanningItem) => {
      types.add(item.ressource.type);
    });
    
    return Array.from(types);
  }, [planning]);
  
  // Rendu des affectations pour une ressource
  const renderAffectations = (affectations: AffectationRessource[]) => {
    if (affectations.length === 0) return <div className="text-gray-500 italic">Aucune affectation</div>;
    
    return (
      <div className="space-y-2 mt-2">
        {affectations.map(aff => (
          <div key={aff.id} className="bg-blue-50 border border-blue-200 p-2 rounded">
            <div className="font-medium">{aff.tache.titre}</div>
            <div className="text-xs text-gray-500">
              {aff.tache.chantier.nom} | {format(parseISO(aff.debut), 'dd/MM/yyyy')} - {format(parseISO(aff.fin), 'dd/MM/yyyy')}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Rendu des disponibilités pour une ressource
  const renderDisponibilites = (disponibilites: DisponibiliteRessource[]) => {
    if (disponibilites.length === 0) return <div className="text-gray-500 italic">Pas de période spécifique</div>;
    
    return (
      <div className="space-y-2 mt-2">
        {disponibilites.map(dispo => (
          <div 
            key={dispo.id} 
            className={`p-2 rounded border ${
              dispo.statut === 'disponible' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="font-medium">
              {dispo.statut === 'disponible' ? 'Disponible' : 'Indisponible'}
            </div>
            <div className="text-xs text-gray-500">
              {format(parseISO(dispo.debut), 'dd/MM/yyyy')} - {format(parseISO(dispo.fin), 'dd/MM/yyyy')}
            </div>
            {dispo.motif && <div className="text-xs mt-1">{dispo.motif}</div>}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <PageTitle
        title="Planning des ressources"
        description="Suivez et gérez les affectations des ressources sur les chantiers"
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="mx-2 min-w-[180px] text-center">
            <span className="text-lg font-medium capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {ressourceTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'calendar' | 'list')}>
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendrier
              </TabsTrigger>
              <TabsTrigger value="list">
                Liste
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {isLoading ? (
        // Squelette de chargement
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlanning.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">Aucune ressource à afficher.</p>
            <p className="text-sm text-gray-400 mt-1">
              {filterType ? 'Essayez un autre filtre ou' : 'Commencez par'} ajouter des ressources et définir leurs disponibilités.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.href = '/ressources/new'}
            >
              Ajouter une ressource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          <TabsContent value="calendar" className="m-0">
            <div className="text-center p-8 text-gray-500 border rounded-md bg-gray-50">
              <p>Vue calendrier en cours de développement</p>
              <p className="text-sm mt-2">Utilisez la vue Liste pour le moment</p>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="m-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlanning.map((item: PlanningItem) => (
                <Card key={item.ressource.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{item.ressource.nom}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {item.ressource.type}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h3 className="font-medium text-sm mb-2">Affectations</h3>
                      {renderAffectations(item.affectations)}
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium text-sm mb-2">Disponibilités</h3>
                      {renderDisponibilites(item.disponibilites)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      )}
    </div>
  );
};

export default PlanningRessources;