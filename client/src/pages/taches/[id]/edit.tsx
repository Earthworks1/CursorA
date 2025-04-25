import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from '@/components/ui/calendar';
import { fr } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StatutTache, PrioriteTache, TypeTache } from '@shared/schema';
import { cn } from '@/lib/utils';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  titre: z.string().min(3, {
    message: "Le titre doit comporter au moins 3 caractères."
  }),
  description: z.string().optional(),
  type: z.string(),
  priorite: z.string().optional(),
  statut: z.string(),
  chantierId: z.number().optional(),
  lotId: z.number().optional(),
  dateDebut: z.date().optional(),
  dateDemande: z.date().optional(),
  dateRealisation: z.date().optional(),
  dateLimite: z.date().optional(),
  progression: z.number().min(0).max(100).optional(),
  // Nouveaux champs pour le pilote et l'intervenant
  piloteId: z.number().optional(),
  intervenantId: z.number().optional(),
});

interface EditTacheProps {
  id: string;
}

const EditTachePage: React.FC<EditTacheProps> = ({ id }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les détails de la tâche
  const { data: tache, isLoading, error } = useQuery({
    queryKey: [`/api/taches/${id}`],
    onSuccess: (data) => {
      // Convertir les dates en objets Date si elles existent
      const dateDebut = data.dateDebut ? new Date(data.dateDebut) : undefined;
      const dateDemande = data.dateDemande ? new Date(data.dateDemande) : undefined;
      const dateRealisation = data.dateRealisation ? new Date(data.dateRealisation) : undefined;
      const dateLimite = data.dateLimite ? new Date(data.dateLimite) : undefined;
      
      // Mettre à jour le formulaire avec les données
      form.reset({
        ...data,
        dateDebut,
        dateDemande,
        dateRealisation,
        dateLimite,
        progression: data.progression || 0,
      });
    }
  });

  // Formulaire avec validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titre: "",
      description: "",
      type: "execution",
      priorite: "normale",
      statut: StatutTache.A_FAIRE,
      chantierId: undefined,
      lotId: undefined,
      progression: 0,
      piloteId: undefined,
      intervenantId: undefined,
    },
  });

  // Récupérer la liste des chantiers
  const { data: chantiers = [] } = useQuery<{ id: number; nom: string }[]>({
    queryKey: ['/api/chantiers/list'],
  });

  // Récupérer la liste des lots (si un chantier est sélectionné)
  const selectedChantierId = form.watch('chantierId');
  const { data: lots = [], isLoading: isLoadingLots } = useQuery<{ id: number; nom: string; type: string }[]>({
    queryKey: [`/api/chantiers/${selectedChantierId}/lots`],
    enabled: !!selectedChantierId,
  });
  
  // Récupérer la liste des utilisateurs pour les pilotes et intervenants
  const { data: users = [] } = useQuery<{ id: number; nom: string; prenom: string; role: string }[]>({
    queryKey: ['/api/users'],
  });

  // Mise à jour de tâche
  const updateTacheMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest(`/api/taches/${id}`, 'PATCH', values);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Tâche mise à jour",
        description: "La tâche a été mise à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/taches/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/taches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/taches/recent'] });
      // Rediriger vers la page de détail de la tâche
      navigate(`/taches/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la tâche.",
        variant: "destructive",
      });
      console.error("Erreur de mise à jour:", error);
    }
  });

  // Soumettre le formulaire
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Vérifier que soit chantierId soit lotId est défini
    if (!values.chantierId && !values.lotId) {
      toast({
        title: "Champs requis",
        description: "Veuillez sélectionner un chantier ou un lot.",
        variant: "destructive",
      });
      return;
    }
    
    updateTacheMutation.mutate(values);
  };

  // Gérer le cas de chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement de la tâche...</span>
      </div>
    );
  }

  // Gérer le cas d'erreur
  if (error || !tache) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">Erreur de chargement</h2>
        <p className="text-gray-500 mt-2">Impossible de charger les détails de la tâche</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/taches')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des tâches
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={() => navigate(`/taches/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Modifier la tâche</h1>
          <p className="text-gray-500">{tache.titre}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la tâche</CardTitle>
          <CardDescription>
            Modifiez les informations de la tâche
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Titre */}
                <FormField
                  control={form.control}
                  name="titre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Titre de la tâche" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TypeTache.LEVE}>Levé</SelectItem>
                          <SelectItem value={TypeTache.IMPLANTATION}>Implantation</SelectItem>
                          <SelectItem value={TypeTache.RECOLMENT}>Recollement</SelectItem>
                          <SelectItem value={TypeTache.ETUDE}>Étude</SelectItem>
                          <SelectItem value={TypeTache.DAO}>DAO</SelectItem>
                          <SelectItem value={TypeTache.AUTRE}>Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description détaillée de la tâche"
                        {...field}
                        value={field.value || ""}
                        className="min-h-32"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Chantier */}
                <FormField
                  control={form.control}
                  name="chantierId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Chantier</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? chantiers.find(
                                    (chantier) => chantier.id === field.value
                                  )?.nom
                                : "Sélectionnez un chantier"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher un chantier..."
                              className="h-9"
                            />
                            <CommandEmpty>Aucun chantier trouvé.</CommandEmpty>
                            <CommandGroup>
                              {chantiers.map((chantier) => (
                                <CommandItem
                                  value={chantier.nom}
                                  key={chantier.id}
                                  onSelect={() => {
                                    form.setValue("chantierId", chantier.id);
                                    form.setValue("lotId", undefined);
                                  }}
                                >
                                  {chantier.nom}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      chantier.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Lot */}
                <FormField
                  control={form.control}
                  name="lotId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Lot</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!selectedChantierId || isLoadingLots}
                            >
                              {field.value
                                ? lots.find(
                                    (lot) => lot.id === field.value
                                  )?.nom
                                : isLoadingLots 
                                  ? "Chargement des lots..." 
                                  : selectedChantierId 
                                    ? "Sélectionnez un lot" 
                                    : "Sélectionnez un chantier d'abord"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher un lot..."
                              className="h-9"
                            />
                            <CommandEmpty>
                              {lots.length === 0 
                                ? "Aucun lot pour ce chantier." 
                                : "Aucun lot trouvé."}
                            </CommandEmpty>
                            <CommandGroup>
                              {lots.map((lot) => (
                                <CommandItem
                                  value={lot.nom}
                                  key={lot.id}
                                  onSelect={() => {
                                    form.setValue("lotId", lot.id);
                                  }}
                                >
                                  {lot.nom}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      lot.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Priorité */}
                <FormField
                  control={form.control}
                  name="priorite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select 
                        value={field.value || "normale"} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PrioriteTache.BASSE}>Basse</SelectItem>
                          <SelectItem value={PrioriteTache.NORMALE}>Normale</SelectItem>
                          <SelectItem value={PrioriteTache.HAUTE}>Haute</SelectItem>
                          <SelectItem value={PrioriteTache.URGENTE}>Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Statut */}
                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={StatutTache.A_FAIRE}>À faire</SelectItem>
                          <SelectItem value={StatutTache.EN_COURS}>En cours</SelectItem>
                          <SelectItem value={StatutTache.EN_VALIDATION}>En validation</SelectItem>
                          <SelectItem value={StatutTache.TERMINE}>Terminé</SelectItem>
                          <SelectItem value={StatutTache.EN_REVISION}>En révision</SelectItem>
                          <SelectItem value={StatutTache.EN_RETARD}>En retard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Date de début */}
                <FormField
                  control={form.control}
                  name="dateDebut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={fr}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date limite */}
                <FormField
                  control={form.control}
                  name="dateLimite"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date limite</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PP", { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={fr}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Pilote */}
                <FormField
                  control={form.control}
                  name="piloteId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pilote</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? (() => {
                                    const user = users.find(u => u.id === field.value);
                                    return user ? `${user.prenom} ${user.nom}` : "Sélectionnez un pilote";
                                  })()
                                : "Sélectionnez un pilote"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher un pilote..."
                              className="h-9"
                            />
                            <CommandEmpty>Aucun pilote trouvé.</CommandEmpty>
                            <CommandGroup>
                              {users.map((user) => (
                                <CommandItem
                                  value={`${user.prenom} ${user.nom}`}
                                  key={user.id}
                                  onSelect={() => {
                                    form.setValue("piloteId", user.id);
                                  }}
                                >
                                  {`${user.prenom} ${user.nom}`}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      user.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Intervenant */}
                <FormField
                  control={form.control}
                  name="intervenantId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Intervenant</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? (() => {
                                    const user = users.find(u => u.id === field.value);
                                    return user ? `${user.prenom} ${user.nom}` : "Sélectionnez un intervenant";
                                  })()
                                : "Sélectionnez un intervenant"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Command>
                            <CommandInput
                              placeholder="Rechercher un intervenant..."
                              className="h-9"
                            />
                            <CommandEmpty>Aucun intervenant trouvé.</CommandEmpty>
                            <CommandGroup>
                              {users.map((user) => (
                                <CommandItem
                                  value={`${user.prenom} ${user.nom}`}
                                  key={user.id}
                                  onSelect={() => {
                                    form.setValue("intervenantId", user.id);
                                  }}
                                >
                                  {`${user.prenom} ${user.nom}`}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      user.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Progression */}
              <FormField
                control={form.control}
                name="progression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progression: {field.value || 0}%</FormLabel>
                    <FormControl>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/taches/${id}`)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={updateTacheMutation.isPending}
                >
                  {updateTacheMutation.isPending ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTachePage;