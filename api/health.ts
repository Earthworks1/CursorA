// Point d'entrée pour l'API de santé (/api/health)
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Si ce n'est pas une requête GET, renvoyer 405 Method Not Allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  // Informations de diagnostic
  const diagnostics = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1' ? true : false,
    node_version: process.version,
    cwd: process.cwd(),
    files: {
      api: false,
      database: false,
      routes: false
    },
    memory: {
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };
  
  // Vérifier l'existence des fichiers clés
  try {
    // Vérifier si le dossier api existe
    await fs.access(path.join(process.cwd(), 'api'));
    diagnostics.files.api = true;
    
    // Vérifier si database.json existe
    await fs.access(path.join(process.cwd(), 'database.json'));
    diagnostics.files.database = true;
    
    // Vérifier si routes.ts existe
    await fs.access(path.join(process.cwd(), 'api', 'routes.ts'));
    diagnostics.files.routes = true;
  } catch (error) {
    // Si une erreur se produit lors de la vérification des fichiers,
    // les valeurs correspondantes dans l'objet diagnostics resteront false
  }
  
  return res.status(200).json(diagnostics);
} 