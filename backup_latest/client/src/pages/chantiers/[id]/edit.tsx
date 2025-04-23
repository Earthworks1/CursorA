import React from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Schéma de validation pour la mise à jour d'un chantier
const formSchema = z.object({
  nom: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional().nullable().transform(val => val || ''),
  dateDebut: z.string().optional().nullable().transform(val => val || ''),
  dateFin: z.string().optional().nullable().transform(val => val || ''),
  adresse: z.string().optional().nullable().transform(val => val || ''),
  responsableId: z.number().optional().nullable(),
  statut: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type User = {
  id: number;
  nom: string;
  prenom: string;
  role: string;
};

type Chantier = {
  id: number;
  nom: string;
  description: string | null;
  dateDebut: string | null;
  dateFin: string | null;
  adresse: string | null;
  responsableId: number | null;
  statut: string;
};

interface EditChantierProps {
  id: string;
}

export default function EditChantier({ id }: EditChantierProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Récupérer les données du chantier à modifier
  const { data: chantier, isLoading: isLoadingChantier } = useQuery<Chantier>({
    queryKey: [`/api/chantiers/${id}`],
  });

  // Récupérer la liste des utilisateurs pour le sélecteur de responsable
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Formulaire avec validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      description: '',
      dateDebut: '',
      dateFin: '',
      adresse: '',
      statut: 'actif',
    },
    values: chantier ? {
      nom: chantier.nom,
      description: chantier.description || '',
      dateDebut: chantier.dateDebut || '',
      dateFin: chantier.dateFin || '',
      adresse: chantier.adresse || '',
      responsableId: chantier.responsableId || undefined,
      statut: chantier.statut,
    } : undefined,
  });

  // Mutation pour mettre à jour un chantier
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return await apiRequest(`/api/chantiers/${id}`, 'PATCH', values);
    },
    onSuccess: () => {
      toast({
        title: 'Chantier mis à jour',
        description: 'Le chantier a été modifié avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/chantiers'] });
      queryClient.invalidateQueries({ queryKey: [`/api/chantiers/${id}`] });
      navigate(`/chantiers/${id}`);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la modification du chantier',
        variant: 'destructive',
      });
      console.error('Erreur de modification de chantier:', error);
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  if (isLoadingChantier) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du chantier...</span>
      </div>
    );
  }

  if (!chantier) {
    return (
      <div className="text-center py-10">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle
          title={`Modifier le chantier: ${chantier.nom}`}
          description="Mettre à jour les informations du chantier"
        />
        <Button variant="outline" onClick={() => navigate(`/chantiers/${id}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour aux détails
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Informations principales du chantier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du chantier *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du projet/chantier" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée du chantier"
                        className="min-h-[120px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateDebut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value?.split('T')[0] || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin prévue</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value?.split('T')[0] || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adresse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Adresse du chantier" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsable et statut</CardTitle>
              <CardDescription>
                Assignation et état du chantier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="responsableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable du chantier</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un responsable" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="p-2 text-center text-sm">Chargement...</div>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.prenom} {user.nom} ({user.role})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      La personne en charge de la supervision du chantier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="actif">Actif</SelectItem>
                        <SelectItem value="en_pause">En pause</SelectItem>
                        <SelectItem value="termine">Terminé</SelectItem>
                        <SelectItem value="annule">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/chantiers/${id}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>Enregistrement en cours...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}