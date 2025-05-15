#!/usr/bin/env node

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
  '.env.example',
  'tsconfig.json'
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

function checkRequiredFiles() {
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(process.cwd(), file)));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:', missingFiles.join(', '));
    process.exit(1);
  }
}

function checkEnvVariables() {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
    console.warn('These will need to be configured in Vercel');
  }
}

function checkDependencies() {
  const packageJson = require(path.join(process.cwd(), 'package.json'));
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const requiredDeps = [
    'next',
    'react',
    'react-dom',
    '@types/node',
    '@types/react',
    'typescript'
  ];

  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.error('❌ Missing required dependencies:', missingDeps.join(', '));
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

function main() {
  console.log('🔍 Checking deployment requirements...');
  
  checkRequiredFiles();
  checkEnvVariables();
  checkDependencies();
  
  console.log('✅ All deployment checks passed');
}

main(); 