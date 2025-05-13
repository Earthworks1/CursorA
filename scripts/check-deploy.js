const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// Liste des fichiers et dossiers requis
const requiredFiles = [
  'package.json',
  'vercel.json',
  'next.config.js',
  'src/pages/api',
  'src/types',
  'src/components',
  '.env.example'
];

// Liste des variables d'environnement requises
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_API_URL',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'JWT_SECRET',
  'COOKIE_SECRET'
];

// Taille maximale des bundles (en bytes)
const MAX_BUNDLE_SIZE = 500000; // 500KB

function checkFiles() {
  console.log('🔍 Vérification des fichiers requis...');
  let missingFiles = [];

  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });

  if (missingFiles.length > 0) {
    console.error('❌ Fichiers manquants :');
    missingFiles.forEach(file => console.error(`  - ${file}`));
    process.exit(1);
  }

  console.log('✅ Tous les fichiers requis sont présents');
}

function checkEnvVars() {
  console.log('🔍 Vérification des variables d\'environnement...');
  let missingVars = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes :');
    missingVars.forEach(envVar => console.error(`  - ${envVar}`));
    process.exit(1);
  }

  console.log('✅ Toutes les variables d\'environnement sont présentes');
}

function checkDependencies() {
  console.log('🔍 Vérification des dépendances...');
  try {
    execSync('npm ls --depth=0', { stdio: 'inherit' });
    console.log('✅ Les dépendances sont correctement installées');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des dépendances');
    process.exit(1);
  }
}

function checkTypeScript() {
  console.log('🔍 Vérification TypeScript...');
  try {
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log('✅ La vérification TypeScript est réussie');
  } catch (error) {
    console.error('❌ Erreurs TypeScript détectées');
    process.exit(1);
  }
}

function checkBuild() {
  console.log('🔍 Vérification du build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Le build est réussi');
  } catch (error) {
    console.error('❌ Erreur lors du build');
    process.exit(1);
  }
}

function checkBundleSize() {
  console.log('🔍 Vérification de la taille des bundles...');
  try {
    const output = execSync('npx next build --analyze', { stdio: 'pipe' }).toString();
    const bundleSizes = output.match(/Size: (\d+\.?\d*) kB/g);
    
    if (bundleSizes) {
      bundleSizes.forEach(size => {
        const sizeInBytes = parseFloat(size.match(/(\d+\.?\d*)/)[0]) * 1024;
        if (sizeInBytes > MAX_BUNDLE_SIZE) {
          console.error(`❌ Bundle trop grand: ${size}`);
          process.exit(1);
        }
      });
    }
    console.log('✅ La taille des bundles est acceptable');
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des bundles');
    process.exit(1);
  }
}

function checkSecurity() {
  console.log('🔍 Vérification de la sécurité...');
  try {
    // Vérifier les dépendances vulnérables
    execSync('npm audit', { stdio: 'inherit' });
    
    // Vérifier les secrets exposés
    const files = execSync('git grep -l "password\\|secret\\|key\\|token"', { stdio: 'pipe' }).toString();
    if (files) {
      console.warn('⚠️ Attention: Potentiels secrets détectés dans les fichiers suivants:');
      console.warn(files);
    }
    
    console.log('✅ Vérification de sécurité terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de sécurité');
    process.exit(1);
  }
}

function checkDatabase() {
  console.log('🔍 Vérification de la connexion à la base de données...');
  try {
    // Vérifier la connexion à la base de données
    execSync('npx prisma db push --dry-run', { stdio: 'inherit' });
    console.log('✅ La connexion à la base de données est fonctionnelle');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données');
    process.exit(1);
  }
}

// Exécution des vérifications
console.log('🚀 Début des vérifications pré-déploiement\n');

checkFiles();
checkEnvVars();
checkDependencies();
checkTypeScript();
checkBuild();
checkBundleSize();
checkSecurity();
checkDatabase();

console.log('\n✨ Toutes les vérifications sont réussies ! Le déploiement peut commencer.'); 