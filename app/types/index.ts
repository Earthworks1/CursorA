export interface Chantier {
  id: string;
  nom: string;
  description?: string;
  dateDebut: Date;
  dateFin?: Date;
  statut: 'EN_COURS' | 'TERMINE' | 'ANNULE';
  piloteId: string;
  pilote?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  type: 'etude' | 'leve' | 'implantation' | 'recolement' | 'dao' | 'autre';
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
  chantierId?: string;
  chantier?: Chantier;
  piloteId?: string;
  pilote?: User;
  assignedTo?: string;
  assignedUser?: User;
  createdAt: Date;
  updatedAt: Date;
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
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: number;
  nom: string;
  couleur?: string;
  description?: string;
}

export * from './schema';

// Types pour les filtres de tâches
export type TaskType = 'etude' | 'leve' | 'implantation' | 'recolement' | 'dao' | 'autre';
export type TaskStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE'; 