import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Edit, Trash2, Plus, UserPlus } from "lucide-react";

// Fonction utilitaire pour obtenir les initiales à partir du nom et prénom
const getInitials = (nom: string, prenom: string) => {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

// Schéma de validation pour les utilisateurs
const userFormSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  role: z.string().min(1, "Le rôle est requis"),
  email: z.string().email("Veuillez entrer une adresse email valide")
});

type UserFormValues = z.infer<typeof userFormSchema>;

function UserCard({ user, onEdit, onDelete }: { user: any, onEdit: (user: any) => void, onDelete: (userId: number) => void }) {

  // Fonction pour obtenir la couleur de badge en fonction du rôle
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "directeur":
        return "default";
      case "responsable_travaux":
      case "responsable_etude":
        return "outline";
      case "conducteur_travaux":
        return "secondary";
      case "service_interne":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Formatter le nom du rôle pour l'affichage
  const formatRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      "directeur": "Directeur",
      "responsable_travaux": "Resp. Travaux",
      "responsable_etude": "Resp. Étude",
      "conducteur_travaux": "Conducteur",
      "service_interne": "Service Interne",
      "assistante_conductrice": "Assistante",
      "geometre_projeteur": "Géomètre"
    };

    return roleMap[role] || role;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.avatar || undefined} alt={`${user.prenom} ${user.nom}`} />
              <AvatarFallback>{getInitials(user.nom, user.prenom)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.prenom} {user.nom}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">@{user.username}</p>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {formatRoleName(user.role)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UserForm({ defaultValues, onSubmit, onCancel }: { 
  defaultValues?: UserFormValues,
  onSubmit: (values: UserFormValues) => void,
  onCancel: () => void 
}) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultValues || {
      username: "",
      password: "",
      nom: "",
      prenom: "",
      role: "",
      email: ""
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input placeholder="Nom d'utilisateur" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input placeholder="Mot de passe" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="directeur">Directeur</SelectItem>
                  <SelectItem value="responsable_travaux">Responsable Travaux</SelectItem>
                  <SelectItem value="responsable_etude">Responsable Étude</SelectItem>
                  <SelectItem value="conducteur_travaux">Conducteur Travaux</SelectItem>
                  <SelectItem value="service_interne">Service Interne</SelectItem>
                  <SelectItem value="assistante_conductrice">Assistante Conductrice</SelectItem>
                  <SelectItem value="geometre_projeteur">Géomètre Projeteur</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Schéma de validation pour les équipes
const equipeFormSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  responsableId: z.number().nullable().optional()
});

type EquipeFormValues = z.infer<typeof equipeFormSchema>;

function EquipeForm({ defaultValues, users, onSubmit, onCancel }: { 
  defaultValues?: EquipeFormValues,
  users: any[],
  onSubmit: (values: EquipeFormValues) => void,
  onCancel: () => void 
}) {
  const form = useForm<EquipeFormValues>({
    resolver: zodResolver(equipeFormSchema),
    defaultValues: defaultValues || {
      nom: "",
      description: "",
      responsableId: null
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de l'équipe</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'équipe" {...field} />
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
                <Input placeholder="Description de l'équipe" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="responsableId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                value={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un responsable (optionnel)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">Aucun responsable</SelectItem>
                  {users.map((user) => (
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
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}

function EquipeMembersManagement({ equipe, allUsers, onSave, onCancel }: {
  equipe: any,
  allUsers: any[],
  onSave: (members: number[]) => void,
  onCancel: () => void
}) {
  // Créer un Set des IDs des membres actuels
  const initialMemberIds = equipe.membres?.map((m: any) => m.userId) || [];
  const currentMemberIds = new Set<number>(initialMemberIds);
  
  // État pour suivre les membres sélectionnés
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(currentMemberIds);
  
  // Filtrer les utilisateurs qui ne sont pas déjà membres
  const nonMembers = allUsers.filter(user => !currentMemberIds.has(user.id));
  
  // Fonction pour basculer la sélection d'un utilisateur
  const toggleUserSelection = (userId: number) => {
    const newSelection = new Set(selectedMemberIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedMemberIds(newSelection);
  };

  // Fonction pour vérifier si un utilisateur est sélectionné
  const isUserSelected = (userId: number) => selectedMemberIds.has(userId);
  
  // Fonction pour gérer la sauvegarde
  const handleSave = () => {
    onSave(Array.from(selectedMemberIds));
  };
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Membres actuels</h3>
        {equipe.membres && equipe.membres.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {equipe.membres.map((membre: any) => (
              <div 
                key={membre.userId} 
                className={`flex items-center justify-between p-2 border rounded-md ${
                  isUserSelected(membre.userId) ? "border-primary" : "border-gray-200"
                }`}
              >
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>
                      {getInitials(membre.user.nom, membre.user.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {membre.user.prenom} {membre.user.nom}
                  </span>
                </div>
                <Checkbox 
                  checked={isUserSelected(membre.userId)}
                  onCheckedChange={() => toggleUserSelection(membre.userId)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun membre dans cette équipe</p>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Ajouter des membres</h3>
        {nonMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto">
            {nonMembers.map(user => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-2 border rounded-md ${
                  isUserSelected(user.id) ? "border-primary" : "border-gray-200"
                }`}
              >
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback>
                      {getInitials(user.nom, user.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {user.prenom} {user.nom}
                  </span>
                </div>
                <Checkbox 
                  checked={isUserSelected(user.id)}
                  onCheckedChange={() => toggleUserSelection(user.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Tous les utilisateurs sont déjà membres de cette équipe</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

// Schéma de validation pour les types de tâches
const taskTypeFormSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().optional(),
  couleur: z.string().optional(),
});

type TaskTypeFormValues = z.infer<typeof taskTypeFormSchema>;

// Composant pour le formulaire des types de tâches
function TaskTypeForm({ defaultValues, onSubmit, onCancel }: { 
  defaultValues?: TaskTypeFormValues,
  onSubmit: (values: TaskTypeFormValues) => void,
  onCancel: () => void 
}) {
  const form = useForm<TaskTypeFormValues>({
    resolver: zodResolver(taskTypeFormSchema),
    defaultValues: defaultValues || {
      nom: "",
      description: "",
      couleur: "#6E56CF" // Couleur par défaut
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du type</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Conception, Exécution, Validation..." {...field} />
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
                <Input placeholder="Description du type de tâche" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="couleur"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur</FormLabel>
              <div className="flex items-center space-x-2">
                <Input type="color" {...field} value={field.value || "#6E56CF"} className="w-12 h-10 p-1" />
                <Input {...field} value={field.value || "#6E56CF"} placeholder="#RRGGBB" className="flex-1" />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function AdminPage() {
  const { toast } = useToast();
  // États pour la gestion des utilisateurs
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // États pour la gestion des équipes
  const [isAddEquipeDialogOpen, setIsAddEquipeDialogOpen] = useState(false);
  const [isEditEquipeDialogOpen, setIsEditEquipeDialogOpen] = useState(false);
  const [isDeleteEquipeDialogOpen, setIsDeleteEquipeDialogOpen] = useState(false);
  const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false);
  const [selectedEquipe, setSelectedEquipe] = useState<any | null>(null);
  const [deletingEquipeId, setDeletingEquipeId] = useState<number | null>(null);
  
  // États pour la gestion des types de tâches
  const [isAddTaskTypeDialogOpen, setIsAddTaskTypeDialogOpen] = useState(false);
  const [isEditTaskTypeDialogOpen, setIsEditTaskTypeDialogOpen] = useState(false);
  const [isDeleteTaskTypeDialogOpen, setIsDeleteTaskTypeDialogOpen] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<any | null>(null);
  const [deletingTaskTypeId, setDeletingTaskTypeId] = useState<number | null>(null);

  // Chargement des utilisateurs
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/users');
      return await response.json();
    }
  });
  
  // Chargement des équipes
  const { data: equipes, isLoading: isLoadingEquipes, error: errorEquipes } = useQuery({
    queryKey: ['/api/equipes'],
    queryFn: async () => {
      const response = await apiRequest('/api/equipes');
      return await response.json();
    }
  });
  
  // Chargement des types de tâches
  const { data: taskTypes, isLoading: isLoadingTaskTypes, error: errorTaskTypes } = useQuery({
    queryKey: ['/api/parametres/types-taches'],
    queryFn: async () => {
      const response = await apiRequest('/api/parametres?categorie=types_taches');
      const params = await response.json();
      
      // Transformer les paramètres en types de tâches structurés
      return params.map((param: any) => {
        // Essayer de parser la valeur JSON
        let typeData = { nom: "", description: "", couleur: "#6E56CF" };
        try {
          typeData = JSON.parse(param.valeur);
        } catch (e) {
          // Si pas au format JSON, utiliser la valeur comme nom
          typeData.nom = param.valeur;
        }
        
        return {
          id: param.id,
          nom: typeData.nom,
          description: typeData.description || "",
          couleur: typeData.couleur || "#6E56CF",
          cle: param.cle
        };
      });
    }
  });

  // Mutation pour ajouter un utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      const response = await apiRequest('/api/users', 'POST', userData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
        variant: "default",
      });
      setIsAddUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la création de l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues & { id: number }) => {
      const { id, ...data } = userData;
      const response = await apiRequest(`/api/users/${id}`, 'PATCH', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès",
        variant: "default",
      });
      setIsEditUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour de l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest(`/api/users/${userId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
        variant: "default",
      });
      setIsDeleteUserDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression de l'utilisateur: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Gérer l'édition d'un utilisateur
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = (userId: number) => {
    setDeletingUserId(userId);
    setIsDeleteUserDialogOpen(true);
  };

  // Gérer la soumission du formulaire d'ajout
  const handleAddUserSubmit = (values: UserFormValues) => {
    createUserMutation.mutate(values);
  };

  // Gérer la soumission du formulaire d'édition
  const handleEditUserSubmit = (values: UserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ ...values, id: selectedUser.id });
    }
  };

  // Confirmer la suppression d'un utilisateur
  const confirmDeleteUser = () => {
    if (deletingUserId) {
      deleteUserMutation.mutate(deletingUserId);
    }
  };

  // Mutation pour ajouter une équipe
  const createEquipeMutation = useMutation({
    mutationFn: async (equipeData: EquipeFormValues) => {
      const response = await apiRequest('/api/equipes', 'POST', equipeData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Équipe créée",
        description: "L'équipe a été créée avec succès",
        variant: "default",
      });
      setIsAddEquipeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la création de l'équipe: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour mettre à jour une équipe
  const updateEquipeMutation = useMutation({
    mutationFn: async (equipeData: EquipeFormValues & { id: number }) => {
      const { id, ...data } = equipeData;
      const response = await apiRequest(`/api/equipes/${id}`, 'PUT', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Équipe mise à jour",
        description: "L'équipe a été mise à jour avec succès",
        variant: "default",
      });
      setIsEditEquipeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour de l'équipe: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer une équipe
  const deleteEquipeMutation = useMutation({
    mutationFn: async (equipeId: number) => {
      await apiRequest(`/api/equipes/${equipeId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Équipe supprimée",
        description: "L'équipe a été supprimée avec succès",
        variant: "default",
      });
      setIsDeleteEquipeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression de l'équipe: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour gérer les membres d'une équipe
  const updateEquipeMembersMutation = useMutation({
    mutationFn: async ({ equipeId, membres }: { equipeId: number, membres: number[] }) => {
      const response = await apiRequest(`/api/equipes/${equipeId}/membres`, 'POST', { membres });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Membres mis à jour",
        description: "Les membres de l'équipe ont été mis à jour avec succès",
        variant: "default",
      });
      setIsManageMembersDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour des membres: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Gérer l'édition d'une équipe
  const handleEditEquipe = (equipe: any) => {
    setSelectedEquipe(equipe);
    setIsEditEquipeDialogOpen(true);
  };

  // Gérer la suppression d'une équipe
  const handleDeleteEquipe = (equipeId: number) => {
    setDeletingEquipeId(equipeId);
    setIsDeleteEquipeDialogOpen(true);
  };

  // Gérer la gestion des membres d'une équipe
  const handleManageMembers = (equipe: any) => {
    setSelectedEquipe(equipe);
    setIsManageMembersDialogOpen(true);
  };

  // Gérer la soumission du formulaire d'ajout d'équipe
  const handleAddEquipeSubmit = (values: EquipeFormValues) => {
    createEquipeMutation.mutate(values);
  };

  // Gérer la soumission du formulaire d'édition d'équipe
  const handleEditEquipeSubmit = (values: EquipeFormValues) => {
    if (selectedEquipe) {
      updateEquipeMutation.mutate({ ...values, id: selectedEquipe.id });
    }
  };

  // Confirmer la suppression d'une équipe
  const confirmDeleteEquipe = () => {
    if (deletingEquipeId) {
      deleteEquipeMutation.mutate(deletingEquipeId);
    }
  };

  // Gérer la sauvegarde des membres d'une équipe
  const handleSaveEquipeMembers = (members: number[]) => {
    if (selectedEquipe) {
      updateEquipeMembersMutation.mutate({ 
        equipeId: selectedEquipe.id, 
        membres: members 
      });
    }
  };
  
  // Mutation pour ajouter un type de tâche
  const createTaskTypeMutation = useMutation({
    mutationFn: async (taskTypeData: TaskTypeFormValues) => {
      const response = await apiRequest('/api/parametres', 'POST', {
        cle: `type_tache_${taskTypeData.nom.toLowerCase().replace(/\s+/g, '_')}`,
        valeur: JSON.stringify(taskTypeData),
        description: `Type de tâche: ${taskTypeData.nom}`,
        categorie: 'types_taches'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Type de tâche créé",
        description: "Le type de tâche a été créé avec succès",
        variant: "default",
      });
      setIsAddTaskTypeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/parametres/types-taches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la création du type de tâche: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour mettre à jour un type de tâche
  const updateTaskTypeMutation = useMutation({
    mutationFn: async ({ id, ...taskTypeData }: TaskTypeFormValues & { id: number }) => {
      const response = await apiRequest(`/api/parametres/${id}`, 'PUT', {
        valeur: JSON.stringify(taskTypeData),
        description: `Type de tâche: ${taskTypeData.nom}`
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Type de tâche mis à jour",
        description: "Le type de tâche a été mis à jour avec succès",
        variant: "default",
      });
      setIsEditTaskTypeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/parametres/types-taches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour du type de tâche: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour supprimer un type de tâche
  const deleteTaskTypeMutation = useMutation({
    mutationFn: async (taskTypeId: number) => {
      await apiRequest(`/api/parametres/${taskTypeId}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Type de tâche supprimé",
        description: "Le type de tâche a été supprimé avec succès",
        variant: "default",
      });
      setIsDeleteTaskTypeDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/parametres/types-taches'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression du type de tâche: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Handlers pour les types de tâches
  const handleAddTaskTypeSubmit = (values: TaskTypeFormValues) => {
    createTaskTypeMutation.mutate(values);
  };
  
  const handleEditTaskTypeSubmit = (values: TaskTypeFormValues) => {
    if (selectedTaskType) {
      updateTaskTypeMutation.mutate({ ...values, id: selectedTaskType.id });
    }
  };
  
  const confirmDeleteTaskType = () => {
    if (deletingTaskTypeId) {
      deleteTaskTypeMutation.mutate(deletingTaskTypeId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs, les équipes et la configuration de l'application
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="teams">Équipes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un utilisateur</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte utilisateur dans le système
                  </DialogDescription>
                </DialogHeader>
                <UserForm 
                  onSubmit={handleAddUserSubmit} 
                  onCancel={() => setIsAddUserDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <p>Chargement des utilisateurs...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center text-red-500">
                <AlertCircle className="mr-2 h-5 w-5" />
                <p>Une erreur est survenue lors du chargement des utilisateurs</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users?.map((user: any) => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onEdit={handleEditUser} 
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestion des équipes</h2>
            <Button onClick={() => {
              setIsAddEquipeDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une équipe
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingEquipes ? (
              <div className="flex justify-center items-center py-8 col-span-2">
                <p>Chargement des équipes...</p>
              </div>
            ) : errorEquipes ? (
              <div className="flex justify-center items-center py-8 col-span-2">
                <div className="flex items-center text-red-500">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <p>Une erreur est survenue lors du chargement des équipes</p>
                </div>
              </div>
            ) : equipes?.length === 0 ? (
              <div className="flex justify-center items-center py-8 col-span-2">
                <p className="text-gray-500">Aucune équipe n'a été créée</p>
              </div>
            ) : (
              equipes?.map((equipe: any) => (
                <Card key={equipe.id} className="relative overflow-hidden">
                  <CardHeader className="pb-0">
                    <div className="flex justify-between items-start">
                      <CardTitle>{equipe.nom}</CardTitle>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditEquipe(equipe)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEquipe(equipe.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>{equipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Responsable :</span>
                        {equipe.responsable ? (
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarFallback>
                                {getInitials(equipe.responsable.nom, equipe.responsable.prenom)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {equipe.responsable.prenom} {equipe.responsable.nom}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Non assigné</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Membres :</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 px-2"
                            onClick={() => handleManageMembers(equipe)}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Gérer</span>
                          </Button>
                        </div>
                        {equipe.membres && equipe.membres.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {equipe.membres.slice(0, 3).map((membre: any) => (
                              <Avatar key={membre.id} className="h-8 w-8 border-2 border-background">
                                <AvatarFallback className="text-xs">
                                  {getInitials(membre.user.nom, membre.user.prenom)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {equipe.membres.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                +{equipe.membres.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Aucun membre dans cette équipe</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Paramètres généraux</h2>
          </div>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="task-types">Types de tâches</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de l'application</CardTitle>
                  <CardDescription>
                    Configurez les paramètres généraux de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-gray-500 py-6">
                    Fonctionnalité en cours de développement
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="task-types">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Types de tâches</CardTitle>
                      <CardDescription>
                        Gérez les types de tâches disponibles dans l'application
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        // Ouvrir dialogue pour ajouter un type de tâche
                        setIsAddTaskTypeDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un type
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTaskTypes ? (
                    <div className="flex justify-center py-4">
                      <p>Chargement des types de tâches...</p>
                    </div>
                  ) : errorTaskTypes ? (
                    <div className="flex items-center justify-center py-4 text-destructive">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <p>Erreur: Impossible de charger les types de tâches</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {taskTypes && taskTypes.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <p className="text-gray-500">Aucun type de tâche n'a été créé</p>
                        </div>
                      ) : (
                        taskTypes && taskTypes.map((type: any) => (
                          <div key={type.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/20 transition-colors">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-3" 
                                style={{ backgroundColor: type.couleur || "#6E56CF" }}
                              />
                              <Badge variant="outline" className="mr-3 font-medium">
                                {type.nom}
                              </Badge>
                              <span className="text-sm text-gray-500">{type.description}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setSelectedTaskType(type);
                                  setIsEditTaskTypeDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setDeletingTaskTypeId(type.id);
                                  setIsDeleteTaskTypeDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de notification</CardTitle>
                  <CardDescription>
                    Configurez les notifications par email et dans l'application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-gray-500 py-6">
                    Fonctionnalité en cours de développement
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Dialogue de modification d'utilisateur */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm 
              defaultValues={{
                username: selectedUser.username,
                password: "", // Ne pas préremplir le mot de passe pour des raisons de sécurité
                nom: selectedUser.nom,
                prenom: selectedUser.prenom,
                role: selectedUser.role,
                email: selectedUser.email
              }} 
              onSubmit={handleEditUserSubmit} 
              onCancel={() => setIsEditUserDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression d'utilisateur */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'ajout d'équipe */}
      <Dialog open={isAddEquipeDialogOpen} onOpenChange={setIsAddEquipeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une équipe</DialogTitle>
            <DialogDescription>
              Créez une nouvelle équipe et désignez un responsable
            </DialogDescription>
          </DialogHeader>
          <EquipeForm 
            users={users || []} 
            onSubmit={handleAddEquipeSubmit} 
            onCancel={() => setIsAddEquipeDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'édition d'équipe */}
      <Dialog open={isEditEquipeDialogOpen} onOpenChange={setIsEditEquipeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'équipe</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'équipe
            </DialogDescription>
          </DialogHeader>
          {selectedEquipe && (
            <EquipeForm 
              defaultValues={{
                nom: selectedEquipe.nom,
                description: selectedEquipe.description || "",
                responsableId: selectedEquipe.responsableId || null
              }} 
              users={users || []}
              onSubmit={handleEditEquipeSubmit} 
              onCancel={() => setIsEditEquipeDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression d'équipe */}
      <Dialog open={isDeleteEquipeDialogOpen} onOpenChange={setIsDeleteEquipeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteEquipeDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEquipe}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de gestion des membres d'équipe */}
      <Dialog open={isManageMembersDialogOpen} onOpenChange={setIsManageMembersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gérer les membres de l'équipe</DialogTitle>
            <DialogDescription>
              Ajoutez ou supprimez des membres pour l'équipe {selectedEquipe?.nom}
            </DialogDescription>
          </DialogHeader>
          {selectedEquipe && (
            <EquipeMembersManagement 
              equipe={selectedEquipe}
              allUsers={users || []}
              onSave={handleSaveEquipeMembers}
              onCancel={() => setIsManageMembersDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'ajout de type de tâche */}
      <Dialog open={isAddTaskTypeDialogOpen} onOpenChange={setIsAddTaskTypeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un type de tâche</DialogTitle>
            <DialogDescription>
              Créez un nouveau type de tâche pour l'application
            </DialogDescription>
          </DialogHeader>
          <TaskTypeForm 
            onSubmit={handleAddTaskTypeSubmit} 
            onCancel={() => setIsAddTaskTypeDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'édition de type de tâche */}
      <Dialog open={isEditTaskTypeDialogOpen} onOpenChange={setIsEditTaskTypeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le type de tâche</DialogTitle>
            <DialogDescription>
              Modifiez les informations du type de tâche
            </DialogDescription>
          </DialogHeader>
          {selectedTaskType && (
            <TaskTypeForm 
              defaultValues={{
                nom: selectedTaskType.nom,
                description: selectedTaskType.description || "",
                couleur: selectedTaskType.couleur || "#6E56CF"
              }} 
              onSubmit={handleEditTaskTypeSubmit} 
              onCancel={() => setIsEditTaskTypeDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression de type de tâche */}
      <Dialog open={isDeleteTaskTypeDialogOpen} onOpenChange={setIsDeleteTaskTypeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce type de tâche ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTaskTypeDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTaskType}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}