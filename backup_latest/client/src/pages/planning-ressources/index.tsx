import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Truck, Wrench, User, AlertCircle, CheckCircle } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { format, addDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface PlanningItem {
  type: 'affectation' | 'disponibilite';
  id: number;
  debut: string;
  fin: string;
  ressourceId: number;
  ressource: {
    id: number;
    nom: string;
    type: string;
    statut: string;
  };
  tacheId?: number;
  tache?: {
    id: number;
    titre: string;
    statut: string;
  };
  statut?: string;
  quantite?: number;
  commentaire: string | null;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'personnel':
      return <User className="w-5 h-5 text-blue-500" />;
    case 'equipement':
      return <Wrench className="w-5 h-5 text-orange-500" />;
    case 'vehicule':
      return <Truck className="w-5 h-5 text-green-500" />;
    default:
      return <Wrench className="w-5 h-5 text-gray-500" />;
  }
};

const getStatutIcon = (statut: string) => {
  switch (statut) {
    case 'maintenance':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'indisponible':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'disponible':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    default:
      return null;
  }
};

const PlanningRessources: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };
  
  const [typeFilter, setTypeFilter] = useState<string>("tous");
  
  const { data: planningItems = [], isLoading, error } = useQuery({
    queryKey: ['/api/planning/ressources', dateRange.from?.toISOString(), dateRange.to?.toISOString()],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return [];
      
      const params = new URLSearchParams({
        debut: dateRange.from.toISOString(),
        fin: dateRange.to.toISOString()
      });
      
      const response = await fetch(`/api/planning/ressources?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du planning');
      }
      return response.json() as Promise<PlanningItem[]>;
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });
  
  const filteredItems = typeFilter === "tous" 
    ? planningItems 
    : planningItems.filter(item => item.ressource.type === typeFilter);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planning des Ressources</h1>
          <p className="text-muted-foreground">
            Visualisez et gérez l'utilisation des ressources sur vos chantiers
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Nouvelle affectation
        </Button>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row justify-between mb-6">
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Période</CardTitle>
            <CardDescription>Sélectionnez la période à afficher</CardDescription>
          </CardHeader>
          <CardContent>
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              locale={fr}
              calendarClassName="rounded-md border shadow"
            />
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Filtres</CardTitle>
            <CardDescription>Filtrer par type de ressource</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les types</SelectItem>
                <SelectItem value="personnel">Personnel</SelectItem>
                <SelectItem value="equipement">Équipement</SelectItem>
                <SelectItem value="vehicule">Véhicule</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      {isLoading ? (
        <div className="text-center my-12">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Chargement du planning...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md my-8">
          <p className="font-medium">Erreur lors du chargement des données</p>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center my-12 p-8 bg-gray-50 rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucune données pour cette période</h3>
          <p className="text-gray-500">
            Aucune affectation ou disponibilité n'a été trouvée pour la période sélectionnée.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <Card key={`${item.type}-${item.id}`} className={`
              ${item.type === 'affectation' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-amber-500'}
            `}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(item.ressource.type)}
                    <div>
                      <h3 className="font-medium text-lg">{item.ressource.nom}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{item.ressource.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.type === 'affectation' && item.tache && (
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {item.tache.titre}
                      </div>
                    )}
                    {item.type === 'disponibilite' && item.statut && (
                      <div className="flex items-center gap-1">
                        {getStatutIcon(item.statut)}
                        <span className="text-sm font-medium capitalize">
                          {item.statut}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {format(parseISO(item.debut), 'dd MMM yyyy', {locale: fr})} - {format(parseISO(item.fin), 'dd MMM yyyy', {locale: fr})}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.ceil((new Date(item.fin).getTime() - new Date(item.debut).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </div>
                  </div>
                </div>
                
                {item.commentaire && (
                  <div className="mt-3 text-sm border-t pt-3">
                    {item.commentaire}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanningRessources;