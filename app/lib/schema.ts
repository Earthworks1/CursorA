import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
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
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role', { enum: ['admin', 'user', 'manager'] }).notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  members: jsonb('members').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: text('status', { enum: ['planned', 'in_progress', 'completed'] }).notNull().default('planned'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const resources = pgTable('resources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}); 