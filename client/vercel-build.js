import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('Début du processus de build...');
console.log('Répertoire courant:', __dirname);

// S'assurer que le dossier dist existe
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Répertoire dist créé:', distDir);
}

// Exécuter le build
console.log('Exécution du build Vite...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  console.log('Build Vite terminé avec succès!');
} catch (error) {
  console.error('Erreur pendant le build Vite:', error);
  process.exit(1);
}

// Vérifier que le répertoire dist a bien été créé et contient des fichiers
if (!fs.existsSync(distDir)) {
  console.error(`ERREUR: Le répertoire dist n'existe pas après le build: ${distDir}`);
  process.exit(1);
}

const distFiles = fs.readdirSync(distDir);
console.log('Contenu du répertoire dist:', distFiles);

// Copier les fichiers de configuration
console.log('Copie des fichiers de configuration...');

// Liste des fichiers à copier
const filesToCopy = [
  { src: '_redirects', dest: 'dist/_redirects' },
  { src: '.htaccess', dest: 'dist/.htaccess' },
  { src: 'public/routes.json', dest: 'dist/routes.json' },
  { src: 'public/200.html', dest: 'dist/200.html' }
];

// Copier tous les fichiers
for (const file of filesToCopy) {
  try {
    const srcPath = path.join(__dirname, file.src);
    const destPath = path.join(__dirname, file.dest);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Fichier ${file.src} copié avec succès vers ${file.dest}`);
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

// Créer un index.html spécial avec des scripts de débogage
try {
  const indexContent = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Spiess TP</title>
    <base href="/" />
    <meta name="description" content="Application de gestion de planification pour Spiess SA" />
    <!-- Debug info -->
    <script>
      console.log('Chargement de la page...');
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM chargé');
        console.log('Scripts détectés:', document.scripts.length);
        Array.from(document.scripts).forEach((script, i) => {
          console.log('Script', i, ':', script.src || 'inline');
        });
      });
    </script>
  </head>
  <body>
    <div id="root"></div>
    <!-- Les fichiers compilés par Vite doivent être correctement chargés ici -->
  </body>
</html>`;

  const distIndexPath = path.join(distDir, 'index.html');
  
  // Ne pas remplacer le fichier index.html créé par Vite
  const existingIndex = fs.existsSync(distIndexPath) ? fs.readFileSync(distIndexPath, 'utf8') : null;
  if (!existingIndex) {
    fs.writeFileSync(distIndexPath, indexContent);
    console.log('index.html personnalisé créé car absent.');
  } else {
    console.log('index.html existant préservé.');
    console.log('Contenu du index.html existant:', existingIndex.substring(0, 300) + '...');
  }
} catch (err) {
  console.error('Erreur lors de la vérification/création de index.html personnalisé:', err);
}

console.log('Build terminé avec succès!');
console.log('Répertoire final:', distDir); 