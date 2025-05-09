import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status', { enum: ['todo', 'in_progress', 'done'] }).notNull().default('todo'),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  assignedTo: text('assigned_to'),
  tags: jsonb('tags').$type<string[]>(),
  dependencies: jsonb('dependencies').$type<string[]>(),
  progress: integer('progress'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['admin', 'manager', 'user'] }).notNull().default('user'),
  team: text('team'),
  skills: jsonb('skills').$type<string[]>(),
  availability: jsonb('availability').$type<{
    startDate: Date;
    endDate: Date;
    hoursPerDay: number;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  members: jsonb('members').$type<string[]>().notNull(),
  leader: text('leader'),
  description: text('description'),
  skills: jsonb('skills').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status', { enum: ['planning', 'active', 'completed', 'on_hold'] }).notNull().default('planning'),
  tasks: jsonb('tasks').$type<string[]>().notNull(),
  team: text('team'),
  budget: integer('budget'),
  client: text('client'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const resources = pgTable('resources', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: ['human', 'material', 'equipment'] }).notNull(),
  availability: jsonb('availability').$type<{
    startDate: Date;
    endDate: Date;
    quantity: number;
  }>().notNull(),
  cost: integer('cost'),
  skills: jsonb('skills').$type<string[]>(),
  assignedTo: jsonb('assigned_to').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 