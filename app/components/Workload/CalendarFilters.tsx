import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskType, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface CalendarFiltersProps {
  onFilterChange: (filters: CalendarFilters) => void;
  className?: string;
}

export interface CalendarFilters {
  search: string;
  type: TaskType | 'ALL';
  status: TaskStatus | 'ALL';
  assignedTo: string | 'ALL';
  dateRange: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';
}

const defaultFilters: CalendarFilters = {
  search: '',
  type: 'ALL',
  status: 'ALL',
  assignedTo: 'ALL',
  dateRange: 'WEEK',
};

export function CalendarFilters({ onFilterChange, className }: CalendarFiltersProps) {
  const [filters, setFilters] = React.useState<CalendarFilters>(defaultFilters);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false);

  const handleFilterChange = (key: keyof CalendarFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Recherche</label>
        <Input
          placeholder="Rechercher une tâche..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type de tâche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les types</SelectItem>
            <SelectItem value="etude">Étude</SelectItem>
            <SelectItem value="leve">Levé</SelectItem>
            <SelectItem value="implantation">Implantation</SelectItem>
            <SelectItem value="recolement">Récolement</SelectItem>
            <SelectItem value="dao">DAO</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Statut</label>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="planifie">Planifié</SelectItem>
            <SelectItem value="en_cours">En cours</SelectItem>
            <SelectItem value="termine">Terminé</SelectItem>
            <SelectItem value="annule">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">Période</label>
        <Select
          value={filters.dateRange}
          onValueChange={(value) => handleFilterChange('dateRange', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAY">Aujourd'hui</SelectItem>
            <SelectItem value="WEEK">Cette semaine</SelectItem>
            <SelectItem value="MONTH">Ce mois</SelectItem>
            <SelectItem value="ALL">Toutes les périodes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={clearFilters}
      >
        <X className="h-4 w-4 mr-2" />
        Réinitialiser les filtres
      </Button>
    </div>
  );

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Version desktop */}
      <div className="hidden md:block">
        <FilterContent />
      </div>

      {/* Version mobile */}
      <div className="md:hidden">
        <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
} 