import { z } from 'zod';

// Schémas Zod pour la validation
export const TaskTypeSchema = z.enum([
  'etude',
  'leve',
  'implantation',
  'recolement',
  'dao',
  'autre'
]);

export const TaskStatusSchema = z.enum([
  'a_planifier',
  'planifie',
  'en_cours',
  'termine',
  'annule'
]);

export const TaskSchema = z.object({
  id: z.string(),
  type: TaskTypeSchema,
  description: z.string({ required_error: 'Requis' }).nonempty('Requis'),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  status: TaskStatusSchema,
  assignedUserId: z.string().nullable(),
  siteId: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const SiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  city: z.string(),
  postalCode: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user']),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

// Types TypeScript inférés des schémas Zod
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type User = z.infer<typeof UserSchema>;

// Types utilitaires
export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type TaskUpdate = Partial<TaskInput>;

// Constantes
export const TaskTypes: TaskType[] = ['etude', 'leve', 'implantation', 'recolement', 'dao', 'autre'];
export const TaskStatuses: TaskStatus[] = ['a_planifier', 'planifie', 'en_cours', 'termine', 'annule'];

export interface TaskFormData {
  type: TaskType;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  status: Task['status'];
} 