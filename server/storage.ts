import { 
  users, type User, type InsertUser,
  chantiers, type Chantier, type InsertChantier,
  lots, type Lot, type InsertLot,
  lotPilotes, type LotPilote, type InsertLotPilote,
  taches, type Tache, type InsertTache,
  tacheIntervenants, type TacheIntervenant, type InsertTacheIntervenant,
  piecesJointes, type PieceJointe, type InsertPieceJointe,
  revisions, type Revision, type InsertRevision,
  activites, type Activite, type InsertActivite,
  notifications, type Notification, type InsertNotification,
  ressources, type Ressource, type InsertRessource,
  ressourceAffectations, type RessourceAffectation, type InsertRessourceAffectation,
  ressourceDisponibilites, type RessourceDisponibilite, type InsertRessourceDisponibilite,
  equipes, type Equipe, type InsertEquipe,
  equipeMembres, type EquipeMembre, type InsertEquipeMembre,
  parametres, type Parametre, type InsertParametre,
  StatutTache, TypeLot, PrioriteTache, TypeRessource, StatutRessource
} from "@shared/schema";

import { db } from './db';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

// Interface de stockage
export interface IStorage {
  // Utilisateurs
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Chantiers
  getChantier(id: number): Promise<Chantier | undefined>;
  getChantiers(): Promise<Chantier[]>;
  createChantier(chantier: InsertChantier): Promise<Chantier>;
  updateChantier(id: number, chantier: Partial<InsertChantier>): Promise<Chantier | undefined>;
  deleteChantier(id: number): Promise<boolean>;

  // Lots
  getLot(id: number): Promise<Lot | undefined>;
  getLotsByChantierId(chantierId: number): Promise<Lot[]>;
  createLot(lot: InsertLot): Promise<Lot>;
  updateLot(id: number, lot: Partial<InsertLot>): Promise<Lot | undefined>;
  deleteLot(id: number): Promise<boolean>;

  // Pilotes de lots
  getLotPilotes(lotId: number): Promise<LotPilote[]>;
  addLotPilote(pilote: InsertLotPilote): Promise<LotPilote>;
  removeLotPilote(lotId: number, userId: number): Promise<boolean>;
  setLotPilotes(lotId: number, userIds: number[]): Promise<boolean>;

  // Tâches
  getTache(id: number): Promise<Tache | undefined>;
  getTacheWithDetails(id: number): Promise<any | undefined>;
  getTaches(): Promise<Tache[]>;
  getRecentTaches(limit?: number): Promise<any[]>;
  getTachesByLotId(lotId: number): Promise<Tache[]>;
  getTachesByChantierId(chantierId: number): Promise<Tache[]>;
  createTache(tache: InsertTache): Promise<Tache>;
  updateTache(id: number, tache: Partial<InsertTache>): Promise<Tache | undefined>;
  updateTacheStatut(id: number, statut: string, userId?: number): Promise<Tache | undefined>;
  deleteTache(id: number): Promise<boolean>;

  // Intervenants des tâches
  getTacheIntervenants(tacheId: number): Promise<TacheIntervenant[]>;
  addTacheIntervenant(tacheIntervenant: InsertTacheIntervenant): Promise<TacheIntervenant>;
  removeTacheIntervenant(tacheId: number, userId: number): Promise<boolean>;
  setTacheIntervenants(tacheId: number, userIds: number[]): Promise<boolean>;

  // Pièces jointes
  getPieceJointe(id: number): Promise<PieceJointe | undefined>;
  getPiecesJointesForTache(tacheId: number): Promise<PieceJointe[]>;
  createPieceJointe(pieceJointe: InsertPieceJointe): Promise<PieceJointe>;
  deletePieceJointe(id: number): Promise<boolean>;

  // Révisions
  getRevision(id: number): Promise<Revision | undefined>;
  getRevisionsForPieceJointe(pieceJointeId: number): Promise<Revision[]>;
  createRevision(revision: InsertRevision): Promise<Revision>;

  // Activités
  getActivites(limit?: number): Promise<Activite[]>;
  getActivitesForTache(tacheId: number): Promise<Activite[]>;
  createActivite(activite: InsertActivite): Promise<Activite>;

  // Notifications
  getNotificationsForUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<any>;

  // Ressources
  getRessources(): Promise<Ressource[]>;
  getRessource(id: number): Promise<Ressource | undefined>;
  createRessource(ressource: InsertRessource): Promise<Ressource>;
  updateRessource(id: number, ressource: Partial<InsertRessource>): Promise<Ressource | undefined>;
  deleteRessource(id: number): Promise<boolean>;

  // Affectations de ressources
  getRessourceAffectations(ressourceId: number): Promise<RessourceAffectation[]>;
  createRessourceAffectation(affectation: InsertRessourceAffectation): Promise<RessourceAffectation>;
  updateRessourceAffectation(id: number, affectation: Partial<InsertRessourceAffectation>): Promise<RessourceAffectation | undefined>;
  deleteRessourceAffectation(id: number): Promise<boolean>;

  // Disponibilités de ressources
  getRessourceDisponibilites(ressourceId: number): Promise<RessourceDisponibilite[]>;
  createRessourceDisponibilite(disponibilite: InsertRessourceDisponibilite): Promise<RessourceDisponibilite>;
  deleteRessourceDisponibilite(id: number): Promise<boolean>;

  // Planning des ressources
  getRessourcesPlanning(debut: Date, fin: Date): Promise<any[]>;
  
  // Équipes
  getEquipes(): Promise<Equipe[]>;
  getEquipe(id: number): Promise<Equipe | undefined>;
  createEquipe(equipe: InsertEquipe): Promise<Equipe>;
  updateEquipe(id: number, equipe: Partial<InsertEquipe>): Promise<Equipe | undefined>;
  deleteEquipe(id: number): Promise<boolean>;
  
  // Membres d'équipe
  getEquipeMembres(equipeId: number): Promise<EquipeMembre[]>;
  addEquipeMembre(membre: InsertEquipeMembre): Promise<EquipeMembre>;
  removeEquipeMembre(equipeId: number, userId: number): Promise<boolean>;
  removeAllEquipeMembres(equipeId: number): Promise<boolean>;
  
  // Paramètres
  getParametres(): Promise<Parametre[]>;
  getParametreParCle(cle: string): Promise<Parametre | undefined>;
  createParametre(parametre: InsertParametre): Promise<Parametre>;
  updateParametre(id: number, parametre: Partial<InsertParametre>): Promise<Parametre | undefined>;
  deleteParametre(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chantiers: Map<number, Chantier>;
  private lots: Map<number, Lot>;
  private lotPilotes: Map<number, LotPilote>;
  private taches: Map<number, Tache>;
  private tacheIntervenants: Map<number, TacheIntervenant>;
  private piecesJointes: Map<number, PieceJointe>;
  private revisions: Map<number, Revision>;
  private activites: Map<number, Activite>;
  private notifications: Map<number, Notification>;
  private ressources: Map<number, Ressource>;
  private ressourceAffectations: Map<number, RessourceAffectation>;
  private ressourceDisponibilites: Map<number, RessourceDisponibilite>;
  private equipes: Map<number, Equipe>;
  private equipeMembres: Map<number, EquipeMembre>;
  private parametres: Map<number, Parametre>;

  private userId: number = 1;
  private chantierId: number = 1;
  private lotId: number = 1;
  private lotPiloteId: number = 1;
  private tacheId: number = 1;
  private tacheIntervenantId: number = 1;
  private pieceJointeId: number = 1;
  private revisionId: number = 1;
  private activiteId: number = 1;
  private notificationId: number = 1;
  private ressourceId: number = 1;
  private ressourceAffectationId: number = 1;
  private ressourceDisponibiliteId: number = 1;
  private equipeId: number = 1;
  private equipeMembreId: number = 1;
  private parametreId: number = 1;

  constructor() {
    this.users = new Map();
    this.chantiers = new Map();
    this.lots = new Map();
    this.lotPilotes = new Map();
    this.taches = new Map();
    this.tacheIntervenants = new Map();
    this.piecesJointes = new Map();
    this.revisions = new Map();
    this.activites = new Map();
    this.notifications = new Map();
    this.ressources = new Map();
    this.ressourceAffectations = new Map();
    this.ressourceDisponibilites = new Map();
    this.equipes = new Map();
    this.equipeMembres = new Map();
    this.parametres = new Map();

    // Initialiser avec des données de démo
    this.initSampleData();
  }

  // Méthodes pour les utilisateurs
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return await db.select().from(users).where(eq(users.role, role));
    } else {
      return await db.select().from(users);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const existingUser = this.users.get(id);
    if (!existingUser) return false;
    
    // Vérifier que ce n'est pas le compte directeur principal
    if (existingUser.role === "directeur" && existingUser.username === "jmichel") {
      return false;
    }
    
    // Supprimer les assignations du user comme pilote de lot
    const pilotesASupprimer = Array.from(this.lotPilotes.values())
      .filter(pilote => pilote.userId === id);
    
    for (const pilote of pilotesASupprimer) {
      this.lotPilotes.delete(pilote.id);
    }
    
    // Supprimer les assignations du user comme intervenant sur une tâche
    const intervenantsASupprimer = Array.from(this.tacheIntervenants.values())
      .filter(intervenant => intervenant.userId === id);
    
    for (const intervenant of intervenantsASupprimer) {
      this.tacheIntervenants.delete(intervenant.id);
    }
    
    return this.users.delete(id);
  }

  // Méthodes pour les chantiers
  async getChantier(id: number): Promise<Chantier | undefined> {
    return this.chantiers.get(id);
  }

  async getChantiers(): Promise<Chantier[]> {
    return Array.from(this.chantiers.values());
  }

  async createChantier(chantier: InsertChantier): Promise<Chantier> {
    const id = this.chantierId++;
    const now = new Date().toISOString();
    const newChantier: Chantier = { 
      ...chantier, 
      id,
      created_at: now
    };
    this.chantiers.set(id, newChantier);

    // Créer une activité
    await this.createActivite({
      type: 'creation',
      description: `a créé le chantier "${chantier.nom}"`,
      userId: undefined,
      targetId: id,
      targetType: 'chantier',
      metadata: null
    });

    return newChantier;
  }

  async updateChantier(id: number, chantier: Partial<InsertChantier>): Promise<Chantier | undefined> {
    const existingChantier = this.chantiers.get(id);
    if (!existingChantier) return undefined;

    const updatedChantier = { ...existingChantier, ...chantier };
    this.chantiers.set(id, updatedChantier);

    // Créer une activité
    await this.createActivite({
      type: 'modification',
      description: `a modifié le chantier "${updatedChantier.nom}"`,
      userId: undefined,
      targetId: id,
      targetType: 'chantier',
      metadata: null
    });

    return updatedChantier;
  }

  async deleteChantier(id: number): Promise<boolean> {
    const existingChantier = this.chantiers.get(id);
    if (!existingChantier) return false;

    // Supprimer tous les lots associés
    const lotsASupprimer = Array.from(this.lots.values())
      .filter(lot => lot.chantierId === id);

    for (const lot of lotsASupprimer) {
      await this.deleteLot(lot.id);
    }

    // Supprimer toutes les tâches associées directement au chantier
    const tachesASupprimer = Array.from(this.taches.values())
      .filter(tache => tache.chantierId === id);

    for (const tache of tachesASupprimer) {
      await this.deleteTache(tache.id);
    }

    return this.chantiers.delete(id);
  }

  // Méthodes pour les lots
  async getLot(id: number): Promise<Lot | undefined> {
    return this.lots.get(id);
  }

  async getLotsByChantierId(chantierId: number): Promise<Lot[]> {
    return Array.from(this.lots.values())
      .filter(lot => lot.chantierId === chantierId);
  }

  async createLot(lot: InsertLot): Promise<Lot> {
    const id = this.lotId++;
    const now = new Date().toISOString();
    const newLot: Lot = { 
      ...lot, 
      id,
      created_at: now
    };
    this.lots.set(id, newLot);

    // Chercher le chantier pour l'activité
    const chantier = await this.getChantier(lot.chantierId);

    // Créer une activité
    await this.createActivite({
      type: 'creation',
      description: `a créé le lot "${lot.nom}" pour le chantier "${chantier?.nom || 'Inconnu'}"`,
      userId: undefined,
      targetId: lot.chantierId,
      targetType: 'chantier',
      metadata: null
    });

    return newLot;
  }

  async updateLot(id: number, lot: Partial<InsertLot>): Promise<Lot | undefined> {
    const existingLot = this.lots.get(id);
    if (!existingLot) return undefined;

    const updatedLot = { ...existingLot, ...lot };
    this.lots.set(id, updatedLot);

    return updatedLot;
  }

  async deleteLot(id: number): Promise<boolean> {
    const existingLot = this.lots.get(id);
    if (!existingLot) return false;

    // Supprimer tous les pilotes de ce lot
    const pilotesASupprimer = Array.from(this.lotPilotes.values())
      .filter(pilote => pilote.lotId === id);

    for (const pilote of pilotesASupprimer) {
      this.lotPilotes.delete(pilote.id);
    }

    // Supprimer toutes les tâches associées à ce lot
    const tachesASupprimer = Array.from(this.taches.values())
      .filter(tache => tache.lotId === id);

    for (const tache of tachesASupprimer) {
      await this.deleteTache(tache.id);
    }

    return this.lots.delete(id);
  }

  // Méthodes pour les pilotes de lots
  async getLotPilotes(lotId: number): Promise<LotPilote[]> {
    return Array.from(this.lotPilotes.values())
      .filter(pilote => pilote.lotId === lotId);
  }

  async addLotPilote(pilote: InsertLotPilote): Promise<LotPilote> {
    const id = this.lotPiloteId++;
    const newPilote: LotPilote = { ...pilote, id };
    this.lotPilotes.set(id, newPilote);

    // Chercher le lot et l'utilisateur pour l'activité
    const lot = await this.getLot(pilote.lotId);
    const user = await this.getUser(pilote.userId);

    if (lot && user) {
      // Créer une activité
      await this.createActivite({
        type: 'assignation',
        description: `a été assigné(e) comme pilote du lot "${lot.nom}"`,
        userId: pilote.userId,
        targetId: lot.chantierId,
        targetType: 'chantier',
        metadata: {
          lotId: lot.id,
          lotNom: lot.nom
        }
      });
    }

    return newPilote;
  }

  async removeLotPilote(lotId: number, userId: number): Promise<boolean> {
    const pilote = Array.from(this.lotPilotes.values())
      .find(p => p.lotId === lotId && p.userId === userId);

    if (!pilote) return false;

    return this.lotPilotes.delete(pilote.id);
  }

  async setLotPilotes(lotId: number, userIds: number[]): Promise<boolean> {
    // Récupérer les pilotes actuels
    const pilotesActuels = await this.getLotPilotes(lotId);
    const userIdsActuels = pilotesActuels.map(p => p.userId);

    // Supprimer les pilotes qui ne sont plus dans la liste
    for (const pilote of pilotesActuels) {
      if (!userIds.includes(pilote.userId)) {
        await this.removeLotPilote(lotId, pilote.userId);
      }
    }

    // Ajouter les nouveaux pilotes
    for (const userId of userIds) {
      if (!userIdsActuels.includes(userId)) {
        await this.addLotPilote({ lotId, userId });
      }
    }

    return true;
  }

  // Méthodes pour les tâches
  async getTache(id: number): Promise<Tache | undefined> {
    return this.taches.get(id);
  }

  async getTacheWithDetails(id: number): Promise<any | undefined> {
    const tache = this.taches.get(id);
    if (!tache) return undefined;

    let chantierInfo = this.chantiers.get(tache.chantierId);
    const intervenants = await this.getTacheIntervenants(id);
    const piecesJointes = await this.getPiecesJointesForTache(id);
    const historique = await this.getActivitesForTache(id);

    // Enrichir les pièces jointes avec leurs révisions et informations sur l'uploader
    const piecesJointesEnrichies = await Promise.all(piecesJointes.map(async (pj) => {
      const revisionsList = await this.getRevisionsForPieceJointe(pj.id);
      const uploader = await this.getUser(pj.uploaderId);

      // Enrichir les révisions avec les informations utilisateur
      const revisionsEnrichies = await Promise.all(revisionsList.map(async (rev) => {
        const user = await this.getUser(rev.userId);
        return {
          ...rev,
          user: user ? { 
            id: user.id,
            nom: user.nom,
            prenom: user.prenom
          } : null
        };
      }));

      return {
        ...pj,
        uploader: uploader ? { 
          id: uploader.id,
          nom: uploader.nom,
          prenom: uploader.prenom
        } : null,
        revisions: revisionsEnrichies
      };
    }));

    // Enrichir l'historique avec les informations utilisateur
    const historiqueEnrichi = await Promise.all(historique.map(async (item) => {
      const user = item.userId ? await this.getUser(item.userId) : null;
      return {
        ...item,
        user: user ? { 
          id: user.id,
          nom: user.nom,
          prenom: user.prenom
        } : null
      };
    }));

    // Enrichir les intervenants avec les informations utilisateur
    const intervenantsEnrichis = await Promise.all(intervenants.map(async (intervenant) => {
      const user = await this.getUser(intervenant.userId);
      return {
        ...intervenant,
        nom: user?.nom || "",
        prenom: user?.prenom || ""
      };
    }));

    // Récupérer l'utilisateur qui a fait la dernière mise à jour
    const updatedBy = tache.updated_by ? await this.getUser(tache.updated_by) : null;

    // S'assurer que les relations avec le chantier sont correctes
    let chantierId = tache.chantierId;

    // Si la tâche appartient à un lot plutôt qu'à un chantier directement
    if (!chantierInfo && (tache as any).lotId) {
      const lot = await this.getLot((tache as any).lotId);
      if (lot) {
        chantierId = lot.chantierId;
        chantierInfo = await this.getChantier(lot.chantierId);
      }
    }

    return {
      ...tache,
      chantierId: chantierId,
      chantierNom: chantierInfo?.nom || "Chantier inconnu",
      intervenants: intervenantsEnrichis,
      piecesJointes: piecesJointesEnrichies,
      historique: historiqueEnrichi,
      updated_by: updatedBy ? {
        id: updatedBy.id,
        nom: updatedBy.nom,
        prenom: updatedBy.prenom
      } : null
    };
  }

  async getTaches(): Promise<Tache[]> {
    return Array.from(this.taches.values());
  }

  async getRecentTaches(limit: number = 5): Promise<any[]> {
    const taches = Array.from(this.taches.values())
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit);

    // Enrichir les tâches avec des données additionnelles
    return Promise.all(taches.map(async (tache) => {
      const chantier = this.chantiers.get(tache.chantierId);
      const intervenants = await this.getTacheIntervenants(tache.id);

      const intervenantsEnrichis = await Promise.all(intervenants.map(async (intervenant) => {
        const user = await this.getUser(intervenant.userId);
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
  }

  async getTachesByChantierId(chantierId: number): Promise<Tache[]> {
    return Array.from(this.taches.values())
      .filter(tache => tache.chantierId === chantierId);
  }

  async getTachesByLotId(lotId: number): Promise<Tache[]> {
    return Array.from(this.taches.values())
      .filter(tache => tache.lotId === lotId);
  }

  async createTache(tache: InsertTache): Promise<Tache> {
    const id = this.tacheId++;
    const now = new Date().toISOString();
    const newTache: Tache = { 
      ...tache, 
      id,
      created_at: now,
      updated_at: now,
      updated_by: tache.updated_by
    };
    this.taches.set(id, newTache);

    // Créer une activité
    await this.createActivite({
      type: 'creation',
      description: `a créé la tâche "${tache.titre}"`,
      userId: tache.updated_by || undefined,
      targetId: id,
      targetType: 'tache',
      metadata: null
    });

    return newTache;
  }

  async updateTache(id: number, tache: Partial<InsertTache>): Promise<Tache | undefined> {
    const existingTache = this.taches.get(id);
    if (!existingTache) return undefined;

    const now = new Date().toISOString();
    const updatedTache = { 
      ...existingTache, 
      ...tache,
      updated_at: now
    };
    this.taches.set(id, updatedTache);

    // Créer une activité
    await this.createActivite({
      type: 'modification',
      description: `a modifié la tâche "${updatedTache.titre}"`,
      userId: tache.updated_by || existingTache.updated_by || undefined,
      targetId: id,
      targetType: 'tache',
      metadata: null
    });

    return updatedTache;
  }

  async updateTacheStatut(id: number, statut: string, userId?: number): Promise<Tache | undefined> {
    const existingTache = this.taches.get(id);
    if (!existingTache) return undefined;

    // Pas de mise à jour si le statut est le même
    if (existingTache.statut === statut) return existingTache;

    const now = new Date().toISOString();
    const updatedTache = { 
      ...existingTache, 
      statut,
      updated_at: now,
      updated_by: userId || existingTache.updated_by
    };
    this.taches.set(id, updatedTache);

    // Créer une activité
    await this.createActivite({
      type: 'statut',
      description: `a changé le statut de la tâche "${updatedTache.titre}" en "${this.getStatusText(statut)}"`,
      userId: userId,
      targetId: id,
      targetType: 'tache',
      metadata: {
        previousStatus: existingTache.statut,
        newStatus: statut
      }
    });

    return updatedTache;
  }

  async deleteTache(id: number): Promise<boolean> {
    const existingTache = this.taches.get(id);
    if (!existingTache) return false;

    // Supprimer les intervenants
    const intervenants = await this.getTacheIntervenants(id);
    for (const intervenant of intervenants) {
      this.tacheIntervenants.delete(intervenant.id);
    }

    // Supprimer les pièces jointes et leurs révisions
    const piecesJointes = await this.getPiecesJointesForTache(id);
    for (const pieceJointe of piecesJointes) {
      // Supprimer les révisions
      const revisions = await this.getRevisionsForPieceJointe(pieceJointe.id);
      for (const revision of revisions) {
        this.revisions.delete(revision.id);
      }

      this.piecesJointes.delete(pieceJointe.id);
    }

    // Supprimer les activités liées
    const activites = await this.getActivitesForTache(id);
    for (const activite of activites) {
      this.activites.delete(activite.id);
    }

    // Supprimer les notifications liées
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.targetId === id && n.targetType === 'tache');
    for (const notification of notifications) {
      this.notifications.delete(notification.id);
    }

    return this.taches.delete(id);
  }

  // Méthodes pour les intervenants des tâches
  async getTacheIntervenants(tacheId: number): Promise<TacheIntervenant[]> {
    return Array.from(this.tacheIntervenants.values())
      .filter(intervenant => intervenant.tacheId === tacheId);
  }

  async addTacheIntervenant(tacheIntervenant: InsertTacheIntervenant): Promise<TacheIntervenant> {
    const id = this.tacheIntervenantId++;
    const newIntervenant: TacheIntervenant = { ...tacheIntervenant, id };
    this.tacheIntervenants.set(id, newIntervenant);

    // Chercher la tâche et l'utilisateur pour l'activité
    const tache = this.taches.get(tacheIntervenant.tacheId);
    const user = await this.getUser(tacheIntervenant.userId);

    if (tache && user) {
      // Créer une activité
      await this.createActivite({
        type: 'assignation',
        description: `a été assigné(e) à la tâche "${tache.titre}"`,
        userId: tacheIntervenant.userId,
        targetId: tacheIntervenant.tacheId,
        targetType: 'tache',
        metadata: null
      });

      // Créer une notification pour l'utilisateur
      await this.createNotification({
        userId: tacheIntervenant.userId,
        message: `Vous avez été assigné(e) à la tâche "${tache.titre}"`,
        lue: false,
        targetId: tache.id,
        targetType: 'tache'
      });
    }

    return newIntervenant;
  }

  async removeTacheIntervenant(tacheId: number, userId: number): Promise<boolean> {
    const intervenant = Array.from(this.tacheIntervenants.values())
      .find(i => i.tacheId === tacheId && i.userId === userId);

    if (!intervenant) return false;

    return this.tacheIntervenants.delete(intervenant.id);
  }

  async setTacheIntervenants(tacheId: number, userIds: number[]): Promise<boolean> {
    // Récupérer les intervenants actuels
    const intervenantsActuels = await this.getTacheIntervenants(tacheId);
    const userIdsActuels = intervenantsActuels.map(i => i.userId);

    // Supprimer les intervenants qui ne sont plus dans la liste
    for (const intervenant of intervenantsActuels) {
      if (!userIds.includes(intervenant.userId)) {
        await this.removeTacheIntervenant(tacheId, intervenant.userId);
      }
    }

    // Ajouter les nouveaux intervenants
    for (const userId of userIds) {
      if (!userIdsActuels.includes(userId)) {
        await this.addTacheIntervenant({ tacheId, userId });
      }
    }

    return true;
  }

  // Méthodes pour les pièces jointes
  async getPieceJointe(id: number): Promise<PieceJointe | undefined> {
    return this.piecesJointes.get(id);
  }

  async getPiecesJointesForTache(tacheId: number): Promise<PieceJointe[]> {
    return Array.from(this.piecesJointes.values())
      .filter(pieceJointe => pieceJointe.tacheId === tacheId);
  }

  async createPieceJointe(pieceJointe: InsertPieceJointe): Promise<PieceJointe> {
    const id = this.pieceJointeId++;
    const now = new Date().toISOString();
    const newPieceJointe: PieceJointe = { 
      ...pieceJointe, 
      id,
      created_at: now
    };
    this.piecesJointes.set(id, newPieceJointe);

    // Chercher la tâche pour l'activité
    const tache = this.taches.get(pieceJointe.tacheId);

    if (tache) {
      // Créer une activité
      await this.createActivite({
        type: 'document',
        description: `a ajouté le document "${pieceJointe.nom}" à la tâche "${tache.titre}"`,
        userId: pieceJointe.uploaderId,
        targetId: pieceJointe.tacheId,
        targetType: 'tache',
        metadata: {
          documentId: id,
          documentType: pieceJointe.type
        }
      });

      // Notifier les intervenants de la tâche
      const intervenants = await this.getTacheIntervenants(tache.id);
      for (const intervenant of intervenants) {
        if (intervenant.userId !== pieceJointe.uploaderId) {
          await this.createNotification({
            userId: intervenant.userId,
            message: `Un nouveau document a été ajouté à la tâche "${tache.titre}"`,
            lue: false,
            targetId: tache.id,
            targetType: 'tache'
          });
        }
      }
    }

    return newPieceJointe;
  }

  async deletePieceJointe(id: number): Promise<boolean> {
    const pieceJointe = this.piecesJointes.get(id);
    if (!pieceJointe) return false;

    // Supprimer les révisions
    const revisions = await this.getRevisionsForPieceJointe(id);
    for (const revision of revisions) {
      this.revisions.delete(revision.id);
    }

    return this.piecesJointes.delete(id);
  }

  // Méthodes pour les révisions
  async getRevision(id: number): Promise<Revision | undefined> {
    return this.revisions.get(id);
  }

  async getRevisionsForPieceJointe(pieceJointeId: number): Promise<Revision[]> {
    return Array.from(this.revisions.values())
      .filter(revision => revision.pieceJointeId === pieceJointeId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createRevision(revision: InsertRevision): Promise<Revision> {
    const id = this.revisionId++;
    const now = new Date().toISOString();
    const newRevision: Revision = { 
      ...revision, 
      id,
      created_at: now
    };
    this.revisions.set(id, newRevision);

    // Chercher la pièce jointe et la tâche pour l'activité
    const pieceJointe = this.piecesJointes.get(revision.pieceJointeId);

    if (pieceJointe) {
      const tache = this.taches.get(pieceJointe.tacheId);

      if (tache) {
        // Mettre à jour le statut de la tâche en "en révision" si nécessaire
        if (tache.statut !== StatutTache.EN_REVISION) {
          await this.updateTacheStatut(tache.id, StatutTache.EN_REVISION, revision.userId);
        }

        // Créer une activité
        await this.createActivite({
          type: 'revision',
          description: `a créé une révision "${revision.indice}" pour le document "${pieceJointe.nom}"`,
          userId: revision.userId,
          targetId: pieceJointe.tacheId,
          targetType: 'tache',
          metadata: {
            documentId: pieceJointe.id,
            documentName: pieceJointe.nom,
            revisionIndice: revision.indice,
            revisionDescription: revision.description
          }
        });

        // Notifier les intervenants de la tâche
        const intervenants = await this.getTacheIntervenants(tache.id);
        for (const intervenant of intervenants) {
          if (intervenant.userId !== revision.userId) {
            await this.createNotification({
              userId: intervenant.userId,
              message: `Une nouvelle révision (${revision.indice}) a été créée pour le document "${pieceJointe.nom}"`,
              lue: false,
              targetId: tache.id,
              targetType: 'tache'
            });
          }
        }
      }
    }

    return newRevision;
  }

  // Méthodes pour les activités
  async getActivites(limit: number = 20): Promise<Activite[]> {
    return Array.from(this.activites.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  async getActivitesForTache(tacheId: number): Promise<Activite[]> {
    return Array.from(this.activites.values())
      .filter(activite => activite.targetId === tacheId && activite.targetType === 'tache')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createActivite(activite: InsertActivite): Promise<Activite> {
    const id = this.activiteId++;
    const now = new Date().toISOString();
    const newActivite: Activite = { 
      ...activite, 
      id,
      created_at: now
    };
    this.activites.set(id, newActivite);
    return newActivite;
  }

  // Méthodes pour les notifications
  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const now = new Date().toISOString();
    const newNotification: Notification = { 
      ...notification, 
      id,
      created_at: now
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;

    notification.lue = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Méthodes pour le dashboard
  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const unMoisAvant = new Date();
    unMoisAvant.setMonth(now.getMonth() - 1);

    const uneSemaineAvant = new Date();
    uneSemaineAvant.setDate(now.getDate() - 7);

    const taches = Array.from(this.taches.values());
    const chantiers = Array.from(this.chantiers.values());

    // Statistiques actuelles
    const chantiersActifs = chantiers.filter(c => c.statut === 'actif').length;
    const tachesEnCours = taches.filter(t => t.statut === StatutTache.EN_COURS).length;
    const tachesEnRetard = taches.filter(t => t.statut === StatutTache.EN_RETARD).length;

    // Récupérer le nombre de révisions
    let revisionsPlans = 0;
    for (const revision of this.revisions.values()) {
      revisionsPlans++;
    }

    // Simuler des évolutions (pour démo)
    const chantiersEvolution = 12;  // 12% de plus qu'il y a un mois
    const tachesEvolution = 4;      // 4% de plus qu'il y a une semaine
    const retardsEvolution = 8;     // 8% de plus qu'il y a une semaine
    const revisionsEvolution = -6;  // 6% de moins qu'il y a un mois

    return {
      chantiersActifs,
      tachesEnCours,
      tachesEnRetard,
      revisionsPlans,
      chantiersEvolution,
      tachesEvolution,
      retardsEvolution,
      revisionsEvolution
    };
  }

  // Méthodes utilitaires
  private getStatusText(statut: string): string {
    switch (statut) {
      case StatutTache.A_FAIRE:
        return "À faire";
      case StatutTache.EN_COURS:
        return "En cours";
      case StatutTache.EN_VALIDATION:
        return "En validation";
      case StatutTache.TERMINE:
        return "Terminé";
      case StatutTache.EN_RETARD:
        return "En retard";
      case StatutTache.EN_REVISION:
        return "En révision";
      default:
        return statut;
    }
  }

  private initSampleData() {
    // Créer les utilisateurs selon la structure demandée
    const users = [
      // Responsables (pilotes)
      { 
        username: "max", 
        password: "password", 
        nom: "Dupont", 
        prenom: "Max", 
        role: "responsable_travaux",
        email: "max@spiess-tp.fr",
        avatar: null
      },
      { 
        username: "renaud", 
        password: "password", 
        nom: "Martin", 
        prenom: "Renaud", 
        role: "conducteur_travaux",
        email: "renaud@spiess-tp.fr",
        avatar: null
      },
      { 
        username: "stephane", 
        password: "password", 
        nom: "Lefebvre", 
        prenom: "Stéphane", 
        role: "responsable_etude",
        email: "stephane@spiess-tp.fr",
        avatar: null
      },
      { 
        username: "jmichel", 
        password: "password", 
        nom: "Dubois", 
        prenom: "Jean-Michel", 
        role: "directeur",
        email: "jm@spiess-tp.fr",
        avatar: null
      },
      { 
        username: "slocation", 
        password: "password", 
        nom: "Spiess", 
        prenom: "Location", 
        role: "service_interne",
        email: "location@spiess-tp.fr",
        avatar: null
      },
      { 
        username: "srecyclage", 
        password: "password", 
        nom: "Spiess", 
        prenom: "Recyclage", 
        role: "service_interne",
        email: "recyclage@spiess-tp.fr",
        avatar: null
      },

      // Intervenants
      { 
        username: "lucie", 
        password: "password", 
        nom: "Mercier", 
        prenom: "Lucie", 
        role: "assistante_conductrice",
        email: "lucie@spiess-tp.fr",
        avatar: null
      },
      { 
        username: "antoine", 
        password: "password", 
        nom: "Moreau", 
        prenom: "Antoine", 
        role: "geometre_projeteur",
        email: "antoine@spiess-tp.fr",
        avatar: null
      }
    ];

    const userIds = [];
    for (const userData of users) {
      const user = this.createUser(userData);
      userIds.push(user.id);
    }

    // Créer quelques chantiers
    const chantiers = [
      {
        nom: "Résidence Les Cèdres",
        description: "Construction d'un ensemble résidentiel de 50 logements",
        dateDebut: new Date("2023-03-15").toISOString(),
        dateFin: new Date("2024-06-30").toISOString(),
        adresse: "123 Avenue des Pins, 75001 Paris",
        responsableId: userIds[0],
        statut: "actif"
      },
      {
        nom: "Centre commercial Bellevue",
        description: "Rénovation et extension d'un centre commercial",
        dateDebut: new Date("2023-01-10").toISOString(),
        dateFin: new Date("2023-12-15").toISOString(),
        adresse: "45 Rue du Commerce, 69002 Lyon",
        responsableId: userIds[4],
        statut: "actif"
      },
      {
        nom: "Campus Universitaire",
        description: "Construction d'un nouveau bâtiment pour l'université",
        dateDebut: new Date("2023-05-20").toISOString(),
        dateFin: new Date("2024-09-01").toISOString(),
        adresse: "7 Boulevard des Facultés, 33000 Bordeaux",
        responsableId: userIds[0],
        statut: "actif"
      },
      {
        nom: "Pont de la Rivière",
        description: "Réhabilitation d'un pont routier",
        dateDebut: new Date("2023-02-01").toISOString(),
        dateFin: new Date("2023-11-30").toISOString(),
        adresse: "Route départementale 42, 44000 Nantes",
        responsableId: userIds[2],
        statut: "actif"
      }
    ];

    const chantierIds = [];
    for (const chantierData of chantiers) {
      const chantier = this.createChantier(chantierData);
      chantierIds.push(chantier.id);
    }

    // Créer quelques lots pour chaque chantier
    const lotsData = [
      // Lots pour Résidence Les Cèdres
      {
        nom: "Voirie et réseaux divers",
        description: "Travaux de voirie et réseaux divers pour la résidence",
        type: TypeLot.VOIRIE,
        chantierId: chantierIds[0],
        statut: "actif"
      },
      {
        nom: "Bâtiment principal",
        description: "Construction du bâtiment principal de la résidence",
        type: TypeLot.BATIMENT,
        chantierId: chantierIds[0],
        statut: "actif"
      },
      {
        nom: "Espaces verts",
        description: "Aménagement des espaces verts de la résidence",
        type: TypeLot.ESPACES_VERTS,
        chantierId: chantierIds[0],
        statut: "actif"
      },

      // Lots pour Centre commercial Bellevue
      {
        nom: "Réseaux secs",
        description: "Installation des réseaux électriques et télécom",
        type: TypeLot.RESEAUX_SECS,
        chantierId: chantierIds[1],
        statut: "actif"
      },
      {
        nom: "Rénovation intérieure",
        description: "Travaux de rénovation des espaces intérieurs",
        type: TypeLot.BATIMENT,
        chantierId: chantierIds[1],
        statut: "actif"
      },

      // Lots pour Campus Universitaire
      {
        nom: "Fondations",
        description: "Travaux de fondations pour le nouveau bâtiment",
        type: TypeLot.BATIMENT,
        chantierId: chantierIds[2],
        statut: "actif"
      },
      {
        nom: "Réseaux humides",
        description: "Installation des réseaux d'eau et assainissement",
        type: TypeLot.RESEAUX_HUMIDES,
        chantierId: chantierIds[2],
        statut: "actif"
      },

      // Lots pour Pont de la Rivière
      {
        nom: "Structure du pont",
        description: "Réhabilitation de la structure du pont",
        type: TypeLot.VOIRIE,
        chantierId: chantierIds[3],
        statut: "actif"
      },
      {
        nom: "Signalisation",
        description: "Installation de la signalisation routière",
        type: TypeLot.SIGNALISATION,
        chantierId: chantierIds[3],
        statut: "actif"
      }
    ];

    // Créer les lots
    const lotIds = [];
    for (const lotData of lotsData) {
      const lot = this.createLot(lotData);
      lotIds.push(lot.id);
    }

    // Assigner des pilotes aux lots
    const pilotesData = [
      // Pilotes pour Résidence Les Cèdres - Voirie
      { lotId: lotIds[0], userId: userIds[0] }, // Max
      { lotId: lotIds[0], userId: userIds[1] }, // Renaud

      // Pilotes pour Résidence Les Cèdres - Bâtiment
      { lotId: lotIds[1], userId: userIds[2] }, // Stéphane
      { lotId: lotIds[1], userId: userIds[3] }, // Jean-Michel

      // Pilotes pour Résidence Les Cèdres - Espaces verts
      { lotId: lotIds[2], userId: userIds[4] }, // Spiess Location
      { lotId: lotIds[2], userId: userIds[5] }, // Spiess Recyclage

      // Pilotes pour Centre commercial - Réseaux secs
      { lotId: lotIds[3], userId: userIds[1] }, // Renaud
      { lotId: lotIds[3], userId: userIds[2] }, // Stéphane

      // Pilotes pour Centre commercial - Rénovation
      { lotId: lotIds[4], userId: userIds[3] }, // Jean-Michel
      { lotId: lotIds[4], userId: userIds[0] }, // Max

      // Pilotes pour Campus - Fondations
      { lotId: lotIds[5], userId: userIds[2] }, // Stéphane
      { lotId: lotIds[5], userId: userIds[5] }, // Spiess Recyclage

      // Pilotes pour Campus - Réseaux humides
      { lotId: lotIds[6], userId: userIds[1] }, // Renaud
      { lotId: lotIds[6], userId: userIds[4] }, // Spiess Location

      // Pilotes pour Pont - Structure
      { lotId: lotIds[7], userId: userIds[0] }, // Max 
      { lotId: lotIds[7], userId: userIds[3] }, // Jean-Michel

      // Pilotes pour Pont - Signalisation
      { lotId: lotIds[8], userId: userIds[4] }, // Spiess Location
      { lotId: lotIds[8], userId: userIds[5] }  // Spiess Recyclage
    ];

    for (const piloteData of pilotesData) {
      this.addLotPilote(piloteData);
    }

    // Modifier les tâches pour les associer aux lots
    // Créer quelques tâches
    const tachesData = [
      {
        titre: "Plan d'exécution fondations",
        description: "Élaboration des plans d'exécution pour les fondations du bâtiment principal",
        chantierId: chantierIds[0],
        lotId: lotIds[1], // Lot "Bâtiment principal"
        type: "conception",
        statut: "en_revision",
        progression: 65,
        dateDebut: new Date("2023-05-10").toISOString(),
        dateDemande: new Date("2023-05-05").toISOString(),
        dateRealisation: null,
        dateLimite: new Date("2023-06-15").toISOString(),
        updated_by: userIds[0]
      },
      {
        titre: "Validation réseaux VRD",
        description: "Vérification et validation des plans de réseaux VRD",
        chantierId: chantierIds[1],
        lotId: lotIds[3], // Lot "Réseaux secs"
        type: "validation",
        statut: "termine",
        progression: 100,
        dateDebut: new Date("2023-05-01").toISOString(),
        dateDemande: new Date("2023-04-28").toISOString(),
        dateRealisation: new Date("2023-06-10").toISOString(),
        dateLimite: new Date("2023-06-12").toISOString(),
        updated_by: userIds[1]
      },
      {
        titre: "Étude structure bâtiment B",
        description: "Réalisation de l'étude structure pour le bâtiment B du campus",
        chantierId: chantierIds[2],
        lotId: lotIds[5], // Lot "Fondations"
        type: "etude",
        statut: "en_cours",
        progression: 45,
        dateDebut: new Date("2023-06-01").toISOString(),
        dateDemande: new Date("2023-05-20").toISOString(),
        dateRealisation: null,
        dateLimite: new Date("2023-06-28").toISOString(),
        updated_by: userIds[3]
      },
      {
        titre: "Révision des plans d'éxécution",
        description: "Révision complète des plans d'exécution du tablier",
        chantierId: chantierIds[3],
        lotId: lotIds[7], // Lot "Structure du pont"
        type: "revision",
        statut: "en_retard",
        progression: 75,
        dateDebut: new Date("2023-05-15").toISOString(),
        dateDemande: new Date("2023-05-10").toISOString(),
        dateRealisation: null,
        dateLimite: new Date("2023-06-10").toISOString(),
        updated_by: userIds[2]
      },
      {
        titre: "Validation des matériaux",
        description: "Sélection et validation des matériaux de façade",
        chantierId: chantierIds[0],
        lotId: lotIds[1], // Lot "Bâtiment principal"
        type: "validation",
        statut: "en_attente",
        progression: 30,
        dateDebut: new Date("2023-06-05").toISOString(),
        dateDemande: new Date("2023-06-01").toISOString(),
        dateRealisation: null,
        dateLimite: new Date("2023-06-20").toISOString(),
        updated_by: userIds[1]
      }
    ];

    // Créer les tâches
    const tacheIds = [];
    for (const tacheData of tachesData) {
      const tache = this.createTache(tacheData);
      tacheIds.push(tache.id);
    }

    // Ajouter des intervenants aux tâches
    const intervenants = [
      { tacheId: tacheIds[0], userId: userIds[0] },
      { tacheId: tacheIds[0], userId: userIds[3] },
      { tacheId: tacheIds[1], userId: userIds[1] },
      { tacheId: tacheIds[1], userId: userIds[2] },
      { tacheId: tacheIds[2], userId: userIds[3] },
      { tacheId: tacheIds[3], userId: userIds[2] },
      { tacheId: tacheIds[3], userId: userIds[0] },
      { tacheId: tacheIds[4], userId: userIds[1] },
      { tacheId: tacheIds[4], userId: userIds[4] }
    ];

    for (const intervenantData of intervenants) {
      this.addTacheIntervenant(intervenantData);
    }

    // Ajouter des pièces jointes
    const piecesJointes = [
      {
        nom: "plan-fondations-v1.pdf",
        type: "plan",
        url: "/uploads/plan-fondations-v1.pdf",
        tacheId: tacheIds[0],
        uploaderId: userIds[3]
      },
      {
        nom: "rapport-vrd.pdf",
        type: "rapport",
        url: "/uploads/rapport-vrd.pdf",
        tacheId: tacheIds[1],
        uploaderId: userIds[1]
      },
      {
        nom: "etude-structure-batB.pdf",
        type: "etude",
        url: "/uploads/etude-structure-batB.pdf",
        tacheId: tacheIds[2],
        uploaderId: userIds[3]
      },
      {
        nom: "plan-tablier-pont-v2.dwg",
        type: "plan",
        url: "/uploads/plan-tablier-pont-v2.dwg",
        tacheId: tacheIds[3],
        uploaderId: userIds[2]
      }
    ];

    const pieceJointeIds = [];
    for (const pieceJointeData of piecesJointes) {
      const pieceJointe = this.createPieceJointe(pieceJointeData);
      pieceJointeIds.push(pieceJointe.id);
    }
    
    // Ajouter des données pour les équipes
    const equipes = [
      {
        nom: "Équipe VRD",
        description: "Équipe responsable des voiries et réseaux divers"
      },
      {
        nom: "Équipe Bâtiment",
        description: "Équipe responsable de la construction des bâtiments"
      },
      {
        nom: "Équipe Ouvrages d'Art",
        description: "Équipe spécialisée dans les ponts et ouvrages complexes"
      }
    ];
    
    const equipeIds = [];
    for (const equipeData of equipes) {
      const equipe = this.createEquipe(equipeData);
      equipeIds.push(equipe.id);
    }
    
    // Ajouter des membres aux équipes
    const equipeMembres = [
      { equipeId: equipeIds[0], userId: userIds[0], est_responsable: true },
      { equipeId: equipeIds[0], userId: userIds[3], est_responsable: false },
      { equipeId: equipeIds[1], userId: userIds[1], est_responsable: true },
      { equipeId: equipeIds[1], userId: userIds[4], est_responsable: false },
      { equipeId: equipeIds[2], userId: userIds[2], est_responsable: true },
      { equipeId: equipeIds[2], userId: userIds[5], est_responsable: false }
    ];
    
    for (const membreData of equipeMembres) {
      this.addEquipeMembre(membreData);
    }
    
    // Ajouter des paramètres système
    const parametres = [
      {
        cle: "delai_notification_tache",
        valeur: "3",
        categorie: "notifications",
        description: "Délai en jours avant d'envoyer une notification pour une tâche à échéance"
      },
      {
        cle: "notifications_email_actives",
        valeur: "true",
        categorie: "notifications",
        description: "Activer/désactiver les notifications par email"
      },
      {
        cle: "duree_defaut_tache",
        valeur: "14",
        categorie: "taches",
        description: "Durée par défaut (en jours) pour une nouvelle tâche"
      },
      {
        cle: "theme_interface",
        valeur: "clair",
        categorie: "interface",
        description: "Thème de l'interface (clair/sombre)"
      }
    ];
    
    for (const parametreData of parametres) {
      this.createParametre(parametreData);
    }

    // Ajouter des révisions
    const revisions = [
      {
        pieceJointeId: pieceJointeIds[0],
        indice: "A",
        description: "Première version",
        userId: userIds[3]
      },
      {
        pieceJointeId: pieceJointeIds[0],
        indice: "B",
        description: "Ajout des détails de ferraillage",
        userId: userIds[0]
      },
      {
        pieceJointeId: pieceJointeIds[3],
        indice: "1.0",
        description: "Version initiale",
        userId: userIds[2]
      },
      {
        pieceJointeId: pieceJointeIds[3],
        indice: "2.0",
        description: "Modification suite retour bureau de contrôle",
        userId: userIds[0]
      }
    ];

    for (const revisionData of revisions) {
      this.createRevision(revisionData);
    }
  }
}

import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // Utilisateurs
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return await db.select().from(users).where(eq(users.role, role));
    } else {
      return await db.select().from(users);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Chantiers
  async getChantier(id: number): Promise<Chantier | undefined> {
    const [chantier] = await db.select().from(chantiers).where(eq(chantiers.id, id));
    return chantier || undefined;
  }

  async getChantiers(): Promise<Chantier[]> {
    return await db.select().from(chantiers);
  }

  async createChantier(chantier: InsertChantier): Promise<Chantier> {
    const [newChantier] = await db.insert(chantiers).values(chantier).returning();

    // Créer une activité
    await this.createActivite({
      type: 'creation',
      description: `a créé le chantier "${chantier.nom}"`,
      userId: undefined,
      targetId: newChantier.id,
      targetType: 'chantier',
      metadata: null
    });

    return newChantier;
  }

  async updateChantier(id: number, chantier: Partial<InsertChantier>): Promise<Chantier | undefined> {
    const [existingChantier] = await db.select().from(chantiers).where(eq(chantiers.id, id));
    if (!existingChantier) return undefined;

    const [updatedChantier] = await db.update(chantiers)
      .set(chantier)
      .where(eq(chantiers.id, id))
      .returning();

    // Créer une activité
    await this.createActivite({
      type: 'modification',
      description: `a modifié le chantier "${updatedChantier.nom}"`,
      userId: undefined,
      targetId: id,
      targetType: 'chantier',
      metadata: null
    });

    return updatedChantier;
  }

  async deleteChantier(id: number): Promise<boolean> {
    const [existingChantier] = await db.select().from(chantiers).where(eq(chantiers.id, id));
    if (!existingChantier) return false;

    // Supprimer tous les lots associés
    const lotsASupprimer = await db.select().from(lots).where(eq(lots.chantierId, id));

    for (const lot of lotsASupprimer) {
      await this.deleteLot(lot.id);
    }

    // Supprimer toutes les tâches associées directement au chantier
    const tachesASupprimer = await db.select().from(taches).where(eq(taches.chantierId, id));

    for (const tache of tachesASupprimer) {
      await this.deleteTache(tache.id);
    }

    await db.delete(chantiers).where(eq(chantiers.id, id));
    return true;
  }

  // Lots
  async getLot(id: number): Promise<Lot | undefined> {
    const [lot] = await db.select().from(lots).where(eq(lots.id, id));
    return lot || undefined;
  }

  async getLotsByChantierId(chantierId: number): Promise<Lot[]> {
    return await db.select().from(lots).where(eq(lots.chantierId, chantierId));
  }

  async createLot(lot: InsertLot): Promise<Lot> {
    const [newLot] = await db.insert(lots).values(lot).returning();

    // Chercher le chantier pour l'activité
    const chantier = await this.getChantier(lot.chantierId);

    // Créer une activité
    await this.createActivite({
      type: 'creation',
      description: `a créé le lot "${lot.nom}" pour le chantier "${chantier?.nom || 'Inconnu'}"`,
      userId: undefined,
      targetId: lot.chantierId,
      targetType: 'chantier',
      metadata: null
    });

    return newLot;
  }

  async updateLot(id: number, lot: Partial<InsertLot>): Promise<Lot | undefined> {
    const [existingLot] = await db.select().from(lots).where(eq(lots.id, id));
    if (!existingLot) return undefined;

    const [updatedLot] = await db.update(lots)
      .set(lot)
      .where(eq(lots.id, id))
      .returning();

    return updatedLot;
  }

  async deleteLot(id: number): Promise<boolean> {
    const [existingLot] = await db.select().from(lots).where(eq(lots.id, id));
    if (!existingLot) return false;

    // Supprimer tous les pilotes de ce lot
    await db.delete(lotPilotes).where(eq(lotPilotes.lotId, id));

    // Supprimer toutes les tâches associées à ce lot
    const tachesASupprimer = await db.select().from(taches).where(eq(taches.lotId, id));

    for (const tache of tachesASupprimer) {
      await this.deleteTache(tache.id);
    }

    await db.delete(lots).where(eq(lots.id, id));
    return true;
  }

  // Pilotes de lots
  async getLotPilotes(lotId: number): Promise<LotPilote[]> {
    return await db.select().from(lotPilotes).where(eq(lotPilotes.lotId, lotId));
  }

  async addLotPilote(pilote: InsertLotPilote): Promise<LotPilote> {
    const [newPilote] = await db.insert(lotPilotes).values(pilote).returning();

    // Chercher le lot et l'utilisateur pour l'activité
    const lot = await this.getLot(pilote.lotId);
    const user = await this.getUser(pilote.userId);

    if (lot && user) {
      // Créer une activité
      await this.createActivite({
        type: 'assignation',
        description: `a été assigné(e) comme pilote du lot "${lot.nom}"`,
        userId: pilote.userId,
        targetId: lot.chantierId,
        targetType: 'chantier',
        metadata: {
          lotId: lot.id,
          lotNom: lot.nom
        }
      });
    }

    return newPilote;
  }

  async removeLotPilote(lotId: number, userId: number): Promise<boolean> {
    await db.delete(lotPilotes)
      .where(
        and(
          eq(lotPilotes.lotId, lotId),
          eq(lotPilotes.userId, userId)
        )
      );
    return true;
  }

  async setLotPilotes(lotId: number, userIds: number[]): Promise<boolean> {
    // Récupérer les pilotes actuels
    const pilotesActuels = await this.getLotPilotes(lotId);
    const userIdsActuels = pilotesActuels.map(p => p.userId);

    // Supprimer les pilotes qui ne sont plus dans la liste
    for (const pilote of pilotesActuels) {
      if (!userIds.includes(pilote.userId)) {
        await this.removeLotPilote(lotId, pilote.userId);
      }
    }

    // Ajouter les nouveaux pilotes
    for (const userId of userIds) {
      if (!userIdsActuels.includes(userId)) {
        await this.addLotPilote({ lotId, userId });
      }
    }

    return true;
  }

  // Tâches
  async getTache(id: number): Promise<Tache | undefined> {
    const [tache] = await db.select().from(taches).where(eq(taches.id, id));
    return tache || undefined;
  }

  async getTacheWithDetails(id: number): Promise<any | undefined> {
    const [tache] = await db.select().from(taches).where(eq(taches.id, id));
    if (!tache) return undefined;

    const [chantier] = await db.select().from(chantiers).where(eq(chantiers.id, tache.chantierId));
    const intervenants = await this.getTacheIntervenants(id);
    const piecesJointes = await this.getPiecesJointesForTache(id);
    const historique = await this.getActivitesForTache(id);

    // Enrichir les pièces jointes avec leurs révisions et informations sur l'uploader
    const piecesJointesEnrichies = await Promise.all(piecesJointes.map(async (pj) => {
      const revisionsList = await this.getRevisionsForPieceJointe(pj.id);
      const [uploader] = await db.select().from(users).where(eq(users.id, pj.uploaderId));

      // Enrichir les révisions avec les informations utilisateur
      const revisionsEnrichies = await Promise.all(revisionsList.map(async (rev) => {
        const [user] = await db.select().from(users).where(eq(users.id, rev.userId));
        return {
          ...rev,
          user: user ? { 
            id: user.id,
            nom: user.nom,
            prenom: user.prenom
          } : null
        };
      }));

      return {
        ...pj,
        uploader: uploader ? { 
          id: uploader.id,
          nom: uploader.nom,
          prenom: uploader.prenom
        } : null,
        revisions: revisionsEnrichies
      };
    }));

    // Enrichir l'historique avec les informations utilisateur
    const historiqueEnrichi = await Promise.all(historique.map(async (item) => {
      const [user] = item.userId ? await db.select().from(users).where(eq(users.id, item.userId)) : [null];
      return {
        ...item,
        user: user ? { 
          id: user.id,
          nom: user.nom,
          prenom: user.prenom
        } : null
      };
    }));

    // Enrichir les intervenants avec les informations utilisateur
    const intervenantsEnrichis = await Promise.all(intervenants.map(async (intervenant) => {
      const [user] = await db.select().from(users).where(eq(users.id, intervenant.userId));
      return {
        ...intervenant,
        nom: user?.nom || "",
        prenom: user?.prenom || ""
      };
    }));

    // Récupérer l'utilisateur qui a fait la dernière mise à jour
    const [updatedBy] = tache.updated_by 
      ? await db.select().from(users).where(eq(users.id, tache.updated_by)) 
      : [null];

    // Récupérer le pilote et l'intervenant
    const [pilote] = tache.piloteId 
      ? await db.select().from(users).where(eq(users.id, tache.piloteId)) 
      : [null];
    
    const [intervenant] = tache.intervenantId 
      ? await db.select().from(users).where(eq(users.id, tache.intervenantId)) 
      : [null];

    return {
      ...tache,
      chantierNom: chantier?.nom || "Chantier inconnu",
      intervenants: intervenantsEnrichis,
      piecesJointes: piecesJointesEnrichies,
      historique: historiqueEnrichi,
      updated_by: updatedBy ? {
        id: updatedBy.id,
        nom: updatedBy.nom,
        prenom: updatedBy.prenom
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
  }

  async getTaches(startDate?: string, endDate?: string): Promise<Tache[]> {
    const conditions = [];
    if (startDate) {
      conditions.push(gte(taches.dateRealisation, new Date(startDate + "T00:00:00.000Z")));
    }
    if (endDate) {
      conditions.push(lte(taches.dateRealisation, new Date(endDate + "T23:59:59.999Z")));
    }

    if (conditions.length > 0) {
      return await db.select().from(taches).where(and(...conditions));
    } else {
      return await db.select().from(taches);
    }
  }

  async getRecentTaches(limit: number = 5): Promise<any[]> {
    const tachesList = await db.select()
      .from(taches)
      .orderBy(desc(taches.updated_at))
      .limit(limit);

    // Enrichir les tâches avec des données additionnelles
    return Promise.all(tachesList.map(async (tache) => {
      const [chantier] = await db.select().from(chantiers).where(eq(chantiers.id, tache.chantierId));
      const intervenants = await this.getTacheIntervenants(tache.id);

      const intervenantsEnrichis = await Promise.all(intervenants.map(async (intervenant) => {
        const [user] = await db.select().from(users).where(eq(users.id, intervenant.userId));
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
  }

  async getTachesByChantierId(chantierId: number): Promise<Tache[]> {
    return await db.select().from(taches).where(eq(taches.chantierId, chantierId));
  }

  async getTachesByLotId(lotId: number): Promise<Tache[]> {
    return await db.select().from(taches).where(eq(taches.lotId, lotId));
  }

  async createTache(tache: InsertTache): Promise<Tache> {
    const [newTache] = await db.insert(taches).values(tache).returning();

    // Créer une activité
    await this.createActivite({
      type: 'creation',
      description: `a créé la tâche "${tache.titre}"`,
      userId: tache.updated_by || undefined,
      targetId: newTache.id,
      targetType: 'tache',
      metadata: null
    });

    return newTache;
  }

  async updateTache(id: number, tache: Partial<InsertTache>): Promise<Tache | undefined> {
    const [existingTache] = await db.select().from(taches).where(eq(taches.id, id));
    if (!existingTache) return undefined;

    const [updatedTache] = await db.update(taches)
      .set(tache)
      .where(eq(taches.id, id))
      .returning();

    // Créer une activité
    await this.createActivite({
      type: 'modification',
      description: `a modifié la tâche "${updatedTache.titre}"`,
      userId: tache.updated_by || existingTache.updated_by || undefined,
      targetId: id,
      targetType: 'tache',
      metadata: null
    });

    return updatedTache;
  }

  async updateTacheStatut(id: number, statut: string, userId?: number): Promise<Tache | undefined> {
    const [existingTache] = await db.select().from(taches).where(eq(taches.id, id));
    if (!existingTache) return undefined;

    // Pas de mise à jour si le statut est le même
    if (existingTache.statut === statut) return existingTache;

    const [updatedTache] = await db.update(taches)
      .set({ 
        statut, 
        updated_by: userId || existingTache.updated_by 
      })
      .where(eq(taches.id, id))
      .returning();

    // Créer une activité
    await this.createActivite({
      type: 'statut',
      description: `a changé le statut de la tâche "${updatedTache.titre}" en "${this.getStatusText(statut)}"`,
      userId: userId,
      targetId: id,
      targetType: 'tache',
      metadata: {
        previousStatus: existingTache.statut,
        newStatus: statut
      }
    });

    return updatedTache;
  }

  async deleteTache(id: number): Promise<boolean> {
    const [existingTache] = await db.select().from(taches).where(eq(taches.id, id));
    if (!existingTache) return false;

    // Supprimer les intervenants
    await db.delete(tacheIntervenants).where(eq(tacheIntervenants.tacheId, id));

    // Supprimer les pièces jointes et leurs révisions
    const piecesJointesASupprimer = await db.select().from(piecesJointes).where(eq(piecesJointes.tacheId, id));

    for (const pieceJointe of piecesJointesASupprimer) {
      // Supprimer les révisions
      await db.delete(revisions).where(eq(revisions.pieceJointeId, pieceJointe.id));

      // Supprimer la pièce jointe
      await db.delete(piecesJointes).where(eq(piecesJointes.id, pieceJointe.id));
    }

    // Supprimer les activités liées
    await db.delete(activites)
      .where(
        and(
          eq(activites.targetId, id),
          eq(activites.targetType, 'tache')
        )
      );

    // Supprimer les notifications liées
    await db.delete(notifications)
      .where(
        and(
          eq(notifications.targetId, id),
          eq(notifications.targetType, 'tache')
        )
      );

    // Supprimer la tâche
    await db.delete(taches).where(eq(taches.id, id));

    return true;
  }

  // Intervenants des tâches
  async getTacheIntervenants(tacheId: number): Promise<TacheIntervenant[]> {
    return await db.select()
      .from(tacheIntervenants)
      .where(eq(tacheIntervenants.tacheId, tacheId));
  }

  async addTacheIntervenant(tacheIntervenant: InsertTacheIntervenant): Promise<TacheIntervenant> {
    const [newIntervenant] = await db.insert(tacheIntervenants)
      .values(tacheIntervenant)
      .returning();

    // Chercher la tâche et l'utilisateur pour l'activité
    const [tache] = await db.select().from(taches).where(eq(taches.id, tacheIntervenant.tacheId));
    const [user] = await db.select().from(users).where(eq(users.id, tacheIntervenant.userId));

    if (tache && user) {
      // Créer une activité
      await this.createActivite({
        type: 'assignation',
        description: `a été assigné(e) à la tâche "${tache.titre}"`,
        userId: tacheIntervenant.userId,
        targetId: tacheIntervenant.tacheId,
        targetType: 'tache',
        metadata: null
      });

      // Créer une notification pour l'utilisateur
      await this.createNotification({
        userId: tacheIntervenant.userId,
        message: `Vous avez été assigné(e) à la tâche "${tache.titre}"`,
        lue: false,
        targetId: tache.id,
        targetType: 'tache'
      });
    }

    return newIntervenant;
  }

  async removeTacheIntervenant(tacheId: number, userId: number): Promise<boolean> {
    await db.delete(tacheIntervenants)
      .where(
        and(
          eq(tacheIntervenants.tacheId, tacheId),
          eq(tacheIntervenants.userId, userId)
        )
      );

    return true;
  }

  async setTacheIntervenants(tacheId: number, userIds: number[]): Promise<boolean> {
    // Récupérer les intervenants actuels
    const intervenantsActuels = await this.getTacheIntervenants(tacheId);
    const userIdsActuels = intervenantsActuels.map(i => i.userId);

    // Supprimer les intervenants qui ne sont plus dans la liste
    for (const intervenant of intervenantsActuels) {
      if (!userIds.includes(intervenant.userId)) {
        await this.removeTacheIntervenant(tacheId, intervenant.userId);
      }
    }

    // Ajouter les nouveaux intervenants
    for (const userId of userIds) {
      if (!userIdsActuels.includes(userId)) {
        await this.addTacheIntervenant({ tacheId, userId });
      }
    }

    return true;
  }

  // Pièces jointes
  async getPieceJointe(id: number): Promise<PieceJointe | undefined> {
    const [pieceJointe] = await db.select().from(piecesJointes).where(eq(piecesJointes.id, id));
    return pieceJointe || undefined;
  }

  async getPiecesJointesForTache(tacheId: number): Promise<PieceJointe[]> {
    return await db.select()
      .from(piecesJointes)
      .where(eq(piecesJointes.tacheId, tacheId));
  }

  async createPieceJointe(pieceJointe: InsertPieceJointe): Promise<PieceJointe> {
    const [newPieceJointe] = await db.insert(piecesJointes)
      .values(pieceJointe)
      .returning();

    // Chercher la tâche pour l'activité
    const [tache] = await db.select().from(taches).where(eq(taches.id, pieceJointe.tacheId));

    if (tache) {
      // Créer une activité
      await this.createActivite({
        type: 'document',
        description: `a ajouté le document "${pieceJointe.nom}" à la tâche "${tache.titre}"`,
        userId: pieceJointe.uploaderId,
        targetId: pieceJointe.tacheId,
        targetType: 'tache',
        metadata: {
          documentId: newPieceJointe.id,
          documentType: pieceJointe.type
        }
      });

      // Notifier les intervenants de la tâche
      const intervenants = await this.getTacheIntervenants(tache.id);
      for (const intervenant of intervenants) {
        if (intervenant.userId !== pieceJointe.uploaderId) {
          await this.createNotification({
            userId: intervenant.userId,
            message: `Un nouveau document a été ajouté à la tâche "${tache.titre}"`,
            lue: false,
            targetId: tache.id,
            targetType: 'tache'
          });
        }
      }
    }

    return newPieceJointe;
  }

  async deletePieceJointe(id: number): Promise<boolean> {
    const [pieceJointe] = await db.select().from(piecesJointes).where(eq(piecesJointes.id, id));
    if (!pieceJointe) return false;

    // Supprimer les révisions
    await db.delete(revisions).where(eq(revisions.pieceJointeId, id));

    // Supprimer la pièce jointe
    await db.delete(piecesJointes).where(eq(piecesJointes.id, id));

    return true;
  }

  // Révisions
  async getRevision(id: number): Promise<Revision | undefined> {
    const [revision] = await db.select().from(revisions).where(eq(revisions.id, id));
    return revision || undefined;
  }

  async getRevisionsForPieceJointe(pieceJointeId: number): Promise<Revision[]> {
    return await db.select()
      .from(revisions)
      .where(eq(revisions.pieceJointeId, pieceJointeId))
      .orderBy(desc(revisions.created_at));
  }

  async createRevision(revision: InsertRevision): Promise<Revision> {
    const [newRevision] = await db.insert(revisions)
      .values(revision)
      .returning();

    // Chercher la pièce jointe et la tâche pour l'activité
    const [pieceJointe] = await db.select().from(piecesJointes).where(eq(piecesJointes.id, revision.pieceJointeId));

    if (pieceJointe) {
      const [tache] = await db.select().from(taches).where(eq(taches.id, pieceJointe.tacheId));

      if (tache) {
        // Mettre à jour le statut de la tâche en "en révision" si nécessaire
        if (tache.statut !== StatutTache.EN_REVISION) {
          await this.updateTacheStatut(tache.id, StatutTache.EN_REVISION, revision.userId);
        }

        // Créer une activité
        await this.createActivite({
          type: 'revision',
          description: `a créé une révision "${revision.indice}" pour le document "${pieceJointe.nom}"`,
          userId: revision.userId,
          targetId: pieceJointe.tacheId,
          targetType: 'tache',
          metadata: {
            documentId: pieceJointe.id,
            documentName: pieceJointe.nom,
            revisionIndice: revision.indice,
            revisionDescription: revision.description
          }
        });

        // Notifier les intervenants de la tâche
        const intervenants = await this.getTacheIntervenants(tache.id);
        for (const intervenant of intervenants) {
          if (intervenant.userId !== revision.userId) {
            await this.createNotification({
              userId: intervenant.userId,
              message: `Une nouvelle révision (${revision.indice}) a été créée pour le document "${pieceJointe.nom}"`,
              lue: false,
              targetId: tache.id,
              targetType: 'tache'
            });
          }
        }
      }
    }

    return newRevision;
  }

  // Activités
  async getActivites(limit: number = 20): Promise<Activite[]> {
    return await db.select()
      .from(activites)
      .orderBy(desc(activites.created_at))
      .limit(limit);
  }

  async getActivitesForTache(tacheId: number): Promise<Activite[]> {
    return await db.select()
      .from(activites)
      .where(
        and(
          eq(activites.targetId, tacheId),
          eq(activites.targetType, 'tache')
        )
      )
      .orderBy(desc(activites.created_at));
  }

  async createActivite(activite: InsertActivite): Promise<Activite> {
    const [newActivite] = await db.insert(activites)
      .values(activite)
      .returning();

    return newActivite;
  }

  // Notifications
  async getNotificationsForUser(userId: number): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.created_at));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications)
      .values(notification)
      .returning();

    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    if (!notification) return false;

    await db.update(notifications)
      .set({ lue: true })
      .where(eq(notifications.id, id));

    return true;
  }

  // Dashboard
  async getDashboardStats(): Promise<any> {
    // Statistiques actuelles
    const [chantiersActifsCount] = await db.select({ count: db.fn.count() })
      .from(chantiers)
      .where(eq(chantiers.statut, 'actif'));

    const [tachesEnCoursCount] = await db.select({ count: db.fn.count() })
      .from(taches)
      .where(eq(taches.statut, StatutTache.EN_COURS));

    const [tachesEnRetardCount] = await db.select({ count: db.fn.count() })
      .from(taches)
      .where(eq(taches.statut, StatutTache.EN_RETARD));

    // Récupérer le nombre de révisions
    const [revisionsCount] = await db.select({ count: db.fn.count() })
      .from(revisions);

    // Simuler des évolutions (pour démo)
    const chantiersEvolution = 12;  // 12% de plus qu'il y a un mois
    const tachesEvolution = 4;      // 4% de plus qu'il y a une semaine
    const retardsEvolution = 8;     // 8% de plus qu'il y a une semaine
    const revisionsEvolution = -6;  // 6% de moins qu'il y a un mois

    return {
      chantiersActifs: Number(chantiersActifsCount.count),
      tachesEnCours: Number(tachesEnCoursCount.count),
      tachesEnRetard: Number(tachesEnRetardCount.count),
      revisionsPlans: Number(revisionsCount.count),
      chantiersEvolution,
      tachesEvolution,
      retardsEvolution,
      revisionsEvolution
    };
  }

  // Méthodes utilitaires
  private getStatusText(statut: string): string {
    switch (statut) {
      case StatutTache.A_FAIRE:
        return "À faire";
      case StatutTache.EN_COURS:
        return "En cours";
      case StatutTache.EN_VALIDATION:
        return "En validation";
      case StatutTache.TERMINE:
        return "Terminé";
      case StatutTache.EN_RETARD:
        return "En retard";
      case StatutTache.EN_REVISION:
        return "En révision";
      default:
        return statut;
    }
  }
}

// Pour l'instant, on utilise MemStorage car le développement est en cours
// À terme, on pourra commenter cette ligne et utiliser DatabaseStorage pour la production
// Temporairement, nous ajoutons les méthodes manquantes pour la gestion des ressources
MemStorage.prototype.getRessources = async function(): Promise<Ressource[]> {
  return Array.from(this.ressources.values());
};

MemStorage.prototype.getRessource = async function(id: number): Promise<Ressource | undefined> {
  return this.ressources.get(id);
};

MemStorage.prototype.createRessource = async function(ressource: InsertRessource): Promise<Ressource> {
  const id = this.ressourceId++;
  const now = new Date();
  const newRessource: Ressource = {
    ...ressource,
    id,
    created_at: now
  };
  this.ressources.set(id, newRessource);

  // Créer une activité
  await this.createActivite({
    type: 'creation',
    description: `a créé la ressource "${ressource.nom}"`,
    userId: undefined,
    targetId: id,
    targetType: 'ressource',
    metadata: null
  });

  return newRessource;
};

MemStorage.prototype.updateRessource = async function(id: number, ressource: Partial<InsertRessource>): Promise<Ressource | undefined> {
  const existingRessource = this.ressources.get(id);
  if (!existingRessource) return undefined;

  const updatedRessource = { ...existingRessource, ...ressource };
  this.ressources.set(id, updatedRessource);

  // Créer une activité
  await this.createActivite({
    type: 'modification',
    description: `a modifié la ressource "${updatedRessource.nom}"`,
    userId: undefined,
    targetId: id,
    targetType: 'ressource',
    metadata: null
  });

  return updatedRessource;
};

MemStorage.prototype.deleteRessource = async function(id: number): Promise<boolean> {
  const existingRessource = this.ressources.get(id);
  if (!existingRessource) return false;

  // Supprimer tous les affectations associées
  const affectationsASupprimer = Array.from(this.ressourceAffectations.values())
    .filter(aff => aff.ressourceId === id);

  for (const affectation of affectationsASupprimer) {
    this.ressourceAffectations.delete(affectation.id);
  }

  // Supprimer toutes les disponibilités associées
  const disponibilitesASupprimer = Array.from(this.ressourceDisponibilites.values())
    .filter(dispo => dispo.ressourceId === id);

  for (const disponibilite of disponibilitesASupprimer) {
    this.ressourceDisponibilites.delete(disponibilite.id);
  }

  return this.ressources.delete(id);
};

MemStorage.prototype.getRessourceAffectations = async function(ressourceId: number): Promise<RessourceAffectation[]> {
  return Array.from(this.ressourceAffectations.values())
    .filter(affectation => affectation.ressourceId === ressourceId);
};

MemStorage.prototype.createRessourceAffectation = async function(affectation: InsertRessourceAffectation): Promise<RessourceAffectation> {
  const id = this.ressourceAffectationId++;
  const newAffectation: RessourceAffectation = { ...affectation, id };
  this.ressourceAffectations.set(id, newAffectation);

  // Créer une activité
  const ressource = this.ressources.get(affectation.ressourceId);
  if (ressource) {
    await this.createActivite({
      type: 'affectation',
      description: `a affecté la ressource "${ressource.nom}" à une tâche`,
      userId: undefined,
      targetId: affectation.tacheId,
      targetType: 'tache',
      metadata: {
        ressourceId: affectation.ressourceId,
        ressourceNom: ressource.nom,
        quantite: affectation.quantite,
        periodeDebut: affectation.periodeDebut,
        periodeFin: affectation.periodeFin
      }
    });
  }

  return newAffectation;
};

MemStorage.prototype.updateRessourceAffectation = async function(id: number, affectation: Partial<InsertRessourceAffectation>): Promise<RessourceAffectation | undefined> {
  const existingAffectation = this.ressourceAffectations.get(id);
  if (!existingAffectation) return undefined;

  const updatedAffectation = { ...existingAffectation, ...affectation };
  this.ressourceAffectations.set(id, updatedAffectation);

  return updatedAffectation;
};

MemStorage.prototype.deleteRessourceAffectation = async function(id: number): Promise<boolean> {
  return this.ressourceAffectations.delete(id);
};

MemStorage.prototype.getRessourceDisponibilites = async function(ressourceId: number): Promise<RessourceDisponibilite[]> {
  return Array.from(this.ressourceDisponibilites.values())
    .filter(disponibilite => disponibilite.ressourceId === ressourceId);
};

MemStorage.prototype.createRessourceDisponibilite = async function(disponibilite: InsertRessourceDisponibilite): Promise<RessourceDisponibilite> {
  const id = this.ressourceDisponibiliteId++;
  const newDisponibilite: RessourceDisponibilite = { ...disponibilite, id };
  this.ressourceDisponibilites.set(id, newDisponibilite);
  return newDisponibilite;
};

MemStorage.prototype.deleteRessourceDisponibilite = async function(id: number): Promise<boolean> {
  return this.ressourceDisponibilites.delete(id);
};

// Méthodes pour les équipes
MemStorage.prototype.getEquipes = async function(): Promise<Equipe[]> {
  return Array.from(this.equipes.values());
};

MemStorage.prototype.getEquipe = async function(id: number): Promise<Equipe | undefined> {
  return this.equipes.get(id);
};

MemStorage.prototype.createEquipe = async function(equipe: InsertEquipe): Promise<Equipe> {
  const id = this.equipeId++;
  const now = new Date().toISOString();
  const newEquipe: Equipe = {
    ...equipe,
    id,
    created_at: now
  };
  this.equipes.set(id, newEquipe);
  
  // Créer une activité
  await this.createActivite({
    type: 'creation',
    description: `a créé l'équipe "${equipe.nom}"`,
    userId: undefined,
    targetId: id,
    targetType: 'equipe',
    metadata: null
  });
  
  return newEquipe;
};

MemStorage.prototype.updateEquipe = async function(id: number, equipe: Partial<InsertEquipe>): Promise<Equipe | undefined> {
  const existingEquipe = this.equipes.get(id);
  if (!existingEquipe) return undefined;
  
  const updatedEquipe = { ...existingEquipe, ...equipe };
  this.equipes.set(id, updatedEquipe);
  
  // Créer une activité
  await this.createActivite({
    type: 'modification',
    description: `a modifié l'équipe "${updatedEquipe.nom}"`,
    userId: undefined,
    targetId: id,
    targetType: 'equipe',
    metadata: null
  });
  
  return updatedEquipe;
};

MemStorage.prototype.deleteEquipe = async function(id: number): Promise<boolean> {
  const existingEquipe = this.equipes.get(id);
  if (!existingEquipe) return false;
  
  // Supprimer tous les membres de cette équipe
  await this.removeAllEquipeMembres(id);
  
  return this.equipes.delete(id);
};

// Méthodes pour les membres d'équipe
MemStorage.prototype.getEquipeMembres = async function(equipeId: number): Promise<EquipeMembre[]> {
  return Array.from(this.equipeMembres.values())
    .filter(membre => membre.equipeId === equipeId);
};

MemStorage.prototype.addEquipeMembre = async function(membre: InsertEquipeMembre): Promise<EquipeMembre> {
  const id = this.equipeMembreId++;
  const newMembre: EquipeMembre = { ...membre, id };
  this.equipeMembres.set(id, newMembre);
  
  // Chercher l'équipe et l'utilisateur pour l'activité
  const equipe = await this.getEquipe(membre.equipeId);
  const user = await this.getUser(membre.userId);
  
  if (equipe && user) {
    // Créer une activité
    await this.createActivite({
      type: 'assignation',
      description: `a été ajouté(e) à l'équipe "${equipe.nom}"${membre.est_responsable ? " en tant que responsable" : ""}`,
      userId: membre.userId,
      targetId: equipe.id,
      targetType: 'equipe',
      metadata: {
        equipeId: equipe.id,
        equipeNom: equipe.nom,
        est_responsable: membre.est_responsable
      }
    });
  }
  
  return newMembre;
};

MemStorage.prototype.removeEquipeMembre = async function(equipeId: number, userId: number): Promise<boolean> {
  const membre = Array.from(this.equipeMembres.values())
    .find(m => m.equipeId === equipeId && m.userId === userId);
  
  if (!membre) return false;
  
  return this.equipeMembres.delete(membre.id);
};

MemStorage.prototype.removeAllEquipeMembres = async function(equipeId: number): Promise<boolean> {
  const membres = await this.getEquipeMembres(equipeId);
  
  for (const membre of membres) {
    this.equipeMembres.delete(membre.id);
  }
  
  return true;
};

// Méthodes pour les paramètres
MemStorage.prototype.getParametres = async function(): Promise<Parametre[]> {
  return Array.from(this.parametres.values());
};

MemStorage.prototype.getParametreParCle = async function(cle: string): Promise<Parametre | undefined> {
  return Array.from(this.parametres.values())
    .find(param => param.cle === cle);
};

MemStorage.prototype.createParametre = async function(parametre: InsertParametre): Promise<Parametre> {
  const id = this.parametreId++;
  const now = new Date().toISOString();
  const newParametre: Parametre = {
    ...parametre,
    id,
    created_at: now,
    updated_at: now
  };
  this.parametres.set(id, newParametre);
  
  return newParametre;
};

MemStorage.prototype.updateParametre = async function(id: number, parametre: Partial<InsertParametre>): Promise<Parametre | undefined> {
  const existingParametre = this.parametres.get(id);
  if (!existingParametre) return undefined;
  
  const now = new Date().toISOString();
  const updatedParametre = {
    ...existingParametre,
    ...parametre,
    updated_at: now
  };
  this.parametres.set(id, updatedParametre);
  
  return updatedParametre;
};

MemStorage.prototype.deleteParametre = async function(id: number): Promise<boolean> {
  return this.parametres.delete(id);
};

MemStorage.prototype.getRessourcesPlanning = async function(debut: Date, fin: Date): Promise<any[]> {
  console.log(`Recherche planning entre ${debut.toISOString()} et ${fin.toISOString()}`);

  // Récupérer toutes les affectations et disponibilités
  const planningItems = [];

  // 1. Affectations qui tombent dans la période
  const affectations = Array.from(this.ressourceAffectations.values())
    .filter(aff => {
      const periodeDebut = new Date(aff.periodeDebut);
      const periodeFin = new Date(aff.periodeFin);
      console.log(`Affectation ${aff.id}: ${periodeDebut.toISOString()} - ${periodeFin.toISOString()}`);
      return (periodeDebut <= fin && periodeFin >= debut);
    });

  console.log(`Trouvé ${affectations.length} affectations dans la période`);

  // Enrichir les affectations
  for (const aff of affectations) {
    const ressource = this.ressources.get(aff.ressourceId);
    const tache = this.taches.get(aff.tacheId);

    planningItems.push({
      type: 'affectation',
      id: aff.id,
      debut: aff.periodeDebut,
      fin: aff.periodeFin,
      ressourceId: aff.ressourceId,
      ressource: ressource ? {
        id: ressource.id,
        nom: ressource.nom,
        type: ressource.type,
        statut: ressource.statut
      } : null,
      tacheId: aff.tacheId,
      tache: tache ? {
        id: tache.id,
        titre: tache.titre,
        statut: tache.statut
      } : null,
      quantite: aff.quantite,
      commentaire: aff.commentaire
    });
  }

  // 2. Disponibilités qui tombent dans la période
  const disponibilites = Array.from(this.ressourceDisponibilites.values())
    .filter(dispo => {
      const dateDebut = new Date(dispo.date_debut);
      const dateFin = new Date(dispo.date_fin);
      console.log(`Disponibilité ${dispo.id}: ${dateDebut.toISOString()} - ${dateFin.toISOString()}`);
      return (dateDebut <= fin && dateFin >= debut);
    });

  console.log(`Trouvé ${disponibilites.length} disponibilités dans la période`);

  // Enrichir les disponibilités
  for (const dispo of disponibilites) {
    const ressource = this.ressources.get(dispo.ressourceId);

    planningItems.push({
      type: 'disponibilite',
      id: dispo.id,
      debut: dispo.date_debut,
      fin: dispo.date_fin,
      ressourceId: dispo.ressourceId,
      ressource: ressource ? {
        id: ressource.id,
        nom: ressource.nom,
        type: ressource.type,
        statut: ressource.statut
      } : null,
      statut: dispo.statut,
      commentaire: dispo.commentaire
    });
  }

  // Trier les éléments par date de début
  return planningItems.sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime());
}



export const storage = new MemStorage();

// Décommenter cette ligne pour utiliser la base de données PostgreSQL
// export const storage = new DatabaseStorage();