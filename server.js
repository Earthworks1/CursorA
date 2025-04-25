// Ce fichier server.js est utilisé uniquement pour le développement local
// Vercel utilisera les fonctions serverless définies dans le dossier api/
// Pour plus d'informations, consultez la documentation Vercel sur les fonctions serverless

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Détermine l'environnement
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  // En développement, lancez le serveur TypeScript avec tsx
  console.log('Starting development server...');
  
  const command = `"${process.execPath}" "${join(__dirname, 'node_modules', '.bin', 'tsx')}" "${join(__dirname, 'api/index.ts')}"`;
  
  const server = exec(command, {
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.stdout?.pipe(process.stdout);
  server.stderr?.pipe(process.stderr);

  process.on('SIGINT', () => {
    console.log('Shutting down development server...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Shutting down development server...');
    server.kill('SIGTERM');
    process.exit(0);
  });
} else {
  // En production, ce fichier ne sera pas utilisé car Vercel utilisera les fonctions serverless
  console.log('This script is not meant to be run in production.');
  console.log('Vercel will use the serverless functions defined in the api/ directory.');
  process.exit(1);
} 