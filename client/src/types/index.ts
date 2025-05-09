export interface Chantier {
  id: number;
  nom: string;
  description?: string;
  adresse?: string;
  statut: 'actif' | 'termine' | 'en_pause';
  dateDebut: string;
  dateFin?: string;
  budget?: number;
  clientId?: number;
  responsableId?: number;
}

export interface Tache {
  id: number;
  titre: string;
  description?: string;
  statut: 'a_faire' | 'en_cours' | 'termine' | 'en_retard';
  priorite: 'basse' | 'moyenne' | 'haute';
  dateDebut: string;
  dateFin?: string;
  chantierId: number;
  lotId?: number;
  piloteId?: number;
  intervenantId?: number;
  charge?: number;
}

export interface Equipe {
  id: number;
  nom: string;
  description?: string;
  responsableId?: number;
  membres?: number[];
}

export interface Ressource {
  id: number;
  nom: string;
  type: 'humain' | 'materiel';
  disponibilite: 'disponible' | 'occupe' | 'indisponible';
  competences?: string[];
  equipeId?: number;
}

export interface User {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'manager' | 'utilisateur';
}

export interface Tag {
  id: number;
  nom: string;
  couleur?: string;
  description?: string;
} 