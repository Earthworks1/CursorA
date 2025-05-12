#!/bin/bash
# Script de migration Next.js vers app/

# 1. Créer les dossiers cibles
mkdir -p app/lib app/types app/components app/pages

# 2. Déplacer les utilitaires partagés
mv shared/lib/db.ts app/lib/db.ts
mv shared/lib/schema.ts app/lib/schema.ts

# 3. Déplacer les types
if [ -d client/src/types ]; then mv client/src/types/* app/types/; fi

# 4. Déplacer les composants
if [ -d client/src/components ]; then mv client/src/components/* app/components/; fi

# 5. Déplacer les pages (si elles existent)
if [ -d client/src/pages ]; then mv client/src/pages/* app/pages/; fi

# 6. Nettoyer les anciens dossiers
rm -rf shared
rm -rf client/src/lib
rm -rf client/src/components
rm -rf client/src/pages
rm -rf client/src/types

echo "Migration terminée. Pense à adapter tsconfig.json, next.config.mjs et les imports si besoin."