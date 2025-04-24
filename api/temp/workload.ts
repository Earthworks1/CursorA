// Point d'entrée Vercel spécifique pour les routes /api/workload/*
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import path from 'path';
import { parse, startOfWeek, endOfWeek, isValid, parseISO } from 'date-fns';
import crypto from 'crypto';

// Type pour la structure de la base de données JSON
interface Database {
  tasks: Task[];
  users: User[];
  sites: Site[];
}

// Interfaces des entités
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

// Gestionnaire de requête principal pour /api/workload/*
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Config CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gestion des requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const path = req.url?.split('/api/workload/')[1]?.split('?')[0] || '';
  console.log(`[workload] Handling request: ${req.method} /api/workload/${path}`);
  
  try {
    // Route tasks
    if (path === 'tasks') {
      if (req.method === 'GET') {
        return handleGetTasks(req, res);
      } else if (req.method === 'POST') {
        return handleCreateTask(req, res);
      } else if (req.method === 'PUT') {
        return handleUpdateTask(req, res);
      } else if (req.method === 'DELETE') {
        return handleDeleteTask(req, res);
      }
    }
    // Route task par ID
    else if (path.startsWith('tasks/')) {
      const taskId = path.split('tasks/')[1];
      if (req.method === 'GET') {
        return handleGetTaskById(req, res, taskId);
      } else if (req.method === 'PUT') {
        return handleUpdateTask(req, res, taskId);
      } else if (req.method === 'DELETE') {
        return handleDeleteTask(req, res, taskId);
      }
    }
    // Route users
    else if (path === 'users') {
      return handleGetUsers(req, res);
    }
    // Route sites
    else if (path === 'sites') {
      return handleGetSites(req, res);
    }
    
    // Route non trouvée
    res.status(404).json({ message: `Route /api/workload/${path} non trouvée` });
  } catch (error) {
    console.error(`Erreur lors du traitement de /api/workload/${path}:`, error);
    res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
  }
}

// Handlers pour chaque route et méthode

async function handleGetTasks(req: VercelRequest, res: VercelResponse) {
  const db = await readDatabase();
  let filteredTasks = [...db.tasks];
  
  // Filtrages possibles
  const { week, userId, status } = req.query;
  
  // Filtrer par semaine
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
  
  // Filtrer par utilisateur
  if (typeof userId === 'string' && userId !== '') {
    filteredTasks = filteredTasks.filter(task => task.assignedUserId === userId);
  }
  
  // Filtrer par statut
  if (typeof status === 'string' && status !== '') {
    filteredTasks = filteredTasks.filter(task => task.status === status);
  }
  
  res.status(200).json(filteredTasks);
}

async function handleGetTaskById(req: VercelRequest, res: VercelResponse, taskId: string) {
  const db = await readDatabase();
  const task = db.tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ message: 'Tâche non trouvée' });
  }
  
  res.status(200).json(task);
}

async function handleCreateTask(req: VercelRequest, res: VercelResponse) {
  console.log('Creating task with data:', req.body);
  
  const taskData = req.body;
  
  // Validation de base
  if (!taskData || !taskData.description || !taskData.type || !taskData.status) {
    console.error('Invalid task data:', taskData);
    return res.status(400).json({ message: 'Données incomplètes' });
  }
  
  try {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      startTime: taskData.startTime ? parseISO(taskData.startTime) : new Date(),
      endTime: taskData.endTime ? parseISO(taskData.endTime) : new Date(),
    };
    
    console.log('Processed new task:', newTask);
    
    const db = await readDatabase();
    db.tasks.push(newTask);
    await writeDatabase(db);
    
    console.log('Task created successfully:', newTask.id);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la tâche', error: error.message });
  }
}

async function handleUpdateTask(req: VercelRequest, res: VercelResponse, taskId?: string) {
  const id = taskId || req.query.id as string;
  
  if (!id) {
    return res.status(400).json({ message: 'ID de tâche manquant' });
  }
  
  const updateData = req.body;
  const db = await readDatabase();
  const taskIndex = db.tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Tâche non trouvée' });
  }
  
  // Mise à jour de la tâche
  db.tasks[taskIndex] = {
    ...db.tasks[taskIndex],
    ...updateData,
    // Conversion des dates si fournies
    startTime: updateData.startTime ? new Date(updateData.startTime) : db.tasks[taskIndex].startTime,
    endTime: updateData.endTime ? new Date(updateData.endTime) : db.tasks[taskIndex].endTime,
  };
  
  await writeDatabase(db);
  res.status(200).json(db.tasks[taskIndex]);
}

async function handleDeleteTask(req: VercelRequest, res: VercelResponse, taskId?: string) {
  const id = taskId || req.query.id as string;
  
  if (!id) {
    return res.status(400).json({ message: 'ID de tâche manquant' });
  }
  
  const db = await readDatabase();
  const initialLength = db.tasks.length;
  
  db.tasks = db.tasks.filter(t => t.id !== id);
  
  if (db.tasks.length === initialLength) {
    return res.status(404).json({ message: 'Tâche non trouvée' });
  }
  
  await writeDatabase(db);
  res.status(204).end();
}

async function handleGetUsers(req: VercelRequest, res: VercelResponse) {
  const db = await readDatabase();
  res.status(200).json(db.users);
}

async function handleGetSites(req: VercelRequest, res: VercelResponse) {
  const db = await readDatabase();
  res.status(200).json(db.sites);
} 