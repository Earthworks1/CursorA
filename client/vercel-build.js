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
console.log('Copie des fichiers de configuration...');

// Liste des fichiers à copier
const filesToCopy = [
  { src: '_redirects', dest: '_redirects' },
  { src: '.htaccess', dest: '.htaccess' },
  { src: 'public/routes.json', dest: 'routes.json' },
  { src: 'public/200.html', dest: '200.html' }
];

// Copier tous les fichiers
for (const file of filesToCopy) {
  try {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(distDir, file.dest);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Fichier ${file.src} copié avec succès.`);
    } else {
      console.warn(`Fichier ${file.src} introuvable, ignoré.`);
    }
  } catch (err) {
    console.error(`Erreur lors de la copie du fichier ${file.src}:`, err);
  }
}

// Créer aussi un index.html à la racine si nécessaire
try {
  const indexPath = path.join(distDir, 'index.html');
  const destPath = path.join(path.dirname(distDir), 'index.html');
  
  if (fs.existsSync(indexPath) && !fs.existsSync(destPath)) {
    fs.copyFileSync(indexPath, destPath);
    console.log('index.html copié au niveau racine pour meilleure compatibilité.');
  }
} catch (err) {
  console.error('Erreur lors de la copie de index.html au niveau racine:', err);
}

console.log('Build terminé avec succès!'); 