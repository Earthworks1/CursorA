import { z } from 'zod';

export const TaskTypeSchema = z.enum([
  'etude',
  'leve',
  'implantation',
  'recolement',
  'dao'
]);

export const TaskStatusSchema = z.enum([
  'PLANIFIE',
  'EN_COURS',
  'TERMINE',
  'ANNULE'
]);

export const TaskSchema = z.object({
  id: z.string(),
  type: TaskTypeSchema,
  description: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  status: TaskStatusSchema,
  chantierId: z.string().optional(),
  piloteId: z.string().optional(),
  assignedTo: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TaskType = z.infer<typeof TaskTypeSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type Task = z.infer<typeof TaskSchema>;

// Constantes pour faciliter l'utilisation
export const TASK_TYPES: TaskType[] = ['etude', 'leve', 'implantation', 'recolement', 'dao'];
export const TASK_STATUSES: TaskStatus[] = ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE']; 