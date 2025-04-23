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