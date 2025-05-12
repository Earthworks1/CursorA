import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlusCircle, Search, Building2, ArrowUpDown, MapPin, User, Calendar } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Chantier = {
  id: number;
  nom: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  adresse: string;
  responsable: {
    id: number;
    nom: string;
    prenom: string;
  };
  statut: string;
  tachesCount: number;
  tachesTermineesCount: number;
};

const ChantiersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: chantiers, isLoading } = useQuery<Chantier[]>({
    queryKey: ['/api/chantiers'],
  });

  // Fonction pour extraire la ville d'une adresse
  const extractVille = (adresse: string | null): string => {
    if (!adresse) return '';
    
    // Essayons d'extraire un code postal (format français 5 chiffres) suivi d'une ville
    const match = adresse.match(/\b\d{5}\s+([a-zA-ZÀ-ÿ\s\-]+)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Si pas de format code postal, retournons les 2 derniers mots qui pourraient être la ville
    const words = adresse.split(/\s+/);
    if (words.length >= 2) {
      return words.slice(-2).join(' ');
    }
    
    return adresse;
  };

  // Filtrer les chantiers selon la recherche
  const filteredChantiers = React.useMemo(() => {
    if (!chantiers) return [];
    if (!searchTerm.trim()) return chantiers;
    
    const search = searchTerm.toLowerCase().trim();
    return chantiers.filter(
      chantier => 
        chantier.nom.toLowerCase().includes(search) ||
        chantier.description?.toLowerCase().includes(search) ||
        chantier.adresse?.toLowerCase().includes(search) ||
        chantier.responsable?.nom.toLowerCase().includes(search) ||
        chantier.responsable?.prenom.toLowerCase().includes(search)
    );
  }, [chantiers, searchTerm]);
  
  // Trier les chantiers filtrés
  const sortedChantiers = React.useMemo(() => {
    if (!filteredChantiers.length) return [];
    
    return [...filteredChantiers].sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'nom':
          valueA = a.nom;
          valueB = b.nom;
          break;
        case 'ville':
          valueA = extractVille(a.adresse);
          valueB = extractVille(b.adresse);
          break;
        case 'client':
          valueA = a.responsable?.nom || '';
          valueB = b.responsable?.nom || '';
          break;
        case 'date':
          valueA = a.dateDebut || '';
          valueB = b.dateDebut || '';
          break;
        default:
          valueA = a.nom;
          valueB = b.nom;
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredChantiers, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
      case 'termine':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Terminé</Badge>;
      case 'en_pause':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">En pause</Badge>;
      case 'annule':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Chantiers</h1>
          <p className="text-gray-500">
            Gestion des projets et chantiers en cours
          </p>
        </div>
        <Link href="/chantiers/new">
          <Button className="mt-3 sm:mt-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau chantier
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Liste des chantiers</CardTitle>
            <div className="relative w-64">
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
          <div className="flex items-center justify-between mt-4">
            <CardDescription>
              {filteredChantiers.length} chantier{filteredChantiers.length !== 1 ? 's' : ''} trouvé{filteredChantiers.length !== 1 ? 's' : ''}
            </CardDescription>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Trier par:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nom">
                      <div className="flex items-center">
                        <Building2 className="mr-2 h-3.5 w-3.5" />
                        Nom du chantier
                      </div>
                    </SelectItem>
                    <SelectItem value="ville">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-3.5 w-3.5" />
                        Ville
                      </div>
                    </SelectItem>
                    <SelectItem value="client">
                      <div className="flex items-center">
                        <User className="mr-2 h-3.5 w-3.5" />
                        Client
                      </div>
                    </SelectItem>
                    <SelectItem value="date">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-3.5 w-3.5" />
                        Date
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className={`h-3.5 w-3.5 ${sortOrder === 'asc' ? '' : 'rotate-180'}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Tâches</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Chargement des chantiers...
                    </TableCell>
                  </TableRow>
                ) : sortedChantiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Aucun chantier trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedChantiers.map((chantier) => (
                    <TableRow key={chantier.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <Link href={`/chantiers/${chantier.id}`} className="hover:text-primary-600">
                            {chantier.nom}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {chantier.responsable ? (
                          <span>{chantier.responsable.prenom} {chantier.responsable.nom}</span>
                        ) : (
                          <span className="text-gray-400">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-xs text-gray-500">Début: {formatDate(chantier.dateDebut)}</div>
                          <div className="text-xs text-gray-500">Fin: {formatDate(chantier.dateFin)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {chantier.tachesTermineesCount}/{chantier.tachesCount}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary-600 h-1.5 rounded-full" 
                            style={{ 
                              width: `${chantier.tachesCount > 0 
                                ? (chantier.tachesTermineesCount / chantier.tachesCount) * 100 
                                : 0}%` 
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(chantier.statut)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/chantiers/${chantier.id}`}>
                            <Button variant="ghost" size="sm">
                              Détails
                            </Button>
                          </Link>
                          <Link href={`/chantiers/${chantier.id}/edit`}>
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

export default ChantiersPage;
