import React, { useState } from 'react';
import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { StatutTache, TypeTache, PrioriteTache } from '@/types/schema';
import { Calendar as CalendarIcon, Upload, Plus, Minus, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QuickCreateChantierModal from '../chantiers/quick-create-chantier-modal';

/**
 * Représente un utilisateur pouvant être pilote ou intervenant.
 */
type User = {
  id: number;
  nom: string;
  prenom: string;
};

/**
 * Représente un chantier auquel une tâche peut être associée.
 */
type Chantier = {
  id: number;
  nom: string;
};

/**
 * Représente une tâche complète avec toutes ses propriétés.
 */
type Task = {
  id: number;
  titre: string;
  description?: string;
  chantierId?: number;
  lotId?: number;
  type: string;
  statut: string;
  progression: number;
  piloteId?: number;
  priorite: string;
  intervenants?: { userId: number }[];
  dateDebut?: string | null;
  dateDemande?: string | null;
  dateRealisation?: string | null;
  dateLimite?: string | null;
  piecesJointes?: {
    id: number;
    nom: string;
    type: string;
    url: string;
  }[];
};

/**
 * Props du formulaire de tâche.
 * @param taskId - Identifiant de la tâche à éditer (optionnel)
 * @param isEditing - Mode édition ou création
 */
interface TaskFormProps {
  taskId?: string;
  isEditing?: boolean;
}

// Schéma du formulaire
const formSchema = z.object({
  titre: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  description: z.string().optional(),
  chantierId: z.number().optional(),
  type: z.string({ required_error: "Veuillez sélectionner un type" }),
  statut: z.string({ required_error: "Veuillez sélectionner un statut" }),
  progression: z.number().min(0).max(100),
  piloteId: z.number().optional(),
  priorite: z.string().default("normale"),
  intervenants: z.array(z.object({ userId: z.number() })),
  dateDebut: z.date().optional().nullable(),
  dateDemande: z.date().optional().nullable(),
  dateRealisation: z.date().optional().nullable(),
  dateLimite: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// Composant pour la sélection de date
const DatePickerField = ({ 
  control, 
  name, 
  label 
}: { 
  control: Control<FormValues>; 
  name: keyof FormValues; 
  label: string;
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-col">
        <FormLabel>{label}</FormLabel>
        <Popover>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                variant={"outline"}
                className={`w-full pl-3 text-left font-normal ${
                  !field.value && "text-muted-foreground"
                }`}
              >
                {field.value instanceof Date && !isNaN(field.value.getTime())
                  ? format(field.value, "dd/MM/yyyy")
                  : <span>Sélectionner</span>
                }
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value instanceof Date && !isNaN(field.value.getTime()) ? field.value : undefined}
              onSelect={field.onChange}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    )}
  />
);

// Composant pour la section des dates
const DateSection = ({ control }: { control: Control<FormValues> }) => (
  <>
    <div className="sm:col-span-2">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Dates</h3>
    </div>
    <DatePickerField control={control} name="dateDebut" label="Date de début" />
    <DatePickerField control={control} name="dateDemande" label="Date de demande" />
    <DatePickerField control={control} name="dateRealisation" label="Date de réalisation" />
    <DatePickerField control={control} name="dateLimite" label="Date limite" />
  </>
);

// Composant pour la section des responsables
const ResponsibleSection = ({ control, users }: { control: Control<FormValues>; users?: User[] }) => (
  <>
    <div className="sm:col-span-2">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Responsables</h3>
    </div>
    <FormField
      control={control}
      name="piloteId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pilote</FormLabel>
          <Select
            onValueChange={(value) => field.onChange(parseInt(value))}
            defaultValue={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un pilote" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.prenom} {user.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="intervenants"
      render={({ field }) => (
        <FormItem className="sm:col-span-2">
          <FormLabel>Intervenants</FormLabel>
          <div className="space-y-2">
            {users?.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value?.some(i => i.userId === user.id)}
                  onCheckedChange={(checked) => {
                    const newValue = checked
                      ? [...(field.value || []), { userId: user.id }]
                      : (field.value || []).filter(i => i.userId !== user.id);
                    field.onChange(newValue);
                  }}
                />
                <Label>{user.prenom} {user.nom}</Label>
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);

/**
 * Props pour le composant d'upload de fichiers.
 * @param fileUploads - Liste des fichiers sélectionnés
 * @param onFileChange - Callback lors de l'ajout de fichiers
 * @param onRemoveFile - Callback lors de la suppression d'un fichier
 */
interface FileUploadSectionProps {
  fileUploads: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ fileUploads, onFileChange, onRemoveFile }) => {
  // Ajout d'un état pour la progression et le feedback
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = React.useState<boolean | null>(null);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Simuler une progression d'upload (à remplacer par la vraie logique si besoin)
  const simulateUpload = () => {
    setUploadProgress(0);
    setUploadSuccess(null);
    setUploadError(null);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(null), 1500);
      }
    }, 200);
  };

  // Déclencher la simulation lors de l'ajout de fichiers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileChange(e);
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload();
    }
  };

  return (
    <div className="sm:col-span-2 mt-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Ajouter des pièces jointes</h3>
      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
        <Upload className="h-8 w-8 text-gray-400 mb-2" aria-hidden="true" />
        <p className="text-sm text-gray-500 mb-2">
          Glissez-déposez des fichiers ici, ou cliquez pour sélectionner
        </p>
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={handleChange}
          aria-label="Ajouter des fichiers en pièce jointe"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-primary-50 text-primary-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-100"
          aria-label="Sélectionner des fichiers à ajouter"
        >
          Sélectionner des fichiers
        </label>
        {uploadProgress !== null && (
          <div className="w-full mt-4" aria-live="polite">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-primary-600 h-2 transition-all"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <span className="text-xs text-gray-500">{uploadProgress}%</span>
          </div>
        )}
        {uploadSuccess && (
          <div className="mt-2 text-green-600 text-xs" role="status">Fichiers ajoutés avec succès !</div>
        )}
        {uploadError && (
          <div className="mt-2 text-red-600 text-xs" role="alert">{uploadError}</div>
        )}
      </div>
      {fileUploads.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers sélectionnés:</h4>
          <ul className="space-y-2">
            {fileUploads.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Supprimer le fichier ${file.name}`}
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const TaskForm: React.FC<TaskFormProps> = ({ taskId, isEditing = false }) => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [fileUploads, setFileUploads] = useState<File[]>([]);
  
  // Charger les données de la tâche si en mode édition
  const { data: task, isLoading: isTaskLoading } = useQuery<Task>({
    queryKey: [`/api/taches/${taskId}`],
    enabled: isEditing && !!taskId,
  });
  
  // Charger les utilisateurs
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Charger les chantiers
  const { data: chantiers } = useQuery<Chantier[]>({
    queryKey: ['/api/chantiers'],
  });
  
  // Paramètres par défaut du formulaire
  const defaultValues: Partial<FormValues> = {
    titre: '',
    description: '',
    type: Object.values(TypeTache)[0],
    statut: StatutTache.A_FAIRE,
    progression: 0,
    intervenants: [],
  };
  
  // Initialiser le formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: task 
      ? {
          ...task,
          dateDebut: task.dateDebut ? new Date(task.dateDebut) : null,
          dateDemande: task.dateDemande ? new Date(task.dateDemande) : null,
          dateRealisation: task.dateRealisation ? new Date(task.dateRealisation) : null,
          dateLimite: task.dateLimite ? new Date(task.dateLimite) : null,
          intervenants: task.intervenants || []
        }
      : defaultValues,
  });
  
  // Mutation pour créer / mettre à jour une tâche
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const url = isEditing ? `/api/taches/${taskId}` : '/api/taches';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await apiRequest(method, url, values);
      const data = await response.json();
      
      // Gérer l'upload de fichiers si nécessaire
      if (fileUploads.length > 0 && data.id) {
        const formData = new FormData();
        fileUploads.forEach(file => {
          formData.append('files', file);
        });
        
        await fetch(`/api/taches/${data.id}/pieces-jointes`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/taches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/taches/recent'] });
      
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: [`/api/taches/${taskId}`] });
        toast({
          title: "Tâche mise à jour",
          description: "La tâche a été mise à jour avec succès",
        });
      } else {
        toast({
          title: "Tâche créée",
          description: "La tâche a été créée avec succès",
        });
      }
      
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
  
  // Gestion des fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFileUploads(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFileUploads(prev => prev.filter((_, i) => i !== index));
  };
  
  // Soumission du formulaire
  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };
  
  if (isEditing && isTaskLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">
          {isEditing ? "Modifier la tâche" : "Nouvelle tâche"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Titre et description */}
              <FormField
                control={form.control}
                name="titre"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de la tâche" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description détaillée de la tâche" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="sm:col-span-2 my-4" />
              
              {/* Informations principales */}
              <FormField
                control={form.control}
                name="chantierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chantier</FormLabel>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un chantier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {chantiers?.map((chantier) => (
                              <SelectItem key={chantier.id} value={chantier.id.toString()}>
                                {chantier.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <QuickCreateChantierModal
                        onChantierCreated={(chantierId) => {
                          field.onChange(chantierId);
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TypeTache.LEVE}>Levé</SelectItem>
                        <SelectItem value={TypeTache.IMPLANTATION}>Implantation</SelectItem>
                        <SelectItem value={TypeTache.RECOLEMENT}>Récolement</SelectItem>
                        <SelectItem value={TypeTache.ETUDE}>Étude</SelectItem>
                        <SelectItem value={TypeTache.AUTRE}>Autre</SelectItem>
                        <SelectItem value={TypeTache.DAO}>DAO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
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
                        <SelectItem value={StatutTache.A_FAIRE}>À faire</SelectItem>
                        <SelectItem value={StatutTache.EN_COURS}>En cours</SelectItem>
                        <SelectItem value={StatutTache.EN_VALIDATION}>En validation</SelectItem>
                        <SelectItem value={StatutTache.TERMINE}>Terminé</SelectItem>
                        <SelectItem value={StatutTache.EN_RETARD}>En retard</SelectItem>
                        <SelectItem value={StatutTache.EN_REVISION}>En révision</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="progression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progression (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="sm:col-span-2 my-4" />
              
              {/* Section des dates */}
              <DateSection control={form.control} />
              
              <Separator className="sm:col-span-2 my-4" />
              
              {/* Section des responsables */}
              <ResponsibleSection control={form.control} users={users} />
              
              <Separator className="sm:col-span-2 my-4" />
              
              {/* Pièces jointes */}
              {isEditing && (
                <div className="sm:col-span-2 mt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Pièces jointes existantes</h3>
                  
                  {task?.piecesJointes && task.piecesJointes.length > 0 ? (
                    <ul className="space-y-2">
                      {task.piecesJointes.map((piece) => (
                        <li key={piece.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{piece.nom}</span>
                            <span className="ml-2 text-xs text-gray-500">({piece.type})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a 
                              href={piece.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm"
                            >
                              Voir
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Aucune pièce jointe existante</p>
                  )}
                </div>
              )}
              
              <FileUploadSection fileUploads={fileUploads} onFileChange={handleFileChange} onRemoveFile={removeFile} />
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation('/taches')}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;
