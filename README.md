# Spiess Planning

Application de planification et de gestion de projet pour Spiess SA.

## Fonctionnalités

- 📊 Vue Gantt interactive pour la planification des tâches
- 🔥 Heatmap de charge de travail
- 👥 Gestion des équipes et des ressources
- 📈 Suivi de la progression des projets
- 🔄 Drag & drop pour la réorganisation des tâches
- 📱 Interface responsive et moderne

## Technologies utilisées

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Neon Database (PostgreSQL)
- React DnD pour le drag & drop

## Prérequis

- Node.js 18+
- pnpm
- Compte Neon Database

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-org/spiess-planning.git
cd spiess-planning
```

2. Installer les dépendances :
```bash
pnpm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
```
Remplir les variables dans `.env.local` avec vos informations.

4. Générer et exécuter les migrations :
```bash
pnpm db:generate
pnpm db:migrate
```

5. Lancer le serveur de développement :
```bash
pnpm dev
```

## Scripts disponibles

- `pnpm dev` : Lance le serveur de développement
- `pnpm build` : Compile l'application pour la production
- `pnpm start` : Lance l'application en production
- `pnpm lint` : Vérifie le code avec ESLint
- `pnpm test` : Lance les tests
- `pnpm db:generate` : Génère les migrations
- `pnpm db:migrate` : Exécute les migrations
- `pnpm db:studio` : Lance l'interface Drizzle Studio

## Structure du projet

```
spiess-planning/
├── app/                    # Application Next.js
│   ├── api/               # API Routes
│   ├── components/        # Composants React
│   └── styles/           # Styles CSS
├── lib/                   # Utilitaires et configuration
│   ├── db.ts             # Configuration de la base de données
│   └── schema.ts         # Schéma de la base de données
├── scripts/              # Scripts utilitaires
└── public/              # Fichiers statiques
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 