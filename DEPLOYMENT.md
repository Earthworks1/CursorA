# Guide de Déploiement Vercel

Ce document décrit les étapes et les considérations importantes pour déployer l'application sur Vercel.

## Prérequis

- Compte Vercel
- CLI Vercel installée (`npm i -g vercel`)
- Variables d'environnement configurées
- Accès à la base de données
- Compte SMTP configuré

## Variables d'Environnement Requises

Les variables suivantes doivent être configurées dans les paramètres du projet Vercel :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Authentification
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# API
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app/api"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASSWORD="your-smtp-password"

# Sécurité
JWT_SECRET="your-jwt-secret"
COOKIE_SECRET="your-cookie-secret"

# Environnement
NODE_ENV="production"

DATABASE_URL_UNPOOLED=postgres://postgres:postgres@localhost:5432/spiess_planning?schema=public
```

## Étapes de Déploiement

1. **Préparation**
   ```bash
   # Installer les dépendances
   npm install

   # Vérifier la configuration
   npm run check-deploy

   # Vérifier les migrations de base de données
   npm run db:push
   ```

2. **Déploiement via CLI**
   ```bash
   # Se connecter à Vercel
   vercel login

   # Déployer en prévisualisation
   vercel

   # Déployer en production
   vercel --prod
   ```

3. **Déploiement via GitHub**
   - Connecter le repository GitHub à Vercel
   - Configurer les variables d'environnement
   - Activer le déploiement automatique
   - Configurer les branches protégées

## Configuration Vercel

Le fichier `vercel.json` contient la configuration suivante :

- Configuration CORS pour les routes API
- Région de déploiement : Europe (fra1)
- Configuration des fonctions serverless
- Headers de sécurité
- Cache et performance
- Intégration GitHub

## Optimisations de Performance

1. **Cache**
   - Utilisation du cache Vercel
   - Configuration des headers Cache-Control
   - Mise en cache des assets statiques

2. **Images**
   - Utilisation de next/image
   - Optimisation automatique des images
   - Chargement différé (lazy loading)

3. **Code**
   - Code splitting automatique
   - Tree shaking
   - Minification

## Dépannage Courant

### 1. Erreurs de Build
- Vérifier les logs de build dans Vercel
- S'assurer que toutes les dépendances sont dans `package.json`
- Vérifier la configuration TypeScript
- Vérifier les limites de mémoire

### 2. Erreurs d'API
- Vérifier les logs des fonctions serverless
- S'assurer que les variables d'environnement sont correctement configurées
- Vérifier les permissions CORS
- Vérifier les timeouts

### 3. Problèmes de Performance
- Optimiser les images et les assets
- Utiliser le cache Vercel
- Configurer ISR (Incremental Static Regeneration)
- Surveiller les métriques de performance

### 4. Problèmes de Base de Données
- Vérifier la connexion à la base de données
- S'assurer que les credentials sont corrects
- Vérifier les limites de connexion
- Surveiller les requêtes lentes

## Bonnes Pratiques

1. **Sécurité**
   - Ne jamais exposer les secrets dans le code
   - Utiliser les secrets Vercel pour les informations sensibles
   - Mettre à jour régulièrement les dépendances
   - Configurer les headers de sécurité
   - Utiliser HTTPS

2. **Performance**
   - Utiliser le cache Vercel
   - Optimiser les images
   - Minimiser les bundles JavaScript
   - Utiliser le code splitting
   - Surveiller les métriques de performance

3. **Monitoring**
   - Configurer les alertes Vercel
   - Utiliser les logs pour le débogage
   - Surveiller les métriques de performance
   - Configurer les notifications d'erreur

4. **Maintenance**
   - Mettre à jour régulièrement les dépendances
   - Tester les déploiements en pré-production
   - Sauvegarder régulièrement les données
   - Documenter les changements

## Ressources Utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Guide de déploiement Next.js](https://nextjs.org/docs/deployment)
- [Configuration des variables d'environnement](https://vercel.com/docs/environment-variables)
- [Optimisation des performances](https://vercel.com/docs/optimizations)
- [Monitoring et alertes](https://vercel.com/docs/monitoring) 