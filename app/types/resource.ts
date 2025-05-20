export interface Resource {
  id: string;
  title: string;
  type: 'EMPLOYE' | 'MATERIEL' | 'VEHICULE';
  availability?: {
    start: Date;
    end: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
} 