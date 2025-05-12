import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatDateWithTime, getTimeAgo } from '@/lib/utils';
import type { Tache } from '@/types/index';
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
import { StatutTache } from '@/types/schema';

interface TacheDetailProps {
  id: string;
}

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
                  Chantier #{tache.chantierId}
                </span>
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500 capitalize">{tache.statut}</span>
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
                        {typeof tache.charge === 'number' && (
                          <>
                            <span className="text-lg font-semibold text-gray-800">{tache.charge}h</span>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${Math.min(tache.charge, 100)}%` }} />
                            </div>
                          </>
                        )}
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
                          variant={tache.statut === StatutTache.TERMINE ? "default" : "outline"} 
                          size="sm"
                          onClick={() => handleChangeStatus(StatutTache.TERMINE)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Terminé
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
                  
                  {'piecesJointes' in tache && Array.isArray((tache as any).piecesJointes) ? (
                    (tache as any).piecesJointes.length === 0 ? (
                      <div className="text-center py-8">
                        <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun document attaché à cette tâche</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Ajoutez des plans, photos, rapports ou autres documents
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(tache as any).piecesJointes.map((pieceJointe: any) => (
                          <Card key={pieceJointe.id} className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start space-x-3">
                                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                                    <div>
                                      <h4 className="font-medium text-gray-800">{pieceJointe.nom}</h4>
                                      <p className="text-sm text-gray-500">
                                        Ajouté le {pieceJointe.created_at ? formatDate(pieceJointe.created_at) : 'N/A'}
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
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Aucun document attaché à cette tâche</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Ajoutez des plans, photos, rapports ou autres documents
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="historique" className="mt-4">
                <div className="flow-root">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Historique des modifications</h3>
                  
                  {'historique' in tache && Array.isArray((tache as any).historique) ? (
                    (tache as any).historique.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucun historique disponible</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(tache as any).historique.map((event: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{event.date}</span>
                            <span>{event.action}</span>
                          </div>
                        ))}
                      </div>
                    )
                  ) : null}
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
                  
                  {'dateDemande' in tache && tache.dateDemande ? (
                    <>
                      <dt className="text-gray-500">Date de demande:</dt>
                      <dd className="text-gray-800">{formatDate((tache as any).dateDemande)}</dd>
                    </>
                  ) : null}
                  
                  {'dateRealisation' in tache && tache.dateRealisation ? (
                    <>
                      <dt className="text-gray-500">Date de réalisation:</dt>
                      <dd className="text-gray-800">{formatDate((tache as any).dateRealisation)}</dd>
                    </>
                  ) : null}
                  
                  {'dateLimite' in tache && tache.dateLimite ? (
                    <>
                      <dt className="text-gray-500">Date limite:</dt>
                      <dd className={`font-medium ${new Date((tache as any).dateLimite) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>{formatDate((tache as any).dateLimite)}</dd>
                    </>
                  ) : null}
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
                    {tache.piloteId ? (
                      <span className="text-sm text-gray-800">Utilisateur #{tache.piloteId}</span>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun pilote assigné</p>
                    )}
                  </div>

                  {/* Intervenant principal */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 mb-2">Intervenant principal</h4>
                    {tache.intervenantId ? (
                      <span className="text-sm text-gray-800">Utilisateur #{tache.intervenantId}</span>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun intervenant principal assigné</p>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Informations de création/mise à jour */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Métadonnées</h3>
                <dl className="grid grid-cols-1 gap-1 text-sm">
                  <dt className="text-gray-500">Créée le:</dt>
                  <dd className="text-gray-800">N/A</dd>
                  
                  <dt className="text-gray-500">Dernière mise à jour:</dt>
                  <dd className="text-gray-800">N/A</dd>
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
