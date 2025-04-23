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
  const [activeTab, setActiveTab] = useState('infos');

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
          <Button variant="outline" onClick={() => navigate(`/planning-ressources?ressource=${ressource.id}`)}>
            <Calendar className="mr-2 h-4 w-4" />
            Voir le planning
          </Button>
          <Button onClick={() => navigate(`/ressources/${ressource.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="infos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Détails de la ressource</CardTitle>
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
            
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Utilisation</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div>
                    <span className="text-2xl font-bold">
                      {ressource.affectations?.length || 0}
                    </span>
                    <p className="text-sm text-muted-foreground">Affectations totales</p>
                  </div>
                  
                  <div>
                    <span className="text-2xl font-bold">
                      {ressource.affectations?.filter(a => 
                        new Date(a.periodeFin) >= new Date() && 
                        new Date(a.periodeDebut) <= new Date()
                      ).length || 0}
                    </span>
                    <p className="text-sm text-muted-foreground">Affectations en cours</p>
                  </div>
                  
                  <div>
                    <span className="text-2xl font-bold">
                      {ressource.disponibilites?.length || 0}
                    </span>
                    <p className="text-sm text-muted-foreground">Périodes d'indisponibilité</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setActiveTab('planning')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir le planning
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>Planning de la ressource</CardTitle>
              <CardDescription>
                Périodes d'affectation et d'indisponibilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(!ressource.affectations || ressource.affectations.length === 0) && 
               (!ressource.disponibilites || ressource.disponibilites.length === 0) ? (
                <div className="text-center my-8 p-6 bg-gray-50 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune affectation</h3>
                  <p className="text-gray-500 mb-4">
                    Cette ressource n'a pas encore d'affectations ou de périodes d'indisponibilité.
                  </p>
                  <Button onClick={() => navigate('/planning-ressources')}>
                    Gérer le planning
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Affectations</h3>
                  
                  {(!ressource.affectations || ressource.affectations.length === 0) ? (
                    <p className="text-muted-foreground">Aucune affectation pour cette ressource</p>
                  ) : (
                    <div className="space-y-4">
                      {ressource.affectations.map(affectation => (
                        <Card key={affectation.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div>
                                {affectation.tache && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {affectation.tache.titre}
                                    </span>
                                    <Badge variant="outline">
                                      {affectation.tache.statut}
                                    </Badge>
                                  </div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {affectation.commentaire || 'Pas de commentaire'}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-medium">
                                  {format(parseISO(affectation.periodeDebut), 'dd MMM yyyy', {locale: fr})} - {format(parseISO(affectation.periodeFin), 'dd MMM yyyy', {locale: fr})}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Math.ceil((new Date(affectation.periodeFin).getTime() - new Date(affectation.periodeDebut).getTime()) / (1000 * 60 * 60 * 24))} jours
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Périodes d'indisponibilité</h3>
                  
                  {(!ressource.disponibilites || ressource.disponibilites.length === 0) ? (
                    <p className="text-muted-foreground">Aucune période d'indisponibilité pour cette ressource</p>
                  ) : (
                    <div className="space-y-4">
                      {ressource.disponibilites.map(disponibilite => (
                        <Card key={disponibilite.id} className={`
                          border-l-4 ${disponibilite.statut === 'maintenance' ? 'border-l-amber-500' : 'border-l-red-500'}
                        `}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatutBadge(disponibilite.statut)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {disponibilite.commentaire || 'Pas de commentaire'}
                                </p>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-medium">
                                  {format(parseISO(disponibilite.date_debut), 'dd MMM yyyy', {locale: fr})} - {format(parseISO(disponibilite.date_fin), 'dd MMM yyyy', {locale: fr})}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {Math.ceil((new Date(disponibilite.date_fin).getTime() - new Date(disponibilite.date_debut).getTime()) / (1000 * 60 * 60 * 24))} jours
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailRessource;