import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatDateWithTime, getTimeAgo } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/ui/status-badge';
import ProgressWithText from '@/components/ui/progress-with-text';
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
} from '@/components/ui/alert-dialog';
import {
  Download,
  Edit,
  Trash2,
  Clock,
  Users,
  CalendarDays,
  CheckSquare,
  Building2,
  FileText,
  ArrowLeft,
  Paperclip,
  FileCog,
  MoreHorizontal,
  Loader2,
  FileType2,
  PlusCircle,
  History
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatutTache } from '@shared/schema';

interface TacheDetailProps {
  id: string;
}

type Tache = {
  id: number;
  titre: string;
  description: string;
  chantierId: number;
  chantierNom: string;
  type: string;
  statut: string;
  progression: number;
  dateDebut: string;
  dateDemande: string;
  dateRealisation: string;
  dateLimite: string;
  created_at: string;
  updated_at: string;
  updated_by: { id: number; nom: string; prenom: string } | null;
  pilote: { id: number; nom: string; prenom: string } | null;
  intervenant: { id: number; nom: string; prenom: string } | null;
  intervenants: {
    userId: number;
    nom: string;
    prenom: string;
  }[];
  piecesJointes: {
    id: number;
    nom: string;
    type: string;
    url: string;
    created_at: string;
    uploader: { id: number; nom: string; prenom: string };
    revisions: {
      id: number;
      indice: string;
      description: string;
      created_at: string;
      user: { id: number; nom: string; prenom: string };
    }[];
  }[];
  historique: {
    id: number;
    type: string;
    description: string;
    created_at: string;
    user: { id: number; nom: string; prenom: string } | null;
    metadata: any;
  }[];
};

const TacheDetail: React.FC<TacheDetailProps> = ({ id }) => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  
  const { data: tache, isLoading, isError } = useQuery<Tache>({
    queryKey: [`/api/taches/${id}`],
  });
  
  const deleteTacheMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/taches/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Tâche supprimée",
        description: "La tâche a été supprimée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/taches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/taches/recent'] });
      setLocation('/taches');
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest(`/api/pieces-jointes/${fileId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/taches/${id}`] });
      setDeletingFileId(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/taches/${id}/export-pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'exportation PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tache-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    onSuccess: () => {
      toast({
        title: "Export réussi",
        description: "Le PDF a été généré et téléchargé",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'exportation",
        description: `Une erreur est survenue: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest(`/api/taches/${id}/statut`, 'PATCH', { statut: newStatus });
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la tâche a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/taches/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/taches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/taches/recent'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  if (isError || !tache) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">Erreur: Impossible de charger les détails de la tâche</p>
            <Button variant="outline" onClick={() => setLocation('/taches')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux tâches
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleChangeStatus = (newStatus: string) => {
    updateStatusMutation.mutate(newStatus);
  };
  
  const handleDeleteFile = (fileId: number) => {
    setDeletingFileId(fileId);
    deleteFileMutation.mutate(fileId);
  };
  
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation('/taches')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{tache.titre}</h1>
            <div className="flex items-center gap-2">
              <Link href={`/chantiers/${tache.chantierId}`}>
                <span className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                  <Building2 className="h-3 w-3 mr-1" />
                  {tache.chantierNom}
                </span>
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500 capitalize">{tache.type}</span>
              <span className="text-gray-400">•</span>
              <StatusBadge status={tache.statut} />
            </div>
          </div>
        </div>
        <div className="flex mt-4 sm:mt-0 gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportPdfMutation.mutate()}>
                <FileType2 className="h-4 w-4 mr-2" />
                Exporter en PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/taches/${id}/edit`} className="flex items-center w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600">
                    <div className="w-full flex items-center">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </div>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer cette tâche? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700" 
                      onClick={() => deleteTacheMutation.mutate()}
                    >
                      {deleteTacheMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href={`/taches/${id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section principale */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium">Détails de la tâche</h3>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Détails</TabsTrigger>
                  <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
                  <TabsTrigger value="historique" className="flex-1">Historique</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-4">
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                      <p className="text-gray-800 whitespace-pre-line">
                        {tache.description || "Aucune description fournie."}
                      </p>
                    </div>
                    
                    <Separator />
                    
                    {/* Progression */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Progression</h3>
                        <span className="text-lg font-semibold text-gray-800">{tache.progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${tache.progression}%` }}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Changer le statut */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Changer le statut</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant={tache.statut === StatutTache.A_FAIRE ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleChangeStatus(StatutTache.A_FAIRE)}
                          disabled={updateStatusMutation.isPending}
                        >
                          À faire
                        </Button>
                        <Button 
                          variant={tache.statut === StatutTache.EN_COURS ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleChangeStatus(StatutTache.EN_COURS)}
                          disabled={updateStatusMutation.isPending}
                        >
                          En cours
                        </Button>
                        <Button 
                          variant={tache.statut === StatutTache.EN_VALIDATION ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleChangeStatus(StatutTache.EN_VALIDATION)}
                          disabled={updateStatusMutation.isPending}
                        >
                          En validation
                        </Button>
                        <Button 
                          variant={tache.statut === StatutTache.TERMINE ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleChangeStatus(StatutTache.TERMINE)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Terminé
                        </Button>
                        <Button 
                          variant={tache.statut === StatutTache.EN_REVISION ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleChangeStatus(StatutTache.EN_REVISION)}
                          disabled={updateStatusMutation.isPending}
                        >
                          En révision
                        </Button>
                        <Button 
                          variant={tache.statut === StatutTache.EN_RETARD ? "default" : "outline"} 
                          size="sm" 
                          className={tache.statut === StatutTache.EN_RETARD ? "bg-red-600 hover:bg-red-700" : ""}
                          onClick={() => handleChangeStatus(StatutTache.EN_RETARD)}
                          disabled={updateStatusMutation.isPending}
                        >
                          En retard
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-800">Documents et pièces jointes</h3>
                    <Link href={`/taches/${id}/edit`}>
                      <Button size="sm" variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </Link>
                  </div>
                  
                  {tache.piecesJointes.length === 0 ? (
                    <div className="text-center py-8">
                      <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun document attaché à cette tâche</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Ajoutez des plans, photos, rapports ou autres documents
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tache.piecesJointes.map((pieceJointe) => (
                        <Card key={pieceJointe.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                                  <div>
                                    <h4 className="font-medium text-gray-800">{pieceJointe.nom}</h4>
                                    <p className="text-sm text-gray-500">
                                      Ajouté par {pieceJointe.uploader.prenom} {pieceJointe.uploader.nom} le {formatDate(pieceJointe.created_at)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <a 
                                    href={pieceJointe.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-primary-600 hover:text-primary-800"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                  <button 
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteFile(pieceJointe.id)}
                                    disabled={deleteFileMutation.isPending && deletingFileId === pieceJointe.id}
                                  >
                                    {deleteFileMutation.isPending && deletingFileId === pieceJointe.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Révisions si disponibles */}
                              {pieceJointe.revisions && pieceJointe.revisions.length > 0 && (
                                <div className="mt-3 pl-8">
                                  <div className="text-sm font-medium text-gray-600 flex items-center mb-2">
                                    <History className="h-4 w-4 mr-1" />
                                    Historique des révisions
                                  </div>
                                  <div className="space-y-2">
                                    {pieceJointe.revisions.map((revision) => (
                                      <div key={revision.id} className="bg-gray-50 rounded-md p-2 text-sm">
                                        <div className="flex justify-between">
                                          <div className="font-medium">Indice: {revision.indice}</div>
                                          <div className="text-gray-500">{formatDateWithTime(revision.created_at)}</div>
                                        </div>
                                        <div className="text-gray-600 mt-1">{revision.description}</div>
                                        <div className="text-gray-500 text-xs mt-1">
                                          Par {revision.user.prenom} {revision.user.nom}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="historique" className="mt-4">
                <div className="flow-root">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Historique des modifications</h3>
                  
                  {tache.historique.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun historique disponible</p>
                    </div>
                  ) : (
                    <ul role="list" className="-mb-8">
                      {tache.historique.map((item, index) => {
                        const isLast = index === tache.historique.length - 1;
                        
                        // Décider de l'icône et la couleur selon le type d'activité
                        let icon, bgColor;
                        switch (item.type) {
                          case 'creation':
                            icon = <CheckSquare className="text-white text-sm" />;
                            bgColor = 'bg-green-500';
                            break;
                          case 'modification':
                            icon = <Edit className="text-white text-sm" />;
                            bgColor = 'bg-blue-500';
                            break;
                          case 'statut':
                            icon = <FileCog className="text-white text-sm" />;
                            bgColor = 'bg-purple-500';
                            break;
                          case 'document':
                            icon = <Paperclip className="text-white text-sm" />;
                            bgColor = 'bg-orange-500';
                            break;
                          default:
                            icon = <History className="text-white text-sm" />;
                            bgColor = 'bg-gray-500';
                        }
                        
                        return (
                          <li key={item.id}>
                            <div className="relative pb-8">
                              {!isLast && (
                                <span 
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center ring-8 ring-white`}>
                                    {icon}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-800">
                                      <span className="font-medium">
                                        {item.user ? `${item.user.prenom} ${item.user.nom}` : "Système"}
                                      </span>{' '}
                                      {item.description}
                                    </p>
                                    {item.metadata && item.metadata.details && (
                                      <p className="mt-1 text-xs text-gray-500">{item.metadata.details}</p>
                                    )}
                                  </div>
                                  <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                    <time dateTime={item.created_at}>{getTimeAgo(item.created_at)}</time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar d'informations */}
        <div className="space-y-6">
          {/* Informations rapides */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dates */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-1" /> 
                  Dates
                </h3>
                <dl className="grid grid-cols-1 gap-1 text-sm">
                  {tache.dateDebut && (
                    <>
                      <dt className="text-gray-500">Date de début:</dt>
                      <dd className="text-gray-800">{formatDate(tache.dateDebut)}</dd>
                    </>
                  )}
                  
                  {tache.dateDemande && (
                    <>
                      <dt className="text-gray-500">Date de demande:</dt>
                      <dd className="text-gray-800">{formatDate(tache.dateDemande)}</dd>
                    </>
                  )}
                  
                  {tache.dateRealisation && (
                    <>
                      <dt className="text-gray-500">Date de réalisation:</dt>
                      <dd className="text-gray-800">{formatDate(tache.dateRealisation)}</dd>
                    </>
                  )}
                  
                  {tache.dateLimite && (
                    <>
                      <dt className="text-gray-500">Date limite:</dt>
                      <dd className={`font-medium ${new Date(tache.dateLimite) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatDate(tache.dateLimite)}
                      </dd>
                    </>
                  )}
                </dl>
              </div>
              
              <Separator />
              
              {/* Pilote et Intervenant */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-1" /> 
                  Pilote et Intervenant
                </h3>
                <div className="space-y-4">
                  {/* Pilote */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Pilote</h4>
                    {tache.pilote ? (
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-2 border-2 border-primary-100">
                          <AvatarFallback className="bg-primary-50 text-primary-700">
                            {tache.pilote.prenom[0]}{tache.pilote.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{tache.pilote.prenom} {tache.pilote.nom}</p>
                          <p className="text-xs text-gray-500">Responsable de la tâche</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun pilote assigné</p>
                    )}
                  </div>

                  {/* Intervenant principal */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Intervenant principal</h4>
                    {tache.intervenant ? (
                      <div className="flex items-center">
                        <Avatar className="h-9 w-9 mr-2 border-2 border-gray-100">
                          <AvatarFallback className="bg-gray-50 text-gray-700">
                            {tache.intervenant.prenom[0]}{tache.intervenant.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{tache.intervenant.prenom} {tache.intervenant.nom}</p>
                          <p className="text-xs text-gray-500">Exécutant principal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun intervenant principal assigné</p>
                    )}
                  </div>

                  {/* Autres intervenants */}
                  {tache.intervenants.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">Autres intervenants</h4>
                      <div className="space-y-2">
                        {tache.intervenants.map((intervenant) => (
                          <div key={intervenant.userId} className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>
                                {intervenant.prenom[0]}{intervenant.nom[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{intervenant.prenom} {intervenant.nom}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Informations de création/mise à jour */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Métadonnées</h3>
                <dl className="grid grid-cols-1 gap-1 text-sm">
                  <dt className="text-gray-500">Créée le:</dt>
                  <dd className="text-gray-800">{formatDateWithTime(tache.created_at)}</dd>
                  
                  <dt className="text-gray-500">Dernière mise à jour:</dt>
                  <dd className="text-gray-800">
                    {formatDateWithTime(tache.updated_at)}
                    {tache.updated_by && (
                      <span className="text-xs text-gray-500 ml-1">
                        par {tache.updated_by.prenom} {tache.updated_by.nom}
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => exportPdfMutation.mutate()}
                disabled={exportPdfMutation.isPending}
              >
                {exportPdfMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Exporter en PDF
              </Button>
              
              <Link href={`/taches/${id}/edit`} className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier la tâche
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full justify-start bg-red-50 text-red-600 hover:bg-red-100 border-red-200" variant="outline">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer la tâche
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer cette tâche? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700" 
                      onClick={() => deleteTacheMutation.mutate()}
                    >
                      {deleteTacheMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TacheDetail;
