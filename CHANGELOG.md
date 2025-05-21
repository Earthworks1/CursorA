# Changelog

## [Non publié]

### Configuration de la base de données
- Configuration initiale de Drizzle ORM avec PostgreSQL
- Correction des problèmes de configuration :
  - Modification du driver de "pg" à "pglite"
  - Correction de la configuration des credentials (utilisation de `url` au lieu de `connectionString`)
  - Mise à jour du schéma de la base de données pour utiliser `gen_random_uuid()` pour les IDs

### Mise à jour des composants client
- Ajout de la directive "use client" aux composants suivants :
  - `Gantt.tsx` - Utilise useState et useRef
  - `Heatmap.tsx` - Utilise useState, useEffect et useCallback
  - `hover-card.tsx` - Utilise des composants Radix UI
  - `toggle.tsx` - Utilise des composants Radix UI
  - `table.tsx` - Utilise des refs React
  - `toggle-group.tsx` - Utilise des composants Radix UI
- Vérification complète de tous les composants utilisant des hooks React ou des APIs navigateur
- Résolution des problèmes de build liés aux composants serveur

### Vérification des directives 'use client'
- Vérification complète de tous les composants pour la directive 'use client' :
  - ✅ `app/components/ui/form.tsx`
  - ✅ `app/providers.tsx`
  - ✅ `app/components/layout/main-layout.tsx`
  - ✅ `app/components/layout/sidebar.tsx`
  - ✅ `app/page.tsx`
  - ✅ `app/planning/page.tsx`
  - ✅ `app/chantiers/page.tsx`
  - ✅ `app/taches/page.tsx`
  - ✅ `app/equipes/page.tsx`
  - ✅ `app/ressources/page.tsx`
  - ✅ `app/rapports/page.tsx`
  - ✅ `app/configuration/page.tsx`
  - ✅ `app/mon-compte/page.tsx`
  - ✅ `app/dashboard/page.tsx`
  - ✅ `app/arborescence/page.tsx`
- Confirmation que tous les composants utilisant des hooks React ou des APIs navigateur ont la directive appropriée
- Aucune modification nécessaire, tous les composants sont correctement configurés

### Schéma de la base de données
- Création des tables principales :
  - `tasks` : Gestion des tâches avec champs pour le titre, description, dates, type et statut
  - `resources` : Gestion des ressources avec champs pour le titre et le type
  - `users` : Gestion des utilisateurs avec rôles (admin, user, manager)
  - `teams` : Gestion des équipes avec liste des membres
  - `projects` : Gestion des projets avec dates et statuts
- Ajout des relations entre les tables
- Configuration des timestamps automatiques (createdAt, updatedAt)
- Amélioration des types de données :
  - Utilisation de `varchar` avec longueur limitée pour les titres et types
  - Ajout de contraintes sur les statuts et rôles
  - Configuration des clés primaires avec `gen_random_uuid()`

### API
- Mise en place des routes API pour les tâches :
  - GET : Récupération de toutes les tâches
  - POST : Création d'une nouvelle tâche
  - PUT : Mise à jour d'une tâche existante
  - DELETE : Suppression d'une tâche

### Interface utilisateur
- Refonte du composant TaskList pour une meilleure présentation des tâches
- Ajout de badges pour le statut et le type des tâches
- Intégration de la localisation française pour les dates

### Configuration du projet
- Mise en place de React Query avec configuration optimisée
- Ajout des outils de développement (ReactQueryDevtools)
- Configuration du thème et des styles avec Tailwind CSS 

## [Correction 2025-04-23]

### Correction critique backend
- Correction d'une erreur SQL dans l'API `/api/taches` :
  - Remplacement de `ORDER BY date_creation DESC` par `ORDER BY created_at DESC` pour correspondre au schéma Neon.
  - Résolution de l'erreur 500 lors de la récupération des tâches.
- Vérification de la configuration Neon/Vercel (aucune modification nécessaire côté connexion).

### Procédure
- Redémarrage du serveur de développement pour valider la correction.
- Prêt pour déploiement via GitHub (Vercel gère l'intégration Neon automatiquement).

## [Correction 2025-04-24]

### Optimisation de la configuration Next.js
- Suppression du fichier `next.config.js` redondant
- Utilisation exclusive de `next.config.mjs` avec configuration optimisée :
  - Configuration des images avec support des formats avancés
  - Optimisation du webpack avec aliases correctement configurés
  - Support des packages nécessitant une transpilation
  - Configuration du cache en développement

### Correction des erreurs de build
- Résolution des problèmes d'import du schéma de base de données
- Correction des chemins d'alias pour les imports
- Optimisation de la configuration webpack pour une meilleure résolution des modules

### Déploiement
- Push des modifications vers GitHub
- Déclenchement automatique du déploiement sur Vercel
- Intégration automatique avec Neon Database maintenue 

## [Correction 2025-05-21]

### Alignement schéma Drizzle/Neon
- Correction du schéma Drizzle pour utiliser les colonnes `start_time` et `end_time` au lieu de `start` et `end` dans la table `tasks`.
- Migration automatique appliquée à la base Neon via Drizzle Kit (`npx drizzle-kit push:pg`).
- Correction du bug 500 sur `/api/tasks` en production (Vercel) dû à la colonne manquante.
- Déploiement automatique déclenché sur Vercel après push GitHub. 