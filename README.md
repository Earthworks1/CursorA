# Spiess Planning

Application de gestion de planning et de ressources pour Spiess TP.

## Technologies

- **Frontend**: Next.js 14.1.0 (React 18.2.0)
- **Base de données**: PostgreSQL avec Drizzle ORM
- **UI**: Radix UI + Tailwind CSS
- **État**: TanStack Query
- **Validation**: Zod + React Hook Form

## Installation

1. Cloner le repository
2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp database.env.example database.env
cp database_url.env.example database_url.env
```

4. Initialiser la base de données :
```bash
node setup-database.js
```

5. Lancer le développement :
```bash
npm run dev
```

## Structure du Projet

```
spiess-planning/
├── app/                    # Application Next.js (App Router)
│   ├── components/        # Composants réutilisables
│   ├── api/              # Routes API
│   └── (routes)/         # Pages de l'application
├── lib/                   # Utilitaires et configurations
└── scripts/              # Scripts utilitaires
```

## Déploiement

Le déploiement est automatisé via Vercel. Pour plus de détails, voir [DEPLOYMENT.md](DEPLOYMENT.md).

### Prérequis
- Node.js 18+
- PostgreSQL (Neon)
- Variables d'environnement configurées

### Base de données

L'application utilise Neon PostgreSQL. Pour plus d'informations sur l'intégration :
- Configuration : voir [NEON_VERCEL_INTEGRATION.md](NEON_VERCEL_INTEGRATION.md)
- Scripts de migration : `npm run db:migrate`

## Documentation

Pour une documentation détaillée des fonctionnalités :
- [Documentation complète](DOCUMENTATION.md)
- [Procédures de déploiement](DEPLOYMENT_PROCEDURES.md)

## Scripts disponibles

- `npm run dev` : Développement local
- `npm run build` : Build de production
- `npm run start` : Démarrage en production
- `npm run lint` : Vérification du code
- `npm run test` : Tests unitaires

## Points d'attention

1. **Migration App Router**
   - ✅ Migration terminée
   - ✅ Routes API migrées
   - ✅ Configuration unifiée

2. **Optimisations**
   - Utilisation de React.memo() pour les composants lourds
   - Mise en cache avec TanStack Query
   - Build optimisé avec next.config.mjs

3. **Sécurité**
   - Validation des données avec Zod
   - Protection CSRF active
   - Authentification sécurisée

## Maintenance

- Mettre à jour régulièrement les dépendances
- Surveiller les performances via Vercel Analytics
- Maintenir la documentation à jour
- Exécuter les tests avant chaque déploiement

## Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs Vercel
3. Contacter l'équipe de développement

## Licence

Propriétaire - Tous droits réservés © Spiess TP 