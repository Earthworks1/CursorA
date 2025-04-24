// api/vercel.js - Spécifique pour le routage Vercel des API
import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse, startOfWeek, endOfWeek } from 'date-fns';

// Activer le mode debug pour voir les logs dans la console Vercel
const DEBUG = true;
const log = msg => DEBUG && console.log(`[VERCEL API] ${msg}`);

log('Initialisation du serveur API pour Vercel');

// Path to the JSON database file
const DB_PATH = join(process.cwd(), 'database.json');

// Données par défaut au cas où la base de données n'est pas accessible
const DEFAULT_DATA = {
  tasks: [],
  users: [
    { id: "user-1", name: "Antoine" },
    { id: "user-2", name: "Lucie" }
  ],
  sites: [
    { id: "site-1", name: "HSP Potier", address: "Quelque part" },
    { id: "site-2", name: "Chantier XYZ", address: "Ailleurs" }
  ]
};

// Helper functions for database operations
function readDatabase() {
  try {
    log(`Lecture de la base de données: ${DB_PATH}`);
    if (!existsSync(DB_PATH)) {
      log('Fichier de base de données introuvable, utilisation des données par défaut');
      return DEFAULT_DATA;
    }
    
    const data = readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(data, (key, value) => {
      if ((key === 'startTime' || key === 'endTime' || key === 'createdAt') && typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });
    log(`Base de données chargée: ${Object.keys(db).join(', ')}`);
    return db;
  } catch (error) {
    log(`Erreur lors de la lecture de la base de données: ${error.message}`);
    return DEFAULT_DATA;
  }
}

// Create Express router for Vercel serverless functions
const app = express();

// Make Express app available to Vercel
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  log(`Requête reçue: ${req.method} ${req.url}`);
  
  // Extract path without query string
  const path = req.url.split('?')[0];
  
  // API routes
  if (path === '/api/health') {
    // Health check endpoint
    return res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      vercel: true
    });
  } 
  else if (path === '/api/workload/tasks') {
    // Get tasks
    try {
      const db = readDatabase();
      let filteredTasks = [...(db.tasks || [])];
      
      // Filter by week, user, status if provided
      const { week, userId, status } = req.query;
      
      // Filter by week
      if (week) {
        log(`Filtrage par semaine: ${week}`);
        try {
          const [yearStr, weekNumberStr] = week.split('-W');
          const year = parseInt(yearStr);
          const weekNumber = parseInt(weekNumberStr);
          
          if (!isNaN(year) && !isNaN(weekNumber)) {
            const targetDate = parse(`${year}-W${weekNumber}-1`, 'YYYY-\'W\'II-i', new Date());
            const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
            
            filteredTasks = filteredTasks.filter(task => {
              const taskDate = new Date(task.startTime);
              return taskDate >= weekStart && taskDate <= weekEnd;
            });
          }
        } catch (error) {
          log(`Erreur lors du filtrage par semaine: ${error.message}`);
        }
      }
      
      // Filter by user
      if (userId) {
        log(`Filtrage par utilisateur: ${userId}`);
        filteredTasks = filteredTasks.filter(task => task.assignedUserId === userId);
      }
      
      // Filter by status
      if (status) {
        log(`Filtrage par statut: ${status}`);
        filteredTasks = filteredTasks.filter(task => task.status === status);
      }
      
      log(`Renvoi de ${filteredTasks.length} tâches`);
      return res.status(200).json(filteredTasks);
    } catch (error) {
      log(`Erreur: ${error.message}`);
      return res.status(500).json({ error: "Impossible de récupérer les tâches", details: error.message });
    }
  }
  else if (path === '/api/workload/users') {
    // Get users
    try {
      const db = readDatabase();
      log(`Renvoi de ${db.users ? db.users.length : 0} utilisateurs`);
      return res.status(200).json(db.users || []);
    } catch (error) {
      log(`Erreur: ${error.message}`);
      return res.status(500).json({ error: "Impossible de récupérer les utilisateurs", details: error.message });
    }
  }
  else if (path === '/api/workload/sites') {
    // Get sites
    try {
      const db = readDatabase();
      log(`Renvoi de ${db.sites ? db.sites.length : 0} sites`);
      return res.status(200).json(db.sites || []);
    } catch (error) {
      log(`Erreur: ${error.message}`);
      return res.status(500).json({ error: "Impossible de récupérer les sites", details: error.message });
    }
  }
  
  // Fallback for all other routes
  log(`Route non gérée: ${req.method} ${path}`);
  return res.status(404).json({ 
    error: "Route non trouvée",
    method: req.method,
    path: path,
    timestamp: new Date().toISOString()
  });
} 