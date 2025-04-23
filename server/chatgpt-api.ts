import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";

/**
 * Enregistre les routes d'API spécifiques pour l'intégration avec ChatGPT
 * Cette API est conçue pour fournir un accès simplifié aux données de l'application
 */
export function registerChatGptApi(app: Express) {
  // Point d'entrée principal pour l'API ChatGPT
  app.get("/api/chatgpt", (req, res) => {
    res.json({
      message: "API ChatGPT pour Spiess TP Planning - Bienvenue",
      version: "1.0",
      endpoints: [
        "/api/chatgpt/chantiers",
        "/api/chatgpt/taches",
        "/api/chatgpt/utilisateurs",
        "/api/chatgpt/statistiques",
        "/api/chatgpt/recherche",
        "/api/chatgpt/equipes",
        "/api/chatgpt/lots",
        "/api/chatgpt/ressources"
      ]
    });
  });

  // Obtenir la liste des chantiers avec informations détaillées
  app.get("/api/chatgpt/chantiers", async (req, res) => {
    try {
      const chantiers = await storage.getChantiers();
      
      // Enrichir les données avec les informations sur les lots
      const chantiersEnrichis = await Promise.all(chantiers.map(async (chantier) => {
        const lots = await storage.getLotsByChantierId(chantier.id);
        return {
          ...chantier,
          lots: lots
        };
      }));
      
      res.json(chantiersEnrichis);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir les tâches avec informations détaillées
  app.get("/api/chatgpt/taches", async (req, res) => {
    try {
      const statut = req.query.statut as string;
      const priorite = req.query.priorite as string;
      
      const taches = await storage.getTaches();
      
      // Filtrer par statut si spécifié
      let tachesFiltrees = taches;
      if (statut) {
        tachesFiltrees = taches.filter(tache => tache.statut === statut);
      }
      
      // Filtrer par priorité si spécifiée
      if (priorite) {
        tachesFiltrees = tachesFiltrees.filter(tache => tache.priorite === priorite);
      }
      
      // Enrichir avec les informations du chantier et du lot
      const tachesEnrichies = await Promise.all(tachesFiltrees.map(async (tache) => {
        const chantier = await storage.getChantier(tache.chantierId);
        const lot = await storage.getLot(tache.lotId);
        
        let pilote = null;
        if (tache.piloteId) {
          pilote = await storage.getUser(tache.piloteId);
        }
        
        let intervenant = null;
        if (tache.intervenantId) {
          intervenant = await storage.getUser(tache.intervenantId);
        }
        
        return {
          ...tache,
          chantier: chantier ? {
            id: chantier.id,
            nom: chantier.nom
          } : null,
          lot: lot ? {
            id: lot.id,
            nom: lot.nom,
            type: lot.type
          } : null,
          pilote: pilote ? {
            id: pilote.id,
            nom: pilote.nom,
            prenom: pilote.prenom
          } : null,
          intervenant: intervenant ? {
            id: intervenant.id,
            nom: intervenant.nom,
            prenom: intervenant.prenom
          } : null
        };
      }));
      
      res.json(tachesEnrichies);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir les utilisateurs avec leur rôle
  app.get("/api/chatgpt/utilisateurs", async (req, res) => {
    try {
      const users = await storage.getUsers();
      
      // Masquer les mots de passe
      const usersSecurises = users.map(user => ({
        id: user.id,
        username: user.username,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        email: user.email
      }));
      
      res.json(usersSecurises);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir des statistiques générales
  app.get("/api/chatgpt/statistiques", async (req, res) => {
    try {
      const chantiers = await storage.getChantiers();
      const taches = await storage.getTaches();
      const users = await storage.getUsers();
      
      // Calculer les statistiques
      const chantiersActifs = chantiers.filter(c => c.statut === "actif").length;
      const tachesEnCours = taches.filter(t => t.statut === "en_cours").length;
      const tachesTerminees = taches.filter(t => t.statut === "termine").length;
      const tachesEnRetard = taches.filter(t => t.statut === "en_retard").length;
      
      // Statistiques par rôle d'utilisateur
      const usersByRole: Record<string, number> = {};
      users.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
      });
      
      res.json({
        chantiersTotal: chantiers.length,
        chantiersActifs,
        tachesTotal: taches.length,
        tachesEnCours,
        tachesTerminees,
        tachesEnRetard,
        utilisateursTotal: users.length,
        utilisateursParRole: usersByRole
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Recherche multiforme (chantiers, tâches, utilisateurs)
  app.get("/api/chatgpt/recherche", async (req, res) => {
    try {
      const terme = req.query.q as string;
      
      if (!terme || terme.length < 2) {
        return res.status(400).json({ message: "Le terme de recherche doit contenir au moins 2 caractères" });
      }
      
      const termeLower = terme.toLowerCase();
      
      // Recherche dans les chantiers
      const chantiers = await storage.getChantiers();
      const chantiersResultats = chantiers.filter(c => 
        c.nom.toLowerCase().includes(termeLower) || 
        (c.description && c.description.toLowerCase().includes(termeLower)) ||
        (c.adresse && c.adresse.toLowerCase().includes(termeLower))
      );
      
      // Recherche dans les tâches
      const taches = await storage.getTaches();
      const tachesResultats = taches.filter(t => 
        t.titre.toLowerCase().includes(termeLower) || 
        (t.description && t.description.toLowerCase().includes(termeLower))
      );
      
      // Recherche dans les utilisateurs
      const users = await storage.getUsers();
      const usersResultats = users.filter(u => 
        u.nom.toLowerCase().includes(termeLower) || 
        u.prenom.toLowerCase().includes(termeLower) || 
        u.username.toLowerCase().includes(termeLower)
      ).map(user => ({
        id: user.id,
        username: user.username,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }));
      
      res.json({
        chantiers: chantiersResultats,
        taches: tachesResultats,
        utilisateurs: usersResultats,
        total: chantiersResultats.length + tachesResultats.length + usersResultats.length
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir les équipes avec leurs membres
  app.get("/api/chatgpt/equipes", async (req, res) => {
    try {
      // Vérifier si la méthode existe dans storage
      if (!storage.getEquipes) {
        return res.status(503).json({ 
          message: "La fonctionnalité des équipes n'est pas encore disponible dans cette version de l'API",
          status: "not_implemented"
        });
      }

      const equipes = await storage.getEquipes();
      
      // Enrichir avec les membres de chaque équipe
      const equipesEnrichies = await Promise.all(equipes.map(async (equipe) => {
        try {
          const membres = await storage.getEquipeMembres(equipe.id);
          
          // Récupérer les détails des utilisateurs pour chaque membre
          const membresDetails = await Promise.all(membres.map(async (membre) => {
            const user = await storage.getUser(membre.userId);
            return {
              ...membre,
              utilisateur: user ? {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role
              } : null
            };
          }));
          
          return {
            ...equipe,
            membres: membresDetails
          };
        } catch (error) {
          console.error(`Erreur lors de la récupération des membres pour l'équipe ${equipe.id}:`, error);
          return {
            ...equipe,
            membres: [],
            error: "Impossible de récupérer les membres"
          };
        }
      }));
      
      res.json(equipesEnrichies);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir les lots disponibles avec leurs tâches associées
  app.get("/api/chatgpt/lots", async (req, res) => {
    try {
      const chantierId = req.query.chantierId ? parseInt(req.query.chantierId as string) : undefined;
      
      let lots = [];
      if (chantierId) {
        // Récupérer les lots d'un chantier spécifique
        lots = await storage.getLotsByChantierId(chantierId);
      } else {
        // Récupérer tous les lots de tous les chantiers
        const chantiers = await storage.getChantiers();
        for (const chantier of chantiers) {
          const lotsChantier = await storage.getLotsByChantierId(chantier.id);
          lots.push(...lotsChantier.map(lot => ({
            ...lot,
            chantier: {
              id: chantier.id,
              nom: chantier.nom
            }
          })));
        }
      }
      
      // Enrichir avec les tâches associées à chaque lot
      const lotsEnrichis = await Promise.all(lots.map(async (lot) => {
        const taches = await storage.getTachesByLotId(lot.id);
        return {
          ...lot,
          tachesCount: taches.length,
          tachesEnCours: taches.filter(t => t.statut === 'en_cours').length,
          tachesTerminees: taches.filter(t => t.statut === 'termine').length
        };
      }));
      
      res.json(lotsEnrichis);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir les ressources et leur planification
  app.get("/api/chatgpt/ressources", async (req, res) => {
    try {
      // Vérifier si la méthode existe dans storage
      if (!storage.getRessources) {
        return res.status(503).json({ 
          message: "La fonctionnalité de gestion des ressources n'est pas encore disponible dans cette version de l'API",
          status: "not_implemented"
        });
      }

      const ressources = await storage.getRessources();
      
      // Enrichir avec les affectations et disponibilités
      const ressourcesEnrichies = await Promise.all(ressources.map(async (ressource) => {
        try {
          const affectations = await storage.getRessourceAffectations(ressource.id);
          const disponibilites = await storage.getRessourceDisponibilites(ressource.id);
          
          // Enrichir les affectations avec les détails des tâches
          const affectationsDetails = await Promise.all(affectations.map(async (affectation) => {
            const tache = await storage.getTache(affectation.tacheId);
            return {
              ...affectation,
              tache: tache ? {
                id: tache.id,
                titre: tache.titre,
                statut: tache.statut,
                debut: tache.dateDebut,
                fin: tache.dateFin
              } : null
            };
          }));
          
          return {
            ...ressource,
            affectations: affectationsDetails,
            disponibilites: disponibilites
          };
        } catch (error) {
          console.error(`Erreur lors de la récupération des détails pour la ressource ${ressource.id}:`, error);
          return {
            ...ressource,
            affectations: [],
            disponibilites: [],
            error: "Impossible de récupérer les détails"
          };
        }
      }));
      
      res.json(ressourcesEnrichies);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });
}