import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PlusCircle, Wrench, Truck, User, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Ressource {
  id: number;
  nom: string;
  type: string;
  statut: string;
  description: string | null;
  cout_horaire: number | null;
  caracteristiques: any;
  created_at: string;
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

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'disponible':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disponible</Badge>;
    case 'indisponible':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Indisponible</Badge>;
    case 'maintenance':
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Maintenance</Badge>;
    default:
      return <Badge variant="outline">{statut}</Badge>;
  }
};

const Ressources: React.FC = () => {
  const { data: ressources = [], isLoading, error } = useQuery({
    queryKey: ['/api/ressources'],
    queryFn: async () => {
      const response = await fetch('/api/ressources');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des ressources');
      }
      return response.json() as Promise<Ressource[]>;
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ressources</h1>
          <p className="text-muted-foreground">
            Gérez les ressources disponibles pour vos chantiers
          </p>
        </div>
        <Link href="/ressources/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle ressource
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Équipements
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ressources.filter(r => r.type === 'equipement').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {ressources.filter(r => r.type === 'equipement' && r.statut === 'disponible').length} disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Véhicules
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ressources.filter(r => r.type === 'vehicule').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {ressources.filter(r => r.type === 'vehicule' && r.statut === 'disponible').length} disponibles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Personnel
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ressources.filter(r => r.type === 'personnel').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {ressources.filter(r => r.type === 'personnel' && r.statut === 'disponible').length} disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des ressources</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center my-12">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2">Chargement des ressources...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-md my-8">
              <p className="font-medium">Erreur lors du chargement des données</p>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          ) : ressources.length === 0 ? (
            <div className="text-center my-12 p-8 bg-gray-50 rounded-lg">
              <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucune ressource</h3>
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore ajouté de ressources à votre système.
              </p>
              <Link href="/ressources/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter une ressource
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Coût horaire</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ressources.map((ressource) => (
                    <TableRow key={ressource.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getTypeIcon(ressource.type)}
                          <span className="ml-2">{ressource.nom}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{ressource.type}</TableCell>
                      <TableCell>{getStatutBadge(ressource.statut)}</TableCell>
                      <TableCell>{ressource.cout_horaire ? `${ressource.cout_horaire} €/h` : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/ressources/${ressource.id}`}>
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">Détails</span>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <span className="sr-only">Supprimer</span>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

export default Ressources;