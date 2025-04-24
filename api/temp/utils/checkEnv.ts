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

export function checkEnvironmentVariables(): boolean {
  const requiredVars = ['DATABASE_URL'];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
} 