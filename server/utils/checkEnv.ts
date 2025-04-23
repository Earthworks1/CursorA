import { log } from '../vite';

const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'EMAIL_FROM',
  'SESSION_SECRET'
];

export function checkEnvironmentVariables() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    log(`❌ Variables d'environnement manquantes : ${missingVars.join(', ')}`);
    log('⚠️ Veuillez configurer ces variables dans votre environnement ou dans Vercel');
    return false;
  }
  
  log('✅ Toutes les variables d\'environnement requises sont présentes');
  return true;
} 