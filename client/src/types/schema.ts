import { z } from 'zod';

// Types de base
export const dateSchema = z.string().datetime();

// Schémas pour les ressources
export const ressourceSchema = z.object({
  id: z.string(),
  nom: z.string(),
  prenom: z.string(),
  email: z.string().email(),
  role: z.string(),
  competences: z.array(z.string()),
  disponibilite: z.object({
    debut: z.string(),
    fin: z.string(),
  }),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Schémas pour les tâches
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  resourceId: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Schémas pour le planning
export const planningRessourceSchema = z.object({
  id: z.string(),
  ressourceId: z.string(),
  date: z.string(),
  charge: z.number(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});

// Schémas pour les sous-tâches
export const sousTacheSchema = z.object({
  id: z.number(),
  titre: z.string(),
  completed: z.boolean(),
  tacheId: z.number(),
  created_at: dateSchema,
  updated_at: dateSchema,
});

// Schémas pour les tags
export const tagSchema = z.object({
  id: z.number(),
  nom: z.string(),
  couleur: z.string().optional(),
  created_at: dateSchema,
});

// Types exportés
export type Ressource = z.infer<typeof ressourceSchema>;
export type Task = z.infer<typeof taskSchema>;
export type PlanningRessource = z.infer<typeof planningRessourceSchema>;
export type SousTache = z.infer<typeof sousTacheSchema>;
export type Tag = z.infer<typeof tagSchema>;

// Enums pour faciliter la validation
export const StatutTache = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

export const PrioriteTache = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const TypeRessource = {
  PERSONNEL: 'personnel',
  EQUIPEMENT: 'equipement',
  VEHICULE: 'vehicule',
  MATERIAU: 'materiau',
  OUTIL: 'outil',
  AUTRE: 'autre',
} as const;

export const StatutRessource = {
  DISPONIBLE: 'disponible',
  ASSIGNE: 'assigne',
  INDISPONIBLE: 'indisponible',
  EN_MAINTENANCE: 'en_maintenance',
} as const;

export const RoleUtilisateur = {
  RESPONSABLE_TRAVAUX: "responsable_travaux",
  CONDUCTEUR_TRAVAUX: "conducteur_travaux",
  RESPONSABLE_ETUDE: "responsable_etude",
  DIRECTEUR: "directeur",
  SERVICE_INTERNE: "service_interne",
  ASSISTANTE_CONDUCTRICE: "assistante_conductrice",
  GEOMETRE_PROJETEUR: "geometre_projeteur",
} as const; 