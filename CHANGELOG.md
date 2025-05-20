# Changelog

## [Non publié]

### Configuration de la base de données
- Configuration initiale de Drizzle ORM avec PostgreSQL
- Correction des problèmes de configuration :
  - Modification du driver de "pg" à "pglite"
  - Correction de la configuration des credentials (utilisation de `url` au lieu de `connectionString`)
  - Mise à jour du schéma de la base de données pour utiliser `gen_random_uuid()` pour les IDs

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