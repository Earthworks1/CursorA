import { z } from 'zod';

// Définition du schéma de tâche
export const taskSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  priorite: z.string().optional(),
  statut: z.string().default("a_faire"),
  dateDebut: z.string().optional().nullable(),
  dateDemande: z.string().optional().nullable(),
  dateRealisation: z.string().optional().nullable(),
  dateLimite: z.string().optional().nullable(),
  intervenants: z.array(z.object({ id: z.number(), nom: z.string() })).optional(),
  piecesJointes: z.array(z.object({ id: z.number(), nom: z.string(), url: z.string() })).optional(),
});

// Définition des types exportés
export type Task = z.infer<typeof taskSchema>;

// Définition du type Tool (ressource)
export type Tool = {
  id: number;
  nom: string;
  type: string;
  cout_horaire?: number;
  statut: string;
};

// Enums pour faciliter la validation
export const StatutTache = {
  A_FAIRE: 'a_faire',
  EN_COURS: 'en_cours',
  EN_VALIDATION: 'en_validation',
  TERMINE: 'termine',
  EN_RETARD: 'en_retard',
  EN_REVISION: 'en_revision'
} as const;

export const PrioriteTache = {
  BASSE: 'basse',
  NORMALE: 'normale',
  HAUTE: 'haute',
  URGENTE: 'urgente'
} as const;

export const TypeTache = {
  ETUDE: 'etude',
  CONCEPTION: 'conception',
  LEVE: 'leve',
  IMPLANTATION: 'implantation',
  RECOLEMENT: 'recolement',
  AUTRE: 'autre'
} as const;

// Types de lots standardisés
export const TypeLot = {
  TERRASSEMENT: "terrassement",
  RESEAUX_SECS: "reseaux_secs",
  RESEAUX_HUMIDES: "reseaux_humides",
  VOIRIE: "voirie",
  VRD: "vrd"
};

export const TypeActivite = {
  CREATION: 'creation',
  MODIFICATION: 'modification',
  VALIDATION: 'validation',
  REVISION: 'revision',
  RETARD: 'retard',
  ASSIGNATION: 'assignation'
} as const;

export const TypeRessource = {
  PERSONNEL: 'personnel',
  EQUIPEMENT: 'equipement',
  VEHICULE: 'vehicule',
  MATERIAU: 'materiau',
  OUTIL: 'outil',
  AUTRE: 'autre'
} as const;

export const StatutRessource = {
  DISPONIBLE: 'disponible',
  ASSIGNE: 'assigne',
  INDISPONIBLE: 'indisponible',
  EN_MAINTENANCE: 'en_maintenance'
} as const;

export const RoleUtilisateur = {
  RESPONSABLE_TRAVAUX: "responsable_travaux",
  CONDUCTEUR_TRAVAUX: "conducteur_travaux",
  RESPONSABLE_ETUDE: "responsable_etude",
  DIRECTEUR: "directeur",
  SERVICE_INTERNE: "service_interne",
  ASSISTANTE_CONDUCTRICE: "assistante_conductrice",
  GEOMETRE_PROJETEUR: "geometre_projeteur"
} as const; 