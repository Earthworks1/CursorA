import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Exécuter le build
console.log('Exécution du build Vite...');
execSync('npm run build', { stdio: 'inherit' });

// S'assurer que le dossier dist existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copier les fichiers de configuration
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

// Copier vercel.json à la racine (nécessaire pour le déploiement)
try {
  const vercelSrc = path.join(rootDir, 'vercel.json');
  const vercelDest = path.join(rootDir, 'vercel.json.backup');
  
  // Faire une sauvegarde et copier
  if (fs.existsSync(vercelSrc)) {
    fs.copyFileSync(vercelSrc, vercelDest);
    console.log('Sauvegarde de vercel.json effectuée.');
  }
} catch (err) {
  console.error('Erreur lors de la sauvegarde de vercel.json:', err);
}

// Créer un index.html spécial qui assure le routage SPA
try {
  const indexContent = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Spiess Planning</title>
    <base href="/" />
    <meta name="description" content="Application de gestion de planification pour Spiess SA" />
    <!-- Debug info -->
    <script>
      console.log('Chargement de la page...');
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM chargé');
      });
    </script>
  </head>
  <body>
    <div id="root"></div>
    <!-- Fichiers générés par Vite seront automatiquement injectés ici -->
  </body>
</html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), indexContent);
  console.log('index.html personnalisé créé avec script de routage SPA.');
  
  // Copier aussi à la racine du projet
  fs.writeFileSync(path.join(rootDir, 'index.html'), indexContent);
  console.log('index.html copié à la racine du projet.');
} catch (err) {
  console.error('Erreur lors de la création de index.html personnalisé:', err);
}

console.log('Build terminé avec succès!'); 