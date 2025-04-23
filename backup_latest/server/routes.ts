import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { 
  insertTacheSchema, 
  insertChantierSchema, 
  insertUserSchema,
  insertPieceJointeSchema,
  insertRevisionSchema,
  insertLotSchema,
  insertLotPiloteSchema,
  insertRessourceSchema,
  insertRessourceAffectationSchema,
  insertRessourceDisponibiliteSchema,
  insertEquipeSchema,
  insertEquipeMembreSchema,
  insertParametreSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generatePdf } from "./services/pdf";
import { sendNotificationEmail } from "./services/notification";

// Middleware pour vérifier les permissions administrateur
const checkAdminPermission = (req: Request, res: Response, next: () => void) => {
  // Pour simplifier, nous vérifions juste par le nom d'utilisateur
  // Dans un système réel, cela serait basé sur une session authentifiée
  const username = req.headers['x-user-name'] as string;
  
  if (username !== 'antoine') {
    return res.status(403).json({ message: "Accès non autorisé. Seul l'administrateur peut effectuer cette action." });
  }
  
  next();
};

// Configuration de Multer pour l'upload de fichiers
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Middleware pour la gestion des erreurs Zod
const validateSchema = (schema: any, data: any) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      throw new Error(validationError.message);
    }
    throw error;
  }
};

// Type pour les erreurs customisées
interface CustomError extends Error {
  status?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Créer le serveur HTTP
  const httpServer = createServer(app);

  // Middleware pour gérer les erreurs de validation
  app.use((err: CustomError, req: Request, res: Response, next: () => void) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ message: 'Invalid JSON' });
      return;
    }
    next();
  });

  // ====== ROUTES API ======

  // Récupérer les statistiques pour le dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES UTILISATEURS ======

  // Liste des utilisateurs (protégé : admin uniquement)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Détails d'un utilisateur
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.json(user);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer un utilisateur
  app.post("/api/users", async (req, res) => {
    try {
      const userData = validateSchema(insertUserSchema, req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // ====== ROUTES CHANTIERS ======

  // Liste des chantiers
  app.get("/api/chantiers", async (req, res) => {
    try {
      const chantiers = await storage.getChantiers();
      
      // Enrichir les données avec le compte de tâches
      const enrichedChantiers = await Promise.all(chantiers.map(async (chantier) => {
        const taches = await storage.getTachesByChantierId(chantier.id);
        const tachesCount = taches.length;
        const tachesTermineesCount = taches.filter(t => t.statut === 'termine').length;
        
        let responsable = null;
        if (chantier.responsableId) {
          responsable = await storage.getUser(chantier.responsableId);
        }
        
        return {
          ...chantier,
          tachesCount,
          tachesTermineesCount,
          responsable: responsable ? {
            id: responsable.id,
            nom: responsable.nom,
            prenom: responsable.prenom
          } : null
        };
      }));
      
      res.json(enrichedChantiers);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });
  
  // Route pour l'arborescence des chantiers
  app.get("/api/chantiers/arborescence", async (req, res) => {
    try {
      const chantiers = await storage.getChantiers();
      res.json(chantiers);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });
  
  // Route pour les lots d'un chantier (pour l'arborescence)
  app.get("/api/chantiers/arborescence/lots", async (req, res) => {
    try {
      // Récupérer tous les lots de tous les chantiers
      const chantiers = await storage.getChantiers();
      const allLots = [];
      
      for (const chantier of chantiers) {
        const lots = await storage.getLotsByChantierId(chantier.id);
        allLots.push(...lots);
      }
      
      res.json(allLots);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Liste simple des chantiers (pour les selects)
  app.get("/api/chantiers/list", async (req, res) => {
    try {
      const chantiers = await storage.getChantiers();
      const simpleList = chantiers.map(c => ({ id: c.id, nom: c.nom }));
      res.json(simpleList);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Détails d'un chantier
  app.get("/api/chantiers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chantier = await storage.getChantier(id);
      
      if (!chantier) {
        return res.status(404).json({ message: "Chantier non trouvé" });
      }
      
      // Enrichir avec des données supplémentaires
      const taches = await storage.getTachesByChantierId(id);
      let responsable = null;
      if (chantier.responsableId) {
        responsable = await storage.getUser(chantier.responsableId);
      }
      
      res.json({
        ...chantier,
        taches,
        responsable: responsable ? {
          id: responsable.id,
          nom: responsable.nom,
          prenom: responsable.prenom
        } : null
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer un chantier
  app.post("/api/chantiers", async (req, res) => {
    try {
      const chantierData = validateSchema(insertChantierSchema, req.body);
      const newChantier = await storage.createChantier(chantierData);
      res.status(201).json(newChantier);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour un chantier
  app.patch("/api/chantiers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chantierData = req.body;
      
      const updatedChantier = await storage.updateChantier(id, chantierData);
      
      if (!updatedChantier) {
        return res.status(404).json({ message: "Chantier non trouvé" });
      }
      
      res.json(updatedChantier);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });
  
  // Mettre à jour un utilisateur
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // Vérifier si l'utilisateur existe
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      // Si le mot de passe est vide, ne pas le mettre à jour
      if (userData.password === "") {
        delete userData.password;
      }
      
      // Mettre à jour l'utilisateur
      // Note: cette méthode n'existe pas encore dans l'interface IStorage, il faudra l'ajouter
      const user = await storage.updateUser(id, userData);
      
      res.json(user);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer un chantier
  app.delete("/api/chantiers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChantier(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Chantier non trouvé" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });
  
  // Supprimer un utilisateur
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si c'est l'utilisateur directeur (id=4) que nous ne pouvons pas supprimer
      if (id === 4) {
        return res.status(403).json({ message: "Impossible de supprimer l'utilisateur directeur" });
      }
      
      // Note: cette méthode n'existe pas encore dans l'interface IStorage, il faudra l'ajouter
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES TÂCHES ======

  // Liste des tâches
  app.get("/api/taches", async (req, res) => {
    try {
      const taches = await storage.getTaches();
      
      // Enrichir les données
      const enrichedTaches = await Promise.all(taches.map(async (tache) => {
        const chantier = await storage.getChantier(tache.chantierId);
        const intervenants = await storage.getTacheIntervenants(tache.id);
        
        // Enrichir les intervenants avec les noms
        const intervenantsEnrichis = await Promise.all(intervenants.map(async (intervenant) => {
          const user = await storage.getUser(intervenant.userId);
          return {
            ...intervenant,
            nom: user?.nom || "",
            prenom: user?.prenom || ""
          };
        }));
        
        return {
          ...tache,
          chantierNom: chantier?.nom || "Chantier inconnu",
          intervenants: intervenantsEnrichis
        };
      }));
      
      res.json(enrichedTaches);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Tâches récentes
  app.get("/api/taches/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentTaches = await storage.getRecentTaches(limit);
      res.json(recentTaches);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Détails d'une tâche
  app.get("/api/taches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tache = await storage.getTacheWithDetails(id);
      
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      res.json(tache);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer une tâche
  app.post("/api/taches", async (req, res) => {
    try {
      const tacheData = validateSchema(insertTacheSchema, req.body);
      
      // Créer la tâche
      const newTache = await storage.createTache(tacheData);
      
      // Gérer les intervenants si fournis
      if (req.body.intervenants && Array.isArray(req.body.intervenants)) {
        await storage.setTacheIntervenants(newTache.id, req.body.intervenants);
      }
      
      res.status(201).json(newTache);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour une tâche
  app.patch("/api/taches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tacheData = req.body;
      
      // Extraire les intervenants
      const intervenants = tacheData.intervenants;
      delete tacheData.intervenants;
      
      // Mettre à jour la tâche
      const updatedTache = await storage.updateTache(id, tacheData);
      
      if (!updatedTache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      // Mettre à jour les intervenants si fournis
      if (intervenants && Array.isArray(intervenants)) {
        await storage.setTacheIntervenants(id, intervenants);
      }
      
      res.json(updatedTache);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour le statut d'une tâche
  app.patch("/api/taches/:id/statut", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { statut, userId } = req.body;
      
      if (!statut) {
        return res.status(400).json({ message: "Le statut est requis" });
      }
      
      const updatedTache = await storage.updateTacheStatut(id, statut, userId);
      
      if (!updatedTache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      // Envoyer des notifications par email pour certains statuts
      const tache = await storage.getTacheWithDetails(id);
      const intervenants = tache?.intervenants || [];
      
      // Pour les tâches en retard ou en révision, envoyer des notifications
      if (statut === 'en_retard' || statut === 'en_revision') {
        for (const intervenant of intervenants) {
          const user = await storage.getUser(intervenant.userId);
          if (user && user.email) {
            const statusText = statut === 'en_retard' ? "en retard" : "nécessite une révision";
            await sendNotificationEmail(
              user.email,
              `Tâche ${statusText}: ${tache.titre}`,
              `La tâche "${tache.titre}" du chantier "${tache.chantierNom}" est maintenant ${statusText}.`
            );
          }
        }
      }
      
      res.json(updatedTache);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer une tâche
  app.delete("/api/taches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTache(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Exporter une tâche en PDF
  app.get("/api/taches/:id/export-pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tache = await storage.getTacheWithDetails(id);
      
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      const pdfBuffer = await generatePdf(tache);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="tache-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES PIÈCES JOINTES ======

  // Ajouter des pièces jointes à une tâche
  app.post("/api/taches/:id/pieces-jointes", upload.array("files"), async (req, res) => {
    try {
      const tacheId = parseInt(req.params.id);
      const tache = await storage.getTache(tacheId);
      
      if (!tache) {
        return res.status(404).json({ message: "Tâche non trouvée" });
      }
      
      const uploaderId = req.body.uploaderId || 1; // Par défaut, utiliser l'ID 1
      const type = req.body.type || "document";
      
      const files = req.files as Express.Multer.File[];
      const results = [];
      
      for (const file of files) {
        const fileUrl = `/uploads/${file.filename}`;
        
        const pieceJointe = await storage.createPieceJointe({
          nom: file.originalname,
          type,
          url: fileUrl,
          tacheId,
          uploaderId
        });
        
        // Ajouter la première révision automatiquement
        await storage.createRevision({
          pieceJointeId: pieceJointe.id,
          indice: "A",
          description: "Version initiale",
          userId: uploaderId
        });
        
        results.push(pieceJointe);
      }
      
      res.status(201).json(results);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer une pièce jointe
  app.delete("/api/pieces-jointes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePieceJointe(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pièce jointe non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES RÉVISIONS ======

  // Ajouter une révision à une pièce jointe
  app.post("/api/pieces-jointes/:id/revisions", async (req, res) => {
    try {
      const pieceJointeId = parseInt(req.params.id);
      const pieceJointe = await storage.getPieceJointe(pieceJointeId);
      
      if (!pieceJointe) {
        return res.status(404).json({ message: "Pièce jointe non trouvée" });
      }
      
      const revisionData = validateSchema(insertRevisionSchema, {
        ...req.body,
        pieceJointeId
      });
      
      const newRevision = await storage.createRevision(revisionData);
      res.status(201).json(newRevision);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // ====== ROUTES LOTS ======

  // Liste de tous les lots
  app.get("/api/lots", async (req, res) => {
    try {
      // Paramètre optionnel pour filtrer par chantierId
      const chantierId = req.query.chantierId ? parseInt(req.query.chantierId as string) : undefined;
      
      let lots;
      if (chantierId) {
        lots = await storage.getLotsByChantierId(chantierId);
      } else {
        // On récupère tous les lots de la base de données
        lots = [];
        const chantiers = await storage.getChantiers();
        for (const chantier of chantiers) {
          const chantiersLots = await storage.getLotsByChantierId(chantier.id);
          lots = [...lots, ...chantiersLots];
        }
      }
      
      // Enrichir les données avec le compte de tâches
      const enrichedLots = await Promise.all(lots.map(async (lot) => {
        const taches = await storage.getTachesByLotId(lot.id);
        const tachesCount = taches.length;
        const tachesTermineesCount = taches.filter(t => t.statut === 'termine').length;
        
        // Récupérer les pilotes du lot
        const pilotes = await storage.getLotPilotes(lot.id);
        const pilotesDetails = await Promise.all(
          pilotes.map(async (p) => await storage.getUser(p.userId))
        );
        
        return {
          ...lot,
          tachesCount,
          tachesTermineesCount,
          pilotes: pilotesDetails.filter(Boolean)
        };
      }));
      
      res.json(enrichedLots);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Liste des lots pour un chantier
  app.get("/api/chantiers/:chantierId/lots", async (req, res) => {
    try {
      const chantierId = parseInt(req.params.chantierId);
      const chantier = await storage.getChantier(chantierId);
      
      if (!chantier) {
        return res.status(404).json({ message: "Chantier non trouvé" });
      }
      
      const lots = await storage.getLotsByChantierId(chantierId);
      
      // Enrichir les lots avec les informations sur les pilotes
      const lotsEnrichis = await Promise.all(lots.map(async (lot) => {
        const pilotes = await storage.getLotPilotes(lot.id);
        const pilotesEnrichis = await Promise.all(pilotes.map(async (pilote) => {
          const user = await storage.getUser(pilote.userId);
          return {
            ...pilote,
            nom: user?.nom || "",
            prenom: user?.prenom || "",
            email: user?.email || "",
            role: user?.role || ""
          };
        }));
        
        // Récupérer le nombre de tâches par lot
        const taches = await storage.getTachesByLotId(lot.id);
        
        return {
          ...lot,
          pilotes: pilotesEnrichis,
          tachesCount: taches.length,
          tachesTermineesCount: taches.filter(t => t.statut === 'termine').length
        };
      }));
      
      res.json(lotsEnrichis);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Détails d'un lot
  app.get("/api/lots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lot = await storage.getLot(id);
      
      if (!lot) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      // Récupérer les pilotes du lot
      const pilotes = await storage.getLotPilotes(id);
      const pilotesEnrichis = await Promise.all(pilotes.map(async (pilote) => {
        const user = await storage.getUser(pilote.userId);
        return {
          ...pilote,
          nom: user?.nom || "",
          prenom: user?.prenom || "",
          email: user?.email || "",
          role: user?.role || ""
        };
      }));
      
      // Récupérer les tâches du lot
      const taches = await storage.getTachesByLotId(id);
      
      // Récupérer le chantier parent
      const chantier = await storage.getChantier(lot.chantierId);
      
      res.json({
        ...lot,
        pilotes: pilotesEnrichis,
        taches,
        chantier: chantier ? {
          id: chantier.id,
          nom: chantier.nom
        } : null
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer un lot
  app.post("/api/chantiers/:chantierId/lots", async (req, res) => {
    try {
      const chantierId = parseInt(req.params.chantierId);
      const chantier = await storage.getChantier(chantierId);
      
      if (!chantier) {
        return res.status(404).json({ message: "Chantier non trouvé" });
      }
      
      const lotData = validateSchema(insertLotSchema, {
        ...req.body,
        chantierId
      });
      
      const newLot = await storage.createLot(lotData);
      
      // Gérer les pilotes si fournis
      if (req.body.pilotes && Array.isArray(req.body.pilotes)) {
        await storage.setLotPilotes(newLot.id, req.body.pilotes);
      }
      
      res.status(201).json(newLot);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour un lot
  app.patch("/api/lots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lotData = req.body;
      
      // Extraire les pilotes
      const pilotes = lotData.pilotes;
      delete lotData.pilotes;
      
      const updatedLot = await storage.updateLot(id, lotData);
      
      if (!updatedLot) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      // Mettre à jour les pilotes si fournis
      if (pilotes && Array.isArray(pilotes)) {
        await storage.setLotPilotes(id, pilotes);
      }
      
      res.json(updatedLot);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer un lot
  app.delete("/api/lots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLot(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES PILOTES DE LOTS ======

  // Récupérer les pilotes d'un lot
  app.get("/api/lots/:id/pilotes", async (req, res) => {
    try {
      const lotId = parseInt(req.params.id);
      const lot = await storage.getLot(lotId);
      
      if (!lot) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      const pilotes = await storage.getLotPilotes(lotId);
      const pilotesEnrichis = await Promise.all(pilotes.map(async (pilote) => {
        const user = await storage.getUser(pilote.userId);
        return {
          ...pilote,
          nom: user?.nom || "",
          prenom: user?.prenom || "",
          email: user?.email || "",
          role: user?.role || ""
        };
      }));
      
      res.json(pilotesEnrichis);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Ajouter un pilote à un lot
  app.post("/api/lots/:id/pilotes", async (req, res) => {
    try {
      const lotId = parseInt(req.params.id);
      const lot = await storage.getLot(lotId);
      
      if (!lot) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      const piloteData = validateSchema(insertLotPiloteSchema, {
        ...req.body,
        lotId
      });
      
      const newPilote = await storage.addLotPilote(piloteData);
      
      // Enrichir le pilote avec les informations utilisateur
      const user = await storage.getUser(newPilote.userId);
      const piloteEnrichi = {
        ...newPilote,
        nom: user?.nom || "",
        prenom: user?.prenom || "",
        email: user?.email || "",
        role: user?.role || ""
      };
      
      res.status(201).json(piloteEnrichi);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer un pilote d'un lot
  app.delete("/api/lots/:lotId/pilotes/:userId", async (req, res) => {
    try {
      const lotId = parseInt(req.params.lotId);
      const userId = parseInt(req.params.userId);
      
      const lot = await storage.getLot(lotId);
      if (!lot) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      const deleted = await storage.removeLotPilote(lotId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pilote non trouvé" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES TÂCHES PAR LOT ======

  // Récupérer les tâches d'un lot
  app.get("/api/lots/:id/taches", async (req, res) => {
    try {
      const lotId = parseInt(req.params.id);
      const lot = await storage.getLot(lotId);
      
      if (!lot) {
        return res.status(404).json({ message: "Lot non trouvé" });
      }
      
      const taches = await storage.getTachesByLotId(lotId);
      
      // Enrichir les tâches avec des informations supplémentaires
      const tachesEnrichies = await Promise.all(taches.map(async (tache) => {
        const chantier = await storage.getChantier(tache.chantierId);
        const intervenants = await storage.getTacheIntervenants(tache.id);
        
        const intervenantsEnrichis = await Promise.all(intervenants.map(async (intervenant) => {
          const user = await storage.getUser(intervenant.userId);
          return {
            ...intervenant,
            nom: user?.nom || "",
            prenom: user?.prenom || ""
          };
        }));
        
        return {
          ...tache,
          chantierNom: chantier?.nom || "Chantier inconnu",
          lotNom: lot.nom,
          intervenants: intervenantsEnrichis
        };
      }));
      
      res.json(tachesEnrichies);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES ACTIVITÉS ======

  // Liste des activités récentes
  app.get("/api/activites/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activites = await storage.getActivites(limit);
      
      // Enrichir avec les informations d'utilisateur et de cible
      const enrichedActivites = await Promise.all(activites.map(async (activite) => {
        let user = null;
        if (activite.userId) {
          const userData = await storage.getUser(activite.userId);
          user = userData ? `${userData.prenom} ${userData.nom}` : null;
        }
        
        let targetName = "";
        if (activite.targetId && activite.targetType) {
          if (activite.targetType === 'tache') {
            const tache = await storage.getTache(activite.targetId);
            targetName = tache?.titre || "";
          } else if (activite.targetType === 'chantier') {
            const chantier = await storage.getChantier(activite.targetId);
            targetName = chantier?.nom || "";
          }
        }
        
        return {
          ...activite,
          userName: user,
          targetName
        };
      }));
      
      res.json(enrichedActivites);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES NOTIFICATIONS ======

  // Liste des notifications pour un utilisateur
  app.get("/api/users/:id/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const notifications = await storage.getNotificationsForUser(userId);
      res.json(notifications);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Marquer une notification comme lue
  app.patch("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markNotificationAsRead(id);
      
      if (!updated) {
        return res.status(404).json({ message: "Notification non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES RESSOURCES ======

  // Liste des ressources
  app.get("/api/ressources", async (req, res) => {
    try {
      const ressources = await storage.getRessources();
      res.json(ressources);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Détails d'une ressource
  app.get("/api/ressources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ressource = await storage.getRessource(id);
      
      if (!ressource) {
        return res.status(404).json({ message: "Ressource non trouvée" });
      }
      
      // Récupérer les affectations de cette ressource
      const affectations = await storage.getRessourceAffectations(id);
      // Récupérer les disponibilités de cette ressource
      const disponibilites = await storage.getRessourceDisponibilites(id);
      
      res.json({
        ...ressource,
        affectations,
        disponibilites
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });
  
  // Obtenir les affectations d'une ressource spécifique
  app.get("/api/ressources/:id/affectations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ressource = await storage.getRessource(id);
      
      if (!ressource) {
        return res.status(404).json({ message: "Ressource non trouvée" });
      }
      
      const affectations = await storage.getRessourceAffectations(id);
      res.json(affectations);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer une ressource
  app.post("/api/ressources", async (req, res) => {
    try {
      const ressourceData = validateSchema(insertRessourceSchema, req.body);
      const newRessource = await storage.createRessource(ressourceData);
      res.status(201).json(newRessource);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour une ressource
  app.patch("/api/ressources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ressourceData = req.body;
      
      const updatedRessource = await storage.updateRessource(id, ressourceData);
      
      if (!updatedRessource) {
        return res.status(404).json({ message: "Ressource non trouvée" });
      }
      
      res.json(updatedRessource);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer une ressource
  app.delete("/api/ressources/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRessource(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ressource non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES AFFECTATIONS DE RESSOURCES ======

  // Créer une affectation de ressource
  app.post("/api/ressources/affectations", async (req, res) => {
    try {
      // Ajuster les noms des propriétés si nécessaire
      const requestData = { ...req.body };
      if (requestData.date_debut) {
        requestData.periodeDebut = new Date(requestData.date_debut);
        delete requestData.date_debut;
      } else if (requestData.periodeDebut) {
        requestData.periodeDebut = new Date(requestData.periodeDebut);
      }
      
      if (requestData.date_fin) {
        requestData.periodeFin = new Date(requestData.date_fin);
        delete requestData.date_fin;
      } else if (requestData.periodeFin) {
        requestData.periodeFin = new Date(requestData.periodeFin);
      }
      
      const affectationData = validateSchema(insertRessourceAffectationSchema, requestData);
      const newAffectation = await storage.createRessourceAffectation(affectationData);
      res.status(201).json(newAffectation);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour une affectation
  app.patch("/api/ressources/affectations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const affectationData = req.body;
      
      const updatedAffectation = await storage.updateRessourceAffectation(id, affectationData);
      
      if (!updatedAffectation) {
        return res.status(404).json({ message: "Affectation non trouvée" });
      }
      
      res.json(updatedAffectation);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer une affectation
  app.delete("/api/ressources/affectations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRessourceAffectation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Affectation non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES DISPONIBILITÉS DE RESSOURCES ======
  
  // Obtenir les disponibilités d'une ressource spécifique
  app.get("/api/ressources/:id/disponibilites", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ressource = await storage.getRessource(id);
      
      if (!ressource) {
        return res.status(404).json({ message: "Ressource non trouvée" });
      }
      
      const disponibilites = await storage.getRessourceDisponibilites(id);
      res.json(disponibilites);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer une disponibilité de ressource
  app.post("/api/ressources/disponibilites", async (req, res) => {
    try {
      // Convertir les chaînes de date en objets Date
      const requestData = { ...req.body };
      if (requestData.date_debut) {
        requestData.date_debut = new Date(requestData.date_debut);
      }
      if (requestData.date_fin) {
        requestData.date_fin = new Date(requestData.date_fin);
      }
      
      const disponibiliteData = validateSchema(insertRessourceDisponibiliteSchema, requestData);
      const newDisponibilite = await storage.createRessourceDisponibilite(disponibiliteData);
      res.status(201).json(newDisponibilite);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer une disponibilité
  app.delete("/api/ressources/disponibilites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteRessourceDisponibilite(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Disponibilité non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Obtenir le planning des ressources pour une période
  app.get("/api/planning/ressources", async (req, res) => {
    try {
      const debut = req.query.debut ? new Date(req.query.debut as string) : new Date();
      const fin = req.query.fin ? new Date(req.query.fin as string) : new Date(debut.getTime() + 30 * 24 * 60 * 60 * 1000); // Par défaut 30 jours
      
      const planning = await storage.getRessourcesPlanning(debut, fin);
      res.json(planning);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES ÉQUIPES ======

  // Liste des équipes
  app.get("/api/equipes", async (req, res) => {
    try {
      const equipes = await storage.getEquipes();
      
      // Enrichir avec les informations des membres et responsables
      const enrichedEquipes = await Promise.all(equipes.map(async (equipe) => {
        // Récupérer le responsable si défini
        let responsable = null;
        if (equipe.responsableId) {
          responsable = await storage.getUser(equipe.responsableId);
        }
        
        // Récupérer les membres
        const membres = await storage.getEquipeMembres(equipe.id);
        
        // Enrichir chaque membre avec les infos utilisateur
        const membresDetails = await Promise.all(membres.map(async (membre) => {
          const user = await storage.getUser(membre.userId);
          return {
            ...membre,
            user: user ? {
              id: user.id,
              nom: user.nom,
              prenom: user.prenom,
              role: user.role
            } : null
          };
        }));
        
        return {
          ...equipe,
          responsable: responsable ? {
            id: responsable.id,
            nom: responsable.nom,
            prenom: responsable.prenom
          } : null,
          membres: membresDetails
        };
      }));
      
      res.json(enrichedEquipes);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Détails d'une équipe
  app.get("/api/equipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipe = await storage.getEquipe(id);
      
      if (!equipe) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      
      // Récupérer le responsable si défini
      let responsable = null;
      if (equipe.responsableId) {
        responsable = await storage.getUser(equipe.responsableId);
      }
      
      // Récupérer les membres
      const membres = await storage.getEquipeMembres(id);
      
      // Enrichir chaque membre avec les infos utilisateur
      const membresDetails = await Promise.all(membres.map(async (membre) => {
        const user = await storage.getUser(membre.userId);
        return {
          ...membre,
          user: user ? {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role
          } : null
        };
      }));
      
      res.json({
        ...equipe,
        responsable: responsable ? {
          id: responsable.id,
          nom: responsable.nom,
          prenom: responsable.prenom
        } : null,
        membres: membresDetails
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer une équipe
  app.post("/api/equipes", checkAdminPermission, async (req, res) => {
    try {
      const equipeData = validateSchema(insertEquipeSchema, req.body);
      const newEquipe = await storage.createEquipe(equipeData);
      res.status(201).json(newEquipe);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Mettre à jour une équipe
  app.patch("/api/equipes/:id", checkAdminPermission, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const equipeData = req.body;
      
      const updatedEquipe = await storage.updateEquipe(id, equipeData);
      
      if (!updatedEquipe) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      
      res.json(updatedEquipe);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer une équipe
  app.delete("/api/equipes/:id", checkAdminPermission, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEquipe(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Récupérer les membres d'une équipe
  app.get("/api/equipes/:id/membres", async (req, res) => {
    try {
      const equipeId = parseInt(req.params.id);
      
      // Vérifier si l'équipe existe
      const equipe = await storage.getEquipe(equipeId);
      if (!equipe) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      
      // Récupérer les membres
      const membres = await storage.getEquipeMembres(equipeId);
      
      // Enrichir chaque membre avec les infos utilisateur
      const membresDetails = await Promise.all(membres.map(async (membre) => {
        const user = await storage.getUser(membre.userId);
        return {
          ...membre,
          user: user ? {
            id: user.id,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            email: user.email
          } : null
        };
      }));
      
      res.json(membresDetails);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });
  
  // Mettre à jour les membres d'une équipe
  app.post("/api/equipes/:id/membres", async (req, res) => {
    try {
      const equipeId = parseInt(req.params.id);
      const { membres } = req.body;
      
      if (!Array.isArray(membres)) {
        return res.status(400).json({ message: "Le format des données est incorrect" });
      }
      
      // Vérifier si l'équipe existe
      const equipe = await storage.getEquipe(equipeId);
      if (!equipe) {
        return res.status(404).json({ message: "Équipe non trouvée" });
      }
      
      // Supprimer tous les membres actuels
      await storage.removeAllEquipeMembres(equipeId);
      
      // Ajouter les nouveaux membres
      for (const userId of membres) {
        await storage.addEquipeMembre({
          equipeId,
          userId,
          role: "membre" // Rôle par défaut
        });
      }
      
      // Récupérer la liste mise à jour
      const updatedMembres = await storage.getEquipeMembres(equipeId);
      
      res.json(updatedMembres);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // ====== ROUTES PARAMÈTRES ======

  // Liste des paramètres
  app.get("/api/parametres", async (req, res) => {
    try {
      const parametres = await storage.getParametres();
      res.json(parametres);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Récupérer un paramètre par sa clé
  app.get("/api/parametres/:cle", async (req, res) => {
    try {
      const cle = req.params.cle;
      const parametre = await storage.getParametreParCle(cle);
      
      if (!parametre) {
        return res.status(404).json({ message: "Paramètre non trouvé" });
      }
      
      res.json(parametre);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  // Créer ou mettre à jour un paramètre
  app.post("/api/parametres", checkAdminPermission, async (req, res) => {
    try {
      const parametreData = validateSchema(insertParametreSchema, req.body);
      
      // Vérifier si le paramètre existe déjà
      const existingParam = await storage.getParametreParCle(parametreData.cle);
      
      if (existingParam) {
        // Mettre à jour le paramètre existant
        const updatedParam = await storage.updateParametre(existingParam.id, {
          ...parametreData,
          updated_by: req.body.updated_by || null
        });
        return res.json(updatedParam);
      }
      
      // Créer un nouveau paramètre
      const newParametre = await storage.createParametre(parametreData);
      res.status(201).json(newParametre);
    } catch (error) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  // Supprimer un paramètre
  app.delete("/api/parametres/:id", checkAdminPermission, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteParametre(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Paramètre non trouvé" });
      }
      
      res.status(204).end();
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ message: err.message });
    }
  });

  return httpServer;
}
