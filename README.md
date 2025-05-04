# Spiess Planning

Application de gestion de planning et de charge de travail.

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL
- React Query
- Radix UI

## Prérequis

- Node.js >= 18.x
- PostgreSQL
- pnpm (recommandé) ou npm

## Installation

1. Cloner le repository :
```bash
git clone [repository-url]
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
Puis éditer `.env.local` avec vos configurations.

4. Initialiser la base de données :
```bash
pnpm db:push
pnpm db:seed
```

## Développement

```bash
pnpm dev
```

## Build

```bash
pnpm build
pnpm start
```

## Tests

```bash
pnpm test
```

## Structure du projet

```
├── app/              # App Router (Next.js 14)
├── components/       # Composants React réutilisables
├── lib/             # Utilitaires et configurations
├── pages/           # Pages et API routes
├── public/          # Fichiers statiques
└── styles/          # Styles globaux
```

## API Routes

- `/api/taches` - Gestion des tâches
- `/api/charge-de-travail-taches` - Charge de travail par tâche
- `/api/charge-de-travail-activites` - Charge de travail par activité
- `/api/charge-de-travail-statistiques` - Statistiques de charge de travail
- `/api/workload/tasks` - Tâches de charge de travail

## Déploiement

Le projet est configuré pour être déployé sur Vercel.

## Licence

MIT 