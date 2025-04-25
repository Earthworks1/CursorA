export interface Task {
  id: string; // UUID
  description: string;
  type: 'leve' | 'implantation' | 'recolement' | 'etude' | 'dao' | 'autre';
  siteId: string | null;
  assignedUserId: string | null;
  startTime: Date;
  endTime: Date;
  status: 'a_planifier' | 'planifie' | 'en_cours' | 'termine' | 'bloque';
  notes: string | null;
  createdAt: Date;
}

export interface User {
  id: string; // UUID
  name: string;
}

export interface Site {
  id: string; // UUID
  name: string;
  address: string | null;
} 