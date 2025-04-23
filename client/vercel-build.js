import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exécuter le build
console.log('Exécution du build Vite...');
execSync('npm run build', { stdio: 'inherit' });

// S'assurer que le dossier dist existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copier _redirects dans le dossier de build
console.log('Copie du fichier _redirects...');
try {
  fs.copyFileSync(path.join(__dirname, '_redirects'), path.join(distDir, '_redirects'));
  console.log('Fichier _redirects copié avec succès.');
} catch (err) {
  console.error('Erreur lors de la copie du fichier _redirects:', err);
}

console.log('Build terminé avec succès!'); 