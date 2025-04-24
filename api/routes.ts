import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs/promises";
import { parse, startOfWeek, endOfWeek, isValid, parseISO } from 'date-fns';
import crypto from 'crypto';
import { z } from 'zod';

// Section de logging pour diagnostiquer les erreurs de déploiement
try {
  console.log("[routes.ts] Starting imports...");
  console.log(`[routes.ts] Current directory: ${process.cwd()}`);
  console.log(`[routes.ts] File exists (storage.ts): ${fs.access('./storage.ts').then(() => true).catch(() => false)}`);
} catch (e) {
  console.error("[routes.ts] Error in initial diagnostic:", e);
}

// We'll import service functions directly to avoid storage.ts dependency
import { generatePdf } from "./services/pdf";
import { sendNotificationEmail } from "./services/notification";

// Types for tasks, users, and sites
interface Task {
  id: string;
  description: string;
  type: 'leve' | 'conception' | 'implantation' | 'reunion' | 'administratif';
  siteId: string | null;
  assignedUserId: string | null;
  startTime: Date;
  endTime: Date;
  status: 'a_planifier' | 'planifie' | 'en_cours' | 'termine' | 'bloque';
  notes: string | null;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

interface Site {
  id: string;
  name: string;
  location?: string;
  client?: string;
}

// Type pour la structure de la base de données JSON
interface Database {
  tasks: Task[];
  users: User[];
  sites: Site[];
}

// Chemin vers le fichier de base de données JSON
const DB_PATH = path.join(process.cwd(), 'database.json');

// Helper pour lire la base de données JSON
async function readDatabase(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    
    // Parse et conversion des dates
    const db = JSON.parse(data, (key, value) => {
      if ((key === 'startTime' || key === 'endTime' || key === 'createdAt') && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
    
    return db;
  } catch (error) {
    console.error('Erreur lors de la lecture de la base de données:', error);
    return { tasks: [], users: [], sites: [] };
  }
}

// Helper pour écrire dans la base de données JSON
async function writeDatabase(data: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Define schema for task validation
const baseTaskSchema = z.object({
  description: z.string().min(1, "La description est requise"),
  type: z.enum(['leve', 'conception', 'implantation', 'reunion', 'administratif']),
  siteId: z.string().nullable(),
  assignedUserId: z.string().nullable(),
  startTime: z.string().transform((val) => parseISO(val)), // Convertir en Date
  endTime: z.string().transform((val) => parseISO(val)), // Convertir en Date
  status: z.enum(['a_planifier', 'planifie', 'en_cours', 'termine', 'bloque']),
  notes: z.string().nullable(),
}).refine(data => data.endTime >= data.startTime, {
  message: "La date de fin doit être après la date de début",
  path: ["endTime"],
});

// Schema for creation (all fields except id and createdAt)
const createTaskSchema = baseTaskSchema;

// Schema for update (all fields are optional)
const updateTaskSchema = baseTaskSchema.partial();

export async function registerRoutes(app: Express): Promise<Server> {
  // Créer le serveur HTTP
  const httpServer = createServer(app);

  // ====== ROUTE HEALTH CHECK ======
  app.get("/api/health", (req, res) => {
    console.log("[Health Check] Received request for /api/health");
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ====== ROUTES WORKLOAD ======
  
  // GET all tasks
  app.get("/api/workload/tasks", async (req, res) => {
    try {
      const db = await readDatabase();
      let filteredTasks = [...db.tasks];
      
      // Possible filtering
      const { week, userId, status } = req.query;
      
      // Filter by week
      if (typeof week === 'string') {
        try {
          // Parse week string (YYYY-WNN)
          const [yearStr, weekNumberStr] = week.split('-W');
          const year = parseInt(yearStr);
          const weekNumber = parseInt(weekNumberStr);
          
          if (!isNaN(year) && !isNaN(weekNumber) && weekNumber >= 1 && weekNumber <= 53) {
            const targetDate = parse(`${year}-W${weekNumber}-1`, 'YYYY-\'W\'II-i', new Date());
            
            if (isValid(targetDate)) {
              const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
              const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
              
              filteredTasks = filteredTasks.filter(task => {
                if (task.startTime instanceof Date) {
                  return task.startTime >= weekStart && task.startTime <= weekEnd;
                }
                return false;
              });
            }
          }
        } catch (error) {
          console.error('Erreur lors du filtrage par semaine:', error);
        }
      }
      
      // Filter by user
      if (typeof userId === 'string' && userId !== '') {
        filteredTasks = filteredTasks.filter(task => task.assignedUserId === userId);
      }
      
      // Filter by status
      if (typeof status === 'string' && status !== '') {
        filteredTasks = filteredTasks.filter(task => task.status === status);
      }
      
      res.status(200).json(filteredTasks);
    } catch (error) {
      console.error("Error in GET /api/workload/tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });
  
  // GET users
  app.get("/api/workload/users", async (req, res) => {
    try {
      const db = await readDatabase();
      res.json(db.users || []);
    } catch (error) {
      console.error("Error in GET /api/workload/users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // GET sites
  app.get("/api/workload/sites", async (req, res) => {
    try {
      const db = await readDatabase();
      res.json(db.sites || []);
    } catch (error) {
      console.error("Error in GET /api/workload/sites:", error);
      res.status(500).json({ error: "Failed to fetch sites" });
    }
  });
  
  // Create task
  app.post("/api/workload/tasks", async (req, res) => {
    try {
      const taskData = req.body;
      
      // Basic validation
      if (!taskData || !taskData.description || !taskData.type || !taskData.status) {
        return res.status(400).json({ message: 'Données incomplètes' });
      }
      
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        startTime: taskData.startTime ? new Date(taskData.startTime) : new Date(),
        endTime: taskData.endTime ? new Date(taskData.endTime) : new Date(),
      };
      
      const db = await readDatabase();
      db.tasks.push(newTask);
      await writeDatabase(db);
      
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error in POST /api/workload/tasks:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });
  
  // Update task
  app.put("/api/workload/tasks/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;
      const db = await readDatabase();
      const taskIndex = db.tasks.findIndex(t => t.id === id);
      
      if (taskIndex === -1) {
        return res.status(404).json({ message: 'Tâche non trouvée' });
      }
      
      // Update task
      db.tasks[taskIndex] = {
        ...db.tasks[taskIndex],
        ...updateData,
        // Convert dates if provided
        startTime: updateData.startTime ? new Date(updateData.startTime) : db.tasks[taskIndex].startTime,
        endTime: updateData.endTime ? new Date(updateData.endTime) : db.tasks[taskIndex].endTime,
      };
      
      await writeDatabase(db);
      res.status(200).json(db.tasks[taskIndex]);
    } catch (error) {
      console.error(`Error in PUT /api/workload/tasks/:id:`, error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });
  
  // Delete task
  app.delete("/api/workload/tasks/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const db = await readDatabase();
      const initialLength = db.tasks.length;
      
      db.tasks = db.tasks.filter(t => t.id !== id);
      
      if (db.tasks.length === initialLength) {
        return res.status(404).json({ message: 'Tâche non trouvée' });
      }
      
      await writeDatabase(db);
      res.status(200).json({ message: 'Tâche supprimée avec succès' });
    } catch (error) {
      console.error(`Error in DELETE /api/workload/tasks/:id:`, error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  return httpServer;
}
