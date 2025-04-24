// Point d'entrée optimisé pour Vercel Serverless Functions
import express, { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { logInfo, logError } from './_utils';

// Database JSON helpers
const DB_PATH = path.join(process.cwd(), 'database.json');

// Type pour la structure de la base de données JSON
interface Database {
  tasks: any[];
  users: any[];
  sites: any[];
}

// Helper pour lire la base de données JSON
async function readDatabase(): Promise<Database> {
  try {
    const absoluteDbPath = path.resolve(DB_PATH);
    logInfo('readDatabase', `Reading from: ${absoluteDbPath}`);
    const data = await fs.readFile(absoluteDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logError('readDatabase', error);
    return { tasks: [], users: [], sites: [] };
  }
}

// Route handler function
export default async function handler(req: Request, res: Response) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log the request
  logInfo('vercel', `${req.method} ${req.url}`);
  
  try {
    const path = req.url?.split('?')[0];

    // Implement specific API routes
    if (path === '/api/health') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } 
    
    // Routes for workload
    else if (path === '/api/workload/tasks') {
      const db = await readDatabase();
      
      // Simple filtering for GET requests
      if (req.method === 'GET') {
        let filteredTasks = [...db.tasks];
        
        // Filter by status if provided
        if (req.query.status) {
          filteredTasks = filteredTasks.filter(t => t.status === req.query.status);
        }
        
        return res.status(200).json(filteredTasks);
      }
      
      // TODO: Implement other methods (POST, PUT, DELETE)
      
      return res.status(405).json({ message: 'Method not implemented' });
    }
    
    else if (path === '/api/workload/users') {
      const db = await readDatabase();
      return res.status(200).json(db.users);
    }
    
    else if (path === '/api/workload/sites') {
      const db = await readDatabase();
      return res.status(200).json(db.sites);
    }
    
    // Default response for unimplemented routes
    return res.status(404).json({ message: 'Route not found' });
    
  } catch (error) {
    logError('vercel', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 