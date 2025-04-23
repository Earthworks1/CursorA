import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, parseISO, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Charge {
  id: number;
  date: string;
  ressourceId: number;
  ressource: {
    id: number;
    nom: string;
    type: string;
  };
  tacheId: number;
  tache: {
    id: number;
    titre: string;
    statut: string;
  };
  heures: number;
  commentaire?: string;
}

const PlanCharge: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRessource, setSelectedRessource] = useState<string>('all');

  // Fonction pour gérer le changement de mois
  const handlePrevMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  // Requête pour récupérer les données de charge
  const { data: charges, isLoading } = useQuery<Charge[]>({
    queryKey: ['charges', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const response = await fetch(`/api/charges?month=${format(currentDate, 'yyyy-MM')}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des charges');
      }
      return response.json();
    },
  });

  // Requête pour récupérer la liste des ressources
  const { data: ressources } = useQuery<{ id: number; nom: string; type: string }[]>({
    queryKey: ['ressources'],
    queryFn: async () => {
      const response = await fetch('/api/ressources');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des ressources');
      }
      return response.json();
    },
  });

  // Calculer les jours du mois
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Filtrer les charges par ressource sélectionnée
  const filteredCharges = useMemo(() => {
    if (!charges) return [];
    if (selectedRessource === 'all') return charges;
    return charges.filter(charge => charge.ressourceId.toString() === selectedRessource);
  }, [charges, selectedRessource]);

  // Grouper les charges par ressource
  const chargesByRessource = useMemo(() => {
    const grouped = new Map<number, Map<string, Charge[]>>();
    
    filteredCharges.forEach(charge => {
      if (!grouped.has(charge.ressourceId)) {
        grouped.set(charge.ressourceId, new Map());
      }
      
      const ressourceCharges = grouped.get(charge.ressourceId)!;
      const dateKey = format(parseISO(charge.date), 'yyyy-MM-dd');
      
      if (!ressourceCharges.has(dateKey)) {
        ressourceCharges.set(dateKey, []);
      }
      
      ressourceCharges.get(dateKey)!.push(charge);
    });
    
    return grouped;
  }, [filteredCharges]);

  // Calculer le total des heures par ressource
  const totalHoursByRessource = useMemo(() => {
    const totals = new Map<number, number>();
    
    filteredCharges.forEach(charge => {
      const currentTotal = totals.get(charge.ressourceId) || 0;
      totals.set(charge.ressourceId, currentTotal + charge.heures);
    });
    
    return totals;
  }, [filteredCharges]);

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-2">
          <Select
            value={selectedRessource}
            onValueChange={setSelectedRessource}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les ressources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les ressources</SelectItem>
              {ressources?.map(ressource => (
                <SelectItem key={ressource.id} value={ressource.id.toString()}>
                  {ressource.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une charge
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan de charge</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Ressource</TableHead>
                    {daysInMonth.map(day => (
                      <TableHead 
                        key={day.toISOString()} 
                        className={`text-center ${isToday(day) ? 'bg-primary/10' : ''}`}
                      >
                        {format(day, 'd')}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ressources?.map(ressource => (
                    <TableRow key={ressource.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{ressource.nom}</span>
                          <Badge variant="outline" className="w-fit mt-1">
                            {ressource.type}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      {daysInMonth.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayCharges = chargesByRessource.get(ressource.id)?.get(dateKey) || [];
                        const totalHours = dayCharges.reduce((sum, charge) => sum + charge.heures, 0);
                        
                        return (
                          <TableCell 
                            key={day.toISOString()} 
                            className={`text-center ${isToday(day) ? 'bg-primary/10' : ''}`}
                          >
                            {dayCharges.length > 0 ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="cursor-pointer">
                                      <Badge variant={totalHours > 8 ? "destructive" : "default"}>
                                        {totalHours}h
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="space-y-2">
                                      {dayCharges.map(charge => (
                                        <div key={charge.id} className="text-sm">
                                          <div className="font-medium">{charge.tache.titre}</div>
                                          <div>{charge.heures}h</div>
                                          {charge.commentaire && (
                                            <div className="text-xs text-muted-foreground">{charge.commentaire}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      
                      <TableCell className="text-right font-medium">
                        {totalHoursByRessource.get(ressource.id) || 0}h
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanCharge; 