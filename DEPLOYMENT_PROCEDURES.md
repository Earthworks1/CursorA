# Procédures de Déploiement

## Déploiement Automatique avec GitHub et Vercel

Le projet est configuré pour un déploiement automatique via Vercel. Voici les étapes à suivre :

### 1. Vérifications Pré-déploiement
```bash
# Vérifier que tout est prêt pour le déploiement
npm run check-deploy
```

### 2. Processus Standard
1. Faire un commit des changements :
   ```bash
   git add .
   git commit -m "description des changements"
   ```

2. Pousser sur GitHub :
   ```bash
   git push
   ```

3. Le déploiement se déclenche automatiquement :
   - Vercel détecte les changements sur GitHub
   - Le build est lancé automatiquement
   - L'intégration avec Neon est gérée automatiquement
   - Le site est mis à jour une fois le build réussi

### 3. Optimisations Automatiques
- **Cache** :
  - Assets statiques mis en cache automatiquement
  - Headers Cache-Control configurés
  - Images optimisées via next/image
  - Mise en cache des requêtes API avec React Query

- **Sécurité** :
  - Headers de sécurité configurés
  - CORS correctement paramétré
  - Protection XSS activée
  - Variables d'environnement sécurisées

- **Performance** :
  - Code splitting automatique
  - Tree shaking activé
  - Compression des assets
  - Optimisation des images
  - Mise en cache des données

### 4. Variables d'Environnement
- Gérées automatiquement par Vercel :
  - NEXTAUTH_URL
  - NEXTAUTH_SECRET
  - Autres variables selon .env.example
  - Intégration Neon automatique

### 5. Base de Données
- L'intégration Neon est automatique
- Pas besoin de configuration manuelle
- Les migrations sont appliquées automatiquement
- Les connexions sont optimisées

### 6. Surveillance
- Vérifier les logs Vercel après déploiement
- Surveiller les métriques de performance
- Configurer les alertes si nécessaire
- Suivre les erreurs en temps réel

### 7. Résolution des Problèmes
1. **Erreurs de Build** :
   - Vérifier les logs Vercel
   - Exécuter `npm run check-deploy` localement
   - S'assurer que tous les tests passent
   - Vérifier la configuration Next.js

2. **Problèmes de Base de Données** :
   - Vérifier l'intégration Neon dans Vercel
   - Vérifier les migrations
   - Contrôler les connexions
   - Surveiller les performances

3. **Problèmes de Performance** :
   - Utiliser l'outil Analytics de Vercel
   - Vérifier les métriques Web Vitals
   - Optimiser selon les recommandations
   - Mettre en cache les données fréquentes

### 8. Maintenance
- Mettre à jour les dépendances régulièrement
- Vérifier les vulnérabilités avec `npm audit`
- Maintenir la documentation à jour
- Optimiser les performances

### 9. Hooks Husky
Le projet utilise Husky pour vérifier la qualité du code avant chaque push :

- **Comportement normal** :
  - Husky vérifie le build
  - Exécute les tests
  - Vérifie le linting
  - Si tout est OK, le push est autorisé

- **En cas d'urgence** :
  - Les hooks peuvent être temporairement désactivés :
    ```bash
    git push --no-verify
    ```
  - ⚠️ À utiliser avec précaution
  - Seulement si vous êtes sûr de vos changements
  - Préférez corriger les erreurs plutôt que de contourner les vérifications

### 10. Intégrations Automatiques
- **Neon Database** :
  - Intégration automatique avec Vercel
  - Pas besoin de configuration manuelle
  - Les variables d'environnement sont gérées par Vercel
  - Voir [NEON_VERCEL_INTEGRATION.md](./NEON_VERCEL_INTEGRATION.md) pour plus de détails

### 11. Bonnes Pratiques
1. **Avant de pusher** :
   - Tester localement
   - Vérifier les changements avec `git status`
   - S'assurer que les tests passent
   - Vérifier la configuration Next.js

2. **Messages de commit** :
   - Utiliser des messages clairs et descriptifs
   - Suivre les conventions de commit
   - Inclure le numéro de ticket si applicable
   - Documenter les changements importants

3. **En cas d'erreur** :
   - Vérifier les logs Vercel
   - Consulter le build status sur GitHub
   - Corriger les erreurs avant de re-pusher
   - Mettre à jour la documentation 