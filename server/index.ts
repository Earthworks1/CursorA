import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkEnvironmentVariables } from "./utils/checkEnv";

// --- Importation pour la librairie pg ---
import { Client } from 'pg';
// ----------------------------------------

const app = express();

// Configuration CORS pour permettre l'accès depuis n'importe quelle origine
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});


// --- Fonction asynchrone principale pour démarrer l'application ---
(async () => {
  // Vérifier les variables d'environnement
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }

  // 1. Récupérer la DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;

  // Vérifier si l'URL a été trouvée (critique, on arrête si non)
  if (!dbUrl) {
    console.error("ERREUR CRITIQUE : La variable d'environnement DATABASE_URL n'a pas été trouvée.");
    console.error("Assurez-vous que la clé 'DATABASE_URL' et sa valeur sont bien présentes dans le panneau Secrets (icône cadenas).");
    process.exit(1); // Arrête le processus Node.js avec un code d'erreur
  }

  // 2. Créer le client de base de données
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false // Souvent nécessaire pour Supabase depuis Replit en dev
    }
  });

  try {
    // 3. Tenter la connexion à la base de données et attendre le résultat
    await client.connect();
    console.log('Connexion à la base de données Supabase réussie !');

    // --- Code pour rendre le client DB disponible pour vos routes ---
    // L'objet 'client' est maintenant connecté.
    // Vous devez le rendre accessible aux gestionnaires de routes qui en ont besoin.
    // Une approche simple (pour le test) : l'ajouter à l'objet 'app' ou 'request' (via middleware)
    // ou mieux, utiliser un Pool de connexions et le passer.
    // Pour l'exemple, nous allons juste le laisser disponible ici pour montrer où l'utiliser ensuite.
    // Une méthode courante est de créer un pool et de l'attacher à 'app.locals' ou de le passer.
    // Exemple (nécessite 'pg'.Pool et une autre organisation du code) :
    // const { Pool } = require('pg');
    // const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    // app.locals.dbPool = pool; // Rendre le pool disponible via app.locals
    // ------------------------------------------------------------------


    // 4. Si la connexion DB réussit, démarrer le reste de l'application
    const server = await registerRoutes(app); // Enregistre les routes API, etc.

    // Middleware de gestion des erreurs global (votre code existant)
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Erreur non gérée :', err); // Loggez l'erreur sur le serveur
      res.status(status).json({ message });
      // Attention: 'throw err;' peut faire planter le processus si l'erreur est émise après les headers
      // Laissez-le si vous voulez que Replit affiche l'erreur et arrête en dev.
      // throw err;
    });


    // 5. Configuration Vite ou servir les fichiers statiques (votre code existant)
    // Assurez-vous que cette partie ne dépend pas de la connexion DB elle-même pour son initialisation,
    // mais seulement pour les requêtes qui seraient faites par la suite.
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // 6. Démarrer le serveur Express en écoute
    const port = 5000; // Port Replit standard
    server.listen({
      port,
      host: "0.0.0.0", // Écouter sur toutes les interfaces
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      // Ici, le serveur Express est prêt et la DB est connectée.
    });

    // Vous devrez implémenter la logique pour fermer la connexion client
    // proprement lorsque l'application s'arrête (par exemple, en écoutant SIGINT/SIGTERM).
    // Ou si vous utilisez un pool, gérer la terminaison du pool.

  } catch (err: any) {
    // 7. Gérer les erreurs critiques (connexion DB, ou erreur pendant le démarrage)
    console.error('ERREUR CRITIQUE lors du démarrage de l\'application (connexion DB ou initialisation serveur) :', err.stack);
    // Assurez-vous de fermer le client si la connexion avait été partiellement établie
    if (client && typeof client.end === 'function') {
        client.end().catch(e => console.error("Erreur lors de la fermeture du client DB:", e));
    }
    process.exit(1); // Arrête le processus car l'initialisation critique a échoué
  }

})(); // Fin de la fonction asynchrone auto-exécutante
