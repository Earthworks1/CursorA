import fs from 'fs';
import path from 'path';

function findEnvVars(dir: string, results = new Set<string>()) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      findEnvVars(full, results);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/process\.env\.([A-Z0-9_]+)/g);
      if (matches) matches.forEach(m => results.add(m.split('.')[2]));
    }
  });
  return results;
}

const appVars = findEnvVars('./app');
const scriptsVars = findEnvVars('./scripts');
const rootVars = findEnvVars('./');

console.log('Variables d\'environnement utilisées dans le code :');
console.log([...new Set([...appVars, ...scriptsVars, ...rootVars])].sort().join('\n')); 