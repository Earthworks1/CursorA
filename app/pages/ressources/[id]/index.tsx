import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Edit, Wrench, Truck, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RessourceProps {
  id: string;
}

interface RessourceDetail {
  id: number;
  nom: string;
  type: string;
  statut: string;
  description: string | null;
  cout_horaire: number | null;
  caracteristiques: any;
  created_at: string;
  affectations: Affectation[];
  disponibilites: Disponibilite[];
}

interface Affectation {
  id: number;
  ressourceId: number;
  tacheId: number;
  periodeDebut: string;
  periodeFin: string;
  quantite: number | null;
  commentaire: string | null;
  tache?: {
    id: number;
    titre: string;
    statut: string;
  };
}

interface Disponibilite {
  id: number;
  ressourceId: number;
  statut: string;
  date_debut: string;
  date_fin: string;
  commentaire: string | null;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'personnel':
      return <User className="w-6 h-6 text-blue-500" />;
    case 'equipement':
      return <Wrench className="w-6 h-6 text-orange-500" />;
    case 'vehicule':
      return <Truck className="w-6 h-6 text-green-500" />;
    default:
      return <Wrench className="w-6 h-6 text-gray-500" />;
  }
};

const getStatutBadge = (statut: string) => {
  switch (statut) {
    case 'disponible':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Disponible</Badge>;
    case 'indisponible':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Indisponible</Badge>;
    case 'maintenance':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1"><Clock className="w-3 h-3" /> Maintenance</Badge>;
    default:
      return <Badge>{statut}</Badge>;
  }
};

const DetailRessource: React.FC<RessourceProps> = ({ id }) => {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('informations');

  const { data: ressource, isLoading, error } = useQuery({
    queryKey: [`/api/ressources/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/ressources/${id}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails de la ressource');
      }
      return response.json() as Promise<RessourceDetail>;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center my-12">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !ressource) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 text-red-800 p-4 rounded-md my-8">
          <p className="font-medium">Erreur lors du chargement des données</p>
          <p className="text-sm">{(error as Error)?.message || 'Ressource non trouvée'}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => navigate('/ressources')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 flex items-center text-muted-foreground" 
        onClick={() => navigate('/ressources')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour à la liste
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {getTypeIcon(ressource.type)}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{ressource.nom}</h1>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground capitalize">{ressource.type}</span>
              {getStatutBadge(ressource.statut)}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/ressources/${ressource.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="informations" className="w-full">
        <TabsList>
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="taches">Tâches</TabsTrigger>
        </TabsList>
        <TabsContent value="informations">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la ressource</CardTitle>
            </CardHeader>
            <CardContent>
              {ressource.description && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{ressource.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Type</h3>
                  <p className="text-muted-foreground capitalize">{ressource.type}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Statut actuel</h3>
                  <p className="text-muted-foreground">{getStatutBadge(ressource.statut)}</p>
                </div>
                
                {ressource.cout_horaire !== null && (
                  <div>
                    <h3 className="font-medium mb-2">Coût horaire</h3>
                    <p className="text-muted-foreground">{ressource.cout_horaire} €/h</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-2">Date d'ajout</h3>
                  <p className="text-muted-foreground">
                    {format(parseISO(ressource.created_at), 'dd MMMM yyyy', {locale: fr})}
                  </p>
                </div>
              </div>
              
              {(ressource.type === 'equipement' || ressource.type === 'vehicule') && 
              ressource.caracteristiques && Object.keys(ressource.caracteristiques).length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="font-medium mb-4">Caractéristiques techniques</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ressource.caracteristiques.marque && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Marque</h4>
                          <p className="text-muted-foreground">{ressource.caracteristiques.marque}</p>
                        </div>
                      )}
                      
                      {ressource.caracteristiques.modele && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Modèle</h4>
                          <p className="text-muted-foreground">{ressource.caracteristiques.modele}</p>
                        </div>
                      )}
                      
                      {ressource.caracteristiques.annee && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Année</h4>
                          <p className="text-muted-foreground">{ressource.caracteristiques.annee}</p>
                        </div>
                      )}
                      
                      {ressource.type === 'vehicule' && ressource.caracteristiques.immatriculation && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Immatriculation</h4>
                          <p className="text-muted-foreground">{ressource.caracteristiques.immatriculation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="taches">
          <Card>
            <CardHeader>
              <CardTitle>Tâches assignées</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Contenu des tâches */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailRessource;