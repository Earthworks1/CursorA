import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  CheckSquare, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Plus,
  PlusCircle,
  Package,
  User2,
  UserPlus, 
  X,
  Loader2 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageTitle } from '@/components/ui/page-title';
import { formatDate } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TypeLot } from '@/types/schema';

type Pilote = {
  id: number;
  userId: number;
  lotId: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
};

type Lot = {
  id: number;
  nom: string;
  type: string;
  description: string | null;
  chantierId: number;
  created_at: string;
  pilotes: Pilote[];
  tachesCount: number;
  tachesTermineesCount: number;
};

type Chantier = {
  id: number;
  nom: string;
  description: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  adresse: string | null;
  responsable: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  statut: string;
  taches: {
    id: number;
    titre: string;
    statut: string;
    progression: number;
    dateLimite: string | null;
  }[];
  created_at: string;
};

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

interface ChantierDetailProps {
  id: string;
}

export default function ChantierDetail({ id }: ChantierDetailProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewLotDialogOpen, setIsNewLotDialogOpen] = useState(false);
  const [lotForm, setLotForm] = useState({
    nom: '',
    type: 'structure',
    description: ''
  });
  
  const { data: chantier, isLoading, error } = useQuery<Chantier>({
    queryKey: [`/api/chantiers/${id}`],
  });
  
  const { data: lots = [], isLoading: isLoadingLots } = useQuery<Lot[]>({
    queryKey: [`/api/chantiers/${id}/lots`],
    enabled: !!id
  });
  
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: !!id
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/chantiers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Chantier supprimé',
        description: 'Le chantier a été supprimé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chantiers'] });
      navigate('/chantiers');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du chantier',
        variant: 'destructive',
      });
      console.error('Erreur de suppression de chantier:', error);
    },
  });
  
  // Mutation pour créer un nouveau lot
  const createLotMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/chantiers/${id}/lots`, 'POST', data);
    },
    onSuccess: async () => {
      toast({
        title: 'Lot créé',
        description: 'Le lot a été créé avec succès',
      });
      setIsNewLotDialogOpen(false);
      setLotForm({ nom: '', type: 'structure', description: '' });
      queryClient.invalidateQueries({ queryKey: [`/api/chantiers/${id}/lots`] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du lot',
        variant: 'destructive',
      });
      console.error('Erreur de création de lot:', error);
    },
  });
  
  // Mutation pour supprimer un lot
  const deleteLotMutation = useMutation({
    mutationFn: async (lotId: number) => {
      return await apiRequest(`/api/lots/${lotId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Lot supprimé',
        description: 'Le lot a été supprimé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/chantiers/${id}/lots`] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la suppression du lot',
        variant: 'destructive',
      });
      console.error('Erreur de suppression de lot:', error);
    },
  });
  
  // Mutation pour ajouter un pilote à un lot
  const addPiloteMutation = useMutation({
    mutationFn: async ({ lotId, userId }: { lotId: number, userId: number }) => {
      return await apiRequest(`/api/lots/${lotId}/pilotes`, 'POST', { userId });
    },
    onSuccess: () => {
      toast({
        title: 'Pilote ajouté',
        description: 'Le pilote a été ajouté avec succès au lot',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/chantiers/${id}/lots`] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'ajout du pilote',
        variant: 'destructive',
      });
      console.error('Erreur d\'ajout de pilote:', error);
    },
  });
  
  // Mutation pour retirer un pilote d'un lot
  const removePiloteMutation = useMutation({
    mutationFn: async ({ lotId, userId }: { lotId: number, userId: number }) => {
      return await apiRequest(`/api/lots/${lotId}/pilotes/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: 'Pilote retiré',
        description: 'Le pilote a été retiré avec succès du lot',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/chantiers/${id}/lots`] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du retrait du pilote',
        variant: 'destructive',
      });
      console.error('Erreur de retrait de pilote:', error);
    },
  });

  // Gérer le cas de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du chantier...</span>
      </div>
    );
  }

  // Gérer le cas d'erreur
  if (error || !chantier) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Chantier non trouvé</h2>
        <p className="text-gray-500 mt-2">Le chantier demandé n'existe pas ou a été supprimé</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/chantiers')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à la liste des chantiers
        </Button>
      </div>
    );
  }

  const tachesTerminees = chantier.taches?.filter(t => t.statut === 'termine')?.length || 0;
  const progression = (chantier.taches?.length || 0) > 0 
    ? Math.round((tachesTerminees / (chantier.taches?.length || 1)) * 100) 
    : 0;

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lotForm.nom.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le nom du lot est requis',
        variant: 'destructive',
      });
      return;
    }
    
    const data = {
      nom: lotForm.nom,
      type: lotForm.type,
      description: lotForm.description || null,
      chantierId: parseInt(id)
    };
    
    createLotMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <Dialog open={isNewLotDialogOpen} onOpenChange={setIsNewLotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau lot</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lot au chantier pour organiser les tâches
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateLot}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du lot</Label>
                <Input 
                  id="nom" 
                  placeholder="Ex: Gros oeuvre, Électricité, Plomberie..." 
                  value={lotForm.nom}
                  onChange={(e) => setLotForm({...lotForm, nom: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type de lot</Label>
                <Select 
                  value={lotForm.type} 
                  onValueChange={(value) => setLotForm({...lotForm, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TypeLot.TERRASSEMENT}>Terrassement</SelectItem>
                    <SelectItem value={TypeLot.RESEAUX_SECS}>Réseaux secs</SelectItem>
                    <SelectItem value={TypeLot.RESEAUX_HUMIDES}>Réseaux humides</SelectItem>
                    <SelectItem value={TypeLot.VOIRIE}>Voirie</SelectItem>
                    <SelectItem value={TypeLot.VRD}>VRD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Input 
                  id="description" 
                  placeholder="Description du lot..." 
                  value={lotForm.description}
                  onChange={(e) => setLotForm({...lotForm, description: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsNewLotDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={createLotMutation.isPending}
              >
                {createLotMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>Créer le lot</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="flex justify-between items-center">
        <PageTitle 
          title={chantier.nom}
          description={`Détails et gestion du chantier #${chantier.id}`}
        />
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/chantiers')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button onClick={() => navigate(`/chantiers/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le chantier et toutes ses données associées seront définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>Supprimer</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-primary" />
                    Informations générales
                  </CardTitle>
                  <CardDescription>
                    Détails principaux du chantier
                  </CardDescription>
                </div>
                {getStatusBadge(chantier.statut)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {chantier.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700">{chantier.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Période</h3>
                    <p className="text-gray-700">
                      {chantier.dateDebut ? formatDate(chantier.dateDebut) : 'Non définie'} 
                      {' — '} 
                      {chantier.dateFin ? formatDate(chantier.dateFin) : 'Non définie'}
                    </p>
                  </div>
                </div>
                
                {chantier.adresse && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                      <p className="text-gray-700">{chantier.adresse}</p>
                    </div>
                  </div>
                )}
                
                {chantier.responsable && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Responsable</h3>
                      <p className="text-gray-700">{chantier.responsable.prenom} {chantier.responsable.nom}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Création</h3>
                    <p className="text-gray-700">{formatDate(chantier.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" />
                    Lots du chantier
                  </CardTitle>
                  <CardDescription>
                    Organisation structurelle du chantier en lots
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsNewLotDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un lot
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLots ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>Chargement des lots...</span>
                </div>
              ) : lots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun lot n'a encore été créé pour ce chantier.
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNewLotDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un premier lot
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {lots.map(lot => {
                    // Couleur du badge en fonction du type
                    const getBadgeColor = (type: string) => {
                      switch(type) {
                        case 'structure': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
                        case 'reseaux_secs': return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
                        case 'reseaux_humides': return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100';
                        case 'voirie': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
                        case 'finitions': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
                        default: return 'bg-green-100 text-green-800 hover:bg-green-100';
                      }
                    };
                    
                    // Nom lisible du type
                    const getTypeLabel = (type: string) => {
                      switch(type) {
                        case 'structure': return 'Structure';
                        case 'reseaux_secs': return 'Réseaux secs';
                        case 'reseaux_humides': return 'Réseaux humides';
                        case 'voirie': return 'Voirie';
                        case 'finitions': return 'Finitions';
                        default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
                      }
                    };
                    
                    return (
                      <div key={lot.id} className="border rounded-lg p-5 hover:border-primary transition-colors bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-lg mb-1">
                              {lot.nom}
                            </h3>
                            <Badge className={`${getBadgeColor(lot.type)} mb-2`}>
                              {getTypeLabel(lot.type)}
                            </Badge>
                            {lot.description && (
                              <p className="text-gray-600 text-sm mt-2">{lot.description}</p>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              if (confirm(`Êtes-vous sûr de vouloir supprimer le lot "${lot.nom}" ?`)) {
                                deleteLotMutation.mutate(lot.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center text-sm border-t pt-3">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-gray-600 font-medium mr-2">Tâches:</span> 
                              <span className="font-semibold">{lot.tachesCount}</span>
                              <span className="mx-2 text-gray-400">•</span> 
                              <span className="text-green-600 font-medium">{lot.tachesTermineesCount} terminées</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="text-gray-600 font-medium mr-2">Pilotes:</span>
                            {lot.pilotes.length === 0 ? (
                              <span className="text-gray-500 italic text-xs">Aucun pilote</span>
                            ) : (
                              <div className="flex -space-x-2">
                                {lot.pilotes.slice(0, 3).map(pilote => (
                                  <div 
                                    key={pilote.id} 
                                    className="rounded-full bg-primary-100 text-primary-800 h-7 w-7 flex items-center justify-center text-xs font-medium border-2 border-white"
                                    title={`${pilote.prenom} ${pilote.nom}`}
                                  >
                                    {pilote.prenom[0]}{pilote.nom[0]}
                                  </div>
                                ))}
                                {lot.pilotes.length > 3 && (
                                  <div className="rounded-full bg-gray-100 text-gray-800 h-7 w-7 flex items-center justify-center text-xs font-medium border-2 border-white">
                                    +{lot.pilotes.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="ml-1" title="Gérer les pilotes">
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Pilotes du lot "{lot.nom}"</DialogTitle>
                                  <DialogDescription>
                                    Assignez des pilotes pour ce lot de travaux
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="py-4">
                                  <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {lot.pilotes.length > 0 ? (
                                      <>
                                        <h4 className="font-medium text-sm text-gray-500">Pilotes assignés</h4>
                                        {lot.pilotes.map(pilote => (
                                          <div key={pilote.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                            <div className="flex items-center">
                                              <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center text-sm font-medium mr-2">
                                                {pilote.prenom[0]}{pilote.nom[0]}
                                              </div>
                                              <div>
                                                <div className="font-medium">{pilote.prenom} {pilote.nom}</div>
                                                <div className="text-xs text-gray-500">{pilote.role}</div>
                                              </div>
                                            </div>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                              onClick={() => removePiloteMutation.mutate({ lotId: lot.id, userId: pilote.userId })}
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </>
                                    ) : (
                                      <div className="text-center py-2 text-gray-500">
                                        Aucun pilote assigné à ce lot
                                      </div>
                                    )}
                                    
                                    <h4 className="font-medium text-sm text-gray-500 mt-4">Ajouter un pilote</h4>
                                    {users
                                      .filter(user => !lot.pilotes.some(p => p.userId === user.id))
                                      .map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                                          <div className="flex items-center">
                                            <div className="rounded-full bg-gray-200 h-8 w-8 flex items-center justify-center text-sm font-medium mr-2">
                                              {user.prenom[0]}{user.nom[0]}
                                            </div>
                                            <div>
                                              <div className="font-medium">{user.prenom} {user.nom}</div>
                                              <div className="text-xs text-gray-500">{user.role}</div>
                                            </div>
                                          </div>
                                          <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => addPiloteMutation.mutate({ lotId: lot.id, userId: user.id })}
                                          >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Ajouter
                                          </Button>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => document.querySelector<HTMLButtonElement>('button[data-state="closed"].dialog-close')?.click()}>
                                    Fermer
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-primary" />
                Tâches associées
              </CardTitle>
              <CardDescription>
                Tâches liées à ce chantier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Progression totale</span>
                  <span className="text-sm font-medium">{progression}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${progression}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {tachesTerminees} sur {chantier.taches?.length || 0} tâches terminées
                </div>
              </div>
              
              {(chantier.taches?.length || 0) === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune tâche associée à ce chantier
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium text-gray-500 text-sm">Titre</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 text-sm">Statut</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 text-sm">Échéance</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500 text-sm">Progression</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(chantier.taches || []).map((tache) => (
                        <tr key={tache.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto font-medium text-primary"
                              onClick={() => navigate(`/taches/${tache.id}`)}
                            >
                              {tache.titre}
                            </Button>
                          </td>
                          <td className="py-2 px-2">
                            {getStatusBadge(tache.statut)}
                          </td>
                          <td className="py-2 px-2 text-sm">
                            {tache.dateLimite ? formatDate(tache.dateLimite) : '-'}
                          </td>
                          <td className="py-2 px-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${tache.progression}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/taches/new?chantierId=${chantier.id}`)}
              >
                Ajouter une tâche
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Statut</dt>
                  <dd className="mt-1">{getStatusBadge(chantier.statut)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre de tâches</dt>
                  <dd className="mt-1">{chantier.taches?.length || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Progression totale</dt>
                  <dd className="mt-1">{progression}%</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/taches/new?chantierId=${chantier.id}`)}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Nouvelle tâche
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate(`/chantiers/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier le chantier
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}