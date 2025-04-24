// Fichier d'utilitaires pour faciliter le travail avec Vercel

import path from 'path';
import fs from 'fs/promises';

// Fonction pour vérifier si un module existe
export async function moduleExists(modulePath: string): Promise<boolean> {
  try {
    await fs.access(modulePath);
    return true;
  } catch (error) {
    return false;
  }
}

// Fonction pour résoudre un chemin de module avec différentes extensions
export async function resolveModulePath(basePath: string, moduleName: string): Promise<string | null> {
  // Essayer avec différentes extensions
  const extensions = ['.ts', '.js', '.json', ''];
  
  for (const ext of extensions) {
    const fullPath = path.join(basePath, `${moduleName}${ext}`);
    if (await moduleExists(fullPath)) {
      return fullPath;
    }
  }
  
  return null;
}

// Fonction pour logger les erreurs de manière structurée
export function logError(context: string, error: any): void {
  console.error(`[ERROR] ${context}: ${error.message}`);
  console.error(error.stack);
}

// Fonction pour logger les infos de manière structurée
export function logInfo(context: string, message: string): void {
  console.log(`[INFO] ${context}: ${message}`);
}

// Exporter d'autres utilitaires selon les besoins 