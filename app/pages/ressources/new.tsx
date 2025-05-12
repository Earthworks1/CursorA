import React from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Truck, Wrench, User } from 'lucide-react';

const formSchema = z.object({
  nom: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  type: z.enum(['equipement', 'vehicule', 'personnel'], { 
    required_error: 'Veuillez sélectionner un type de ressource' 
  }),
  statut: z.enum(['disponible', 'indisponible', 'maintenance'], { 
    required_error: 'Veuillez sélectionner un statut' 
  }),
  description: z.string().nullable().optional(),
  cout_horaire: z.coerce.number().positive().optional().nullable(),
  caracteristiques: z.record(z.string(), z.any()).optional(),
});

const RESOURCE_TYPES = [
  { 
    id: 'equipement',
    label: 'Équipement',
    description: 'Outils, machines et matériel de chantier',
    icon: <Wrench className="h-6 w-6 text-orange-500" />
  },
  { 
    id: 'vehicule',
    label: 'Véhicule',
    description: 'Camions, pelleteuses et autres engins',
    icon: <Truck className="h-6 w-6 text-green-500" />
  },
  { 
    id: 'personnel',
    label: 'Personnel',
    description: 'Ouvriers, techniciens et ingénieurs',
    icon: <User className="h-6 w-6 text-blue-500" />
  },
];

type FormValues = z.infer<typeof formSchema>;

const NouvelleRessource: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      type: 'equipement',
      statut: 'disponible',
      description: '',
      cout_horaire: null,
      caracteristiques: {},
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      return apiRequest('POST', '/api/ressources', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ressources'] });
      toast({
        title: 'Ressource créée',
        description: 'La ressource a été ajoutée avec succès.',
      });
      navigate('/ressources');
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    const caracteristiques: Record<string, any> = {};
    
    if (values.type === 'vehicule') {
      caracteristiques.marque = form.watch('caracteristiques.marque') || '';
      caracteristiques.modele = form.watch('caracteristiques.modele') || '';
      caracteristiques.immatriculation = form.watch('caracteristiques.immatriculation') || '';
      caracteristiques.annee = form.watch('caracteristiques.annee') ? parseInt(form.watch('caracteristiques.annee')) : null;
    } else if (values.type === 'equipement') {
      caracteristiques.marque = form.watch('caracteristiques.marque') || '';
      caracteristiques.modele = form.watch('caracteristiques.modele') || '';
      caracteristiques.annee = form.watch('caracteristiques.annee') ? parseInt(form.watch('caracteristiques.annee')) : null;
    }
    
    mutation.mutate({
      ...values,
      caracteristiques
    });
  };

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
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouvelle Ressource</h1>
          <p className="text-muted-foreground">
            Ajoutez une nouvelle ressource à votre inventaire
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations de la ressource</CardTitle>
            <CardDescription>
              Renseignez les détails de cette ressource
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Type de ressource</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                        >
                          {RESOURCE_TYPES.map((type) => (
                            <div key={type.id} className={`
                              flex items-center space-x-2 rounded-md border p-4 
                              ${field.value === type.id ? 'border-primary bg-primary/5' : 'border-input'}
                              hover:bg-accent hover:text-accent-foreground
                              cursor-pointer
                            `}
                            onClick={() => field.onChange(type.id)}
                            >
                              <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                              <div className="flex items-center space-x-3">
                                {type.icon}
                                <div>
                                  <Label htmlFor={type.id} className="font-medium">{type.label}</Label>
                                  <p className="text-sm text-muted-foreground">{type.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Pelle mécanique 20T" {...field} />
                        </FormControl>
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
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="disponible" id="disponible" />
                              <Label htmlFor="disponible">Disponible</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="indisponible" id="indisponible" />
                              <Label htmlFor="indisponible">Indisponible</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="maintenance" id="maintenance" />
                              <Label htmlFor="maintenance">Maintenance</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée de la ressource..." 
                          className="min-h-[120px]" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cout_horaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coût horaire (€/h)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          value={field.value === null ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Coût horaire d'utilisation de cette ressource (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(form.watch('type') === 'equipement' || form.watch('type') === 'vehicule') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                    <h3 className="text-lg font-medium md:col-span-3">Caractéristiques techniques</h3>
                    
                    <FormField
                      control={form.control}
                      name="caracteristiques.marque"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marque</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Caterpillar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="caracteristiques.modele"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modèle</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 320D" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="caracteristiques.annee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Année</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('type') === 'vehicule' && (
                      <FormField
                        control={form.control}
                        name="caracteristiques.immatriculation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Immatriculation</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: AB-123-CD" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/ressources')}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NouvelleRessource;