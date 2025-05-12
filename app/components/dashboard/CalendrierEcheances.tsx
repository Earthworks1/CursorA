import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fr } from 'date-fns/locale';
import { format, isSameDay, isAfter, isBefore, addMonths } from 'date-fns';
import { Calendar } from '../../components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useLocation } from 'wouter';
import { ChevronLeft, ChevronRight, CalendarIcon, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';

// Styles personnalisés pour les éléments du calendrier
const priorityColors = {
  basse: 'bg-blue-100 border-blue-300',
  normale: 'bg-green-100 border-green-300',
  haute: 'bg-orange-100 border-orange-300',
  urgente: 'bg-red-100 border-red-300',
};

const statutIcons = {
  "a_faire": "🔵",
  "en_cours": "🟠",
  "en_validation": "🟡",
  "termine": "✅",
  "en_revision": "🟣",
  "en_retard": "⛔",
};

interface Tache {
  id: number;
  titre: string;
  priorite: string;
  statut: string;
  dateDebut?: string;
  dateLimite?: string;
  lotId?: number;
  lotNom?: string;
  chantierId?: number;
  chantierNom?: string;
}

const CalendrierEcheances: React.FC = () => {
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  
  // Récupération des tâches
  const { data: taches = [] } = useQuery<Tache[]>({
    queryKey: ['/api/taches'],
  });

  // Filtrer les tâches qui ont une date limite définie
  const tachesAvecEcheance = taches.filter(tache => tache.dateLimite);

  // Obtenir les tâches pour le jour sélectionné
  const getTachesForDay = (day: Date) => {
    return tachesAvecEcheance.filter(tache => {
      const dateLimite = tache.dateLimite ? new Date(tache.dateLimite) : null;
      return dateLimite && isSameDay(dateLimite, day);
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Création d'un tableau de dates avec des tâches (pour les points sur le calendrier)
  const datesWithTasks = tachesAvecEcheance
    .filter(tache => tache.dateLimite)
    .map(tache => new Date(tache.dateLimite!));
    
  // Dates avec des tâches en retard
  const now = new Date();
  const datesWithLateTasks = tachesAvecEcheance
    .filter(tache => 
      tache.dateLimite && 
      tache.statut !== "termine" && 
      isBefore(new Date(tache.dateLimite), now)
    )
    .map(tache => new Date(tache.dateLimite!));

  // Obtenir les tâches pour le jour sélectionné
  const tachesForSelectedDay = selectedDay ? getTachesForDay(selectedDay) : [];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Calendrier des échéances
          </CardTitle>
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Visualisez les tâches à venir et leurs dates limites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="col-span-1 lg:col-span-5">
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={setSelectedDay}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={fr}
                className="w-full"
              />
              
              <div className="mt-4 pt-3 border-t flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
                    {datesWithTasks.length}
                  </Badge>
                  <span>Tâches planifiées</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="destructive">
                    {datesWithLateTasks.length}
                  </Badge>
                  <span>Tâches en retard</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-2">
            <div className="border rounded-md p-3 h-full">
              <div className="font-medium mb-2">
                {selectedDay 
                  ? `Tâches du ${format(selectedDay, 'dd MMMM yyyy', { locale: fr })}`
                  : "Sélectionnez une date pour voir les tâches"
                }
              </div>
              
              {selectedDay && tachesForSelectedDay.length === 0 && (
                <div className="text-gray-500 italic py-4 text-center">
                  Aucune tâche prévue pour cette date
                </div>
              )}
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tachesForSelectedDay.map((tache) => {
                  const isLate = tache.dateLimite && isAfter(new Date(), new Date(tache.dateLimite)) && tache.statut !== "termine";
                  
                  return (
                    <div 
                      key={tache.id}
                      onClick={() => navigate(`/taches/${tache.id}`)}
                      className={`p-2 border rounded-md cursor-pointer transition-colors hover:bg-gray-50 ${
                        priorityColors[tache.priorite as keyof typeof priorityColors] || 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate flex-1">{tache.titre}</div>
                        <span title={tache.statut}>
                          {statutIcons[tache.statut as keyof typeof statutIcons] || "🔶"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        {tache.chantierNom || tache.lotNom || "Sans projet"}
                      </div>
                      {isLate && (
                        <div className="flex items-center text-red-600 text-xs mt-1">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          En retard
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendrierEcheances;