import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Utilisateurs (avec rôles spécifiques pour Spiess TP)
export const RoleUtilisateur = {
  RESPONSABLE_TRAVAUX: "responsable_travaux",
  CONDUCTEUR_TRAVAUX: "conducteur_travaux",
  RESPONSABLE_ETUDE: "responsable_etude",
  DIRECTEUR: "directeur",
  SERVICE_INTERNE: "service_interne",
  ASSISTANTE_CONDUCTRICE: "assistante_conductrice",
  GEOMETRE_PROJETEUR: "geometre_projeteur"
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  role: text("role").notNull(), // utiliser les valeurs de RoleUtilisateur
  avatar: text("avatar"),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Chantiers / Projets
export const chantiers = pgTable("chantiers", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  description: text("description"),
  adresse: text("adresse"),
  statut: text("statut").notNull().default("actif"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertChantierSchema = createInsertSchema(chantiers).omit({
  id: true,
  created_at: true,
});

// Lots des chantiers
export const lots = pgTable("lots", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  type: text("type").notNull().default("structure"), // structure, reseaux_secs, reseaux_humides, voirie, etc.
  description: text("description"),
  chantierId: integer("chantier_id").notNull(),
  code: text("code"), // Ex: VRD, RS (Réseaux Secs), etc.
  created_at: timestamp("created_at").defaultNow(),
});

export const insertLotSchema = createInsertSchema(lots).omit({
  id: true,
  created_at: true,
});

// Pilotes (responsables) des lots (Max, Renaud, Stéphane, Jean-Michel, etc.)
export const lotPilotes = pgTable("lot_pilotes", {
  id: serial("id").primaryKey(),
  lotId: integer("lot_id").notNull(),
  userId: integer("user_id").notNull(), // Référence à l'utilisateur qui pilote le lot
});

export const insertLotPiloteSchema = createInsertSchema(lotPilotes).omit({
  id: true,
});

// Tâches
export const taches = pgTable("taches", {
  id: serial("id").primaryKey(),
  titre: text("titre").notNull(),
  description: text("description"),
  lotId: integer("lot_id").notNull(),
  chantierId: integer("chantier_id").notNull(), // Pour faciliter les recherches directes
  type: text("type").notNull(), // Étude, Conception, Exécution, etc.
  statut: text("statut").notNull().default("a_faire"), // a_faire, en_cours, en_validation, termine, en_retard, en_revision
  progression: integer("progression").default(0), // 0-100
  priorite: text("priorite").default("normale"), // basse, normale, haute, urgente
  dateDemande: timestamp("date_demande"),
  dateRealisation: timestamp("date_realisation"),
  dateLimite: timestamp("date_limite"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  updated_by: integer("updated_by"),
});

export const insertTacheSchema = createInsertSchema(taches).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Intervenants sur les tâches (remplace les exécutants)
export const tacheIntervenants = pgTable("tache_intervenants", {
  id: serial("id").primaryKey(),
  tacheId: integer("tache_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertTacheIntervenantSchema = createInsertSchema(tacheIntervenants).omit({
  id: true,
});

// Pièces jointes
export const piecesJointes = pgTable("pieces_jointes", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  type: text("type").notNull(), // document, plan, photo, rapport, etc.
  url: text("url").notNull(),
  tacheId: integer("tache_id").notNull(),
  uploaderId: integer("uploader_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertPieceJointeSchema = createInsertSchema(piecesJointes).omit({
  id: true,
  created_at: true,
});

// Révisions des plans
export const revisions = pgTable("revisions", {
  id: serial("id").primaryKey(),
  pieceJointeId: integer("piece_jointe_id").notNull(),
  indice: text("indice").notNull(), // e.g., A, B, 1.0, 2.0
  description: text("description").notNull(),
  userId: integer("user_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertRevisionSchema = createInsertSchema(revisions).omit({
  id: true,
  created_at: true,
});

// Activités récentes
export const activites = pgTable("activites", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // creation, modification, validation, revision, retard, assignation
  description: text("description").notNull(),
  userId: integer("user_id"), // null si système
  targetId: integer("target_id"), // id de la tâche, chantier, etc.
  targetType: text("target_type"), // tache, chantier, piece_jointe
  metadata: json("metadata"), // données supplémentaires spécifiques à l'activité
  created_at: timestamp("created_at").defaultNow(),
});

export const insertActiviteSchema = createInsertSchema(activites).omit({
  id: true,
  created_at: true,
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  lue: boolean("lue").default(false),
  targetId: integer("target_id"),
  targetType: text("target_type"), // tache, chantier, piece_jointe
  created_at: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

// Ressources
export const ressources = pgTable("ressources", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  type: text("type").notNull(), // personnel, equipement, vehicule, materiau, outil, autre
  description: text("description"),
  statut: text("statut").notNull().default("disponible"), // disponible, assigne, indisponible, en_maintenance
  cout_horaire: integer("cout_horaire"), // en centimes (100 = 1€)
  caracteristiques: json("caracteristiques"), // données supplémentaires spécifiques au type
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertRessourceSchema = createInsertSchema(ressources).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Affectations de ressources
export const ressourceAffectations = pgTable("ressource_affectations", {
  id: serial("id").primaryKey(),
  ressourceId: integer("ressource_id").notNull(),
  tacheId: integer("tache_id").notNull(),
  periodeDebut: timestamp("periode_debut").notNull(),
  periodeFin: timestamp("periode_fin").notNull(),
  quantite: integer("quantite").default(1),
  commentaire: text("commentaire"),
  created_by: integer("created_by"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertRessourceAffectationSchema = createInsertSchema(ressourceAffectations).omit({
  id: true,
  created_at: true,
  updated_at: true,
  created_by: true,
});

// Disponibilités de ressources
export const ressourceDisponibilites = pgTable("ressource_disponibilites", {
  id: serial("id").primaryKey(),
  ressourceId: integer("ressource_id").notNull(),
  date_debut: timestamp("date_debut").notNull(),
  date_fin: timestamp("date_fin").notNull(),
  statut: text("statut").notNull(), // disponible, indisponible, maintenance
  commentaire: text("commentaire"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertRessourceDisponibiliteSchema = createInsertSchema(ressourceDisponibilites).omit({
  id: true,
  created_at: true,
});

// Relations entre les tables
export const usersRelations = relations(users, ({ many }) => ({
  tacheIntervenants: many(tacheIntervenants),
  lotPilotes: many(lotPilotes),
  piecesJointes: many(piecesJointes),
  revisions: many(revisions),
  activites: many(activites),
  notifications: many(notifications),
}));

export const chantiersRelations = relations(chantiers, ({ many }) => ({
  taches: many(taches),
  lots: many(lots),
}));

export const tachesRelations = relations(taches, ({ one, many }) => ({
  chantier: one(chantiers, {
    fields: [taches.chantierId],
    references: [chantiers.id],
  }),
  lot: one(lots, {
    fields: [taches.lotId],
    references: [lots.id],
  }),
  intervenants: many(tacheIntervenants),
  piecesJointes: many(piecesJointes),
  ressourceAffectations: many(ressourceAffectations),
  updatedByUser: one(users, {
    fields: [taches.updated_by],
    references: [users.id],
  }),
}));

export const tacheIntervenantsRelations = relations(tacheIntervenants, ({ one }) => ({
  tache: one(taches, {
    fields: [tacheIntervenants.tacheId],
    references: [taches.id],
  }),
  user: one(users, {
    fields: [tacheIntervenants.userId],
    references: [users.id],
  }),
}));

export const piecesJointesRelations = relations(piecesJointes, ({ one, many }) => ({
  tache: one(taches, {
    fields: [piecesJointes.tacheId],
    references: [taches.id],
  }),
  uploader: one(users, {
    fields: [piecesJointes.uploaderId],
    references: [users.id],
  }),
  revisions: many(revisions),
}));

export const revisionsRelations = relations(revisions, ({ one }) => ({
  pieceJointe: one(piecesJointes, {
    fields: [revisions.pieceJointeId],
    references: [piecesJointes.id],
  }),
  user: one(users, {
    fields: [revisions.userId],
    references: [users.id],
  }),
}));

export const activitesRelations = relations(activites, ({ one }) => ({
  user: one(users, {
    fields: [activites.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const lotsRelations = relations(lots, ({ one, many }) => ({
  chantier: one(chantiers, {
    fields: [lots.chantierId],
    references: [chantiers.id],
  }),
  pilotes: many(lotPilotes),
  taches: many(taches),
}));

export const lotPilotesRelations = relations(lotPilotes, ({ one }) => ({
  lot: one(lots, {
    fields: [lotPilotes.lotId],
    references: [lots.id],
  }),
  user: one(users, {
    fields: [lotPilotes.userId],
    references: [users.id],
  }),
}));

// Relations des ressources
export const ressourcesRelations = relations(ressources, ({ many }) => ({
  affectations: many(ressourceAffectations),
  disponibilites: many(ressourceDisponibilites),
}));

export const ressourceAffectationsRelations = relations(ressourceAffectations, ({ one }) => ({
  ressource: one(ressources, {
    fields: [ressourceAffectations.ressourceId],
    references: [ressources.id],
  }),
  tache: one(taches, {
    fields: [ressourceAffectations.tacheId],
    references: [taches.id],
  }),
  createdBy: one(users, {
    fields: [ressourceAffectations.created_by],
    references: [users.id],
  }),
}));

export const ressourceDisponibilitesRelations = relations(ressourceDisponibilites, ({ one }) => ({
  ressource: one(ressources, {
    fields: [ressourceDisponibilites.ressourceId],
    references: [ressources.id],
  }),
}));

// Types exportés
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Chantier = typeof chantiers.$inferSelect;
export type InsertChantier = z.infer<typeof insertChantierSchema>;

export type Lot = typeof lots.$inferSelect;
export type InsertLot = z.infer<typeof insertLotSchema>;

export type LotPilote = typeof lotPilotes.$inferSelect;
export type InsertLotPilote = z.infer<typeof insertLotPiloteSchema>;

export type Tache = typeof taches.$inferSelect;
export type InsertTache = z.infer<typeof insertTacheSchema>;

export type TacheIntervenant = typeof tacheIntervenants.$inferSelect;
export type InsertTacheIntervenant = z.infer<typeof insertTacheIntervenantSchema>;

export type PieceJointe = typeof piecesJointes.$inferSelect;
export type InsertPieceJointe = z.infer<typeof insertPieceJointeSchema>;

export type Revision = typeof revisions.$inferSelect;
export type InsertRevision = z.infer<typeof insertRevisionSchema>;

export type Activite = typeof activites.$inferSelect;
export type InsertActivite = z.infer<typeof insertActiviteSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Ressource = typeof ressources.$inferSelect;
export type InsertRessource = z.infer<typeof insertRessourceSchema>;

export type RessourceAffectation = typeof ressourceAffectations.$inferSelect;
export type InsertRessourceAffectation = z.infer<typeof insertRessourceAffectationSchema>;

export type RessourceDisponibilite = typeof ressourceDisponibilites.$inferSelect;
export type InsertRessourceDisponibilite = z.infer<typeof insertRessourceDisponibiliteSchema>;

// Nouvelles entités pour la gestion des équipes et paramètres
export type Equipe = typeof equipes.$inferSelect;
export type InsertEquipe = z.infer<typeof insertEquipeSchema>;

export type EquipeMembre = typeof equipeMembres.$inferSelect;
export type InsertEquipeMembre = z.infer<typeof insertEquipeMembreSchema>;

export type Parametre = typeof parametres.$inferSelect;
export type InsertParametre = z.infer<typeof insertParametreSchema>;

// Enums pour faciliter la validation
export const StatutTache = {
  A_FAIRE: 'a_faire',
  EN_COURS: 'en_cours',
  EN_VALIDATION: 'en_validation',
  TERMINE: 'termine',
  EN_RETARD: 'en_retard',
  EN_REVISION: 'en_revision'
} as const;

export const PrioriteTache = {
  BASSE: 'basse',
  NORMALE: 'normale',
  HAUTE: 'haute',
  URGENTE: 'urgente'
} as const;

export const TypeTache = {
  ETUDE: 'etude',
  CONCEPTION: 'conception',
  EXECUTION: 'execution',
  VALIDATION: 'validation',
  REVISION: 'revision',
  COORDINATION: 'coordination',
  SECURITE: 'securite',
  ADMINISTRATIVE: 'administrative',
  AUTRE: 'autre'
} as const;

export const TypeLot = {
  VOIRIE: 'voirie',
  RESEAUX_SECS: 'reseaux_secs',
  RESEAUX_HUMIDES: 'reseaux_humides',
  BATIMENT: 'batiment',
  ESPACES_VERTS: 'espaces_verts',
  SIGNALISATION: 'signalisation',
  AUTRE: 'autre'
} as const;

export const TypeActivite = {
  CREATION: 'creation',
  MODIFICATION: 'modification',
  VALIDATION: 'validation',
  REVISION: 'revision',
  RETARD: 'retard',
  ASSIGNATION: 'assignation'
} as const;

export const TypeRessource = {
  PERSONNEL: 'personnel',
  EQUIPEMENT: 'equipement',
  VEHICULE: 'vehicule',
  MATERIAU: 'materiau',
  OUTIL: 'outil',
  AUTRE: 'autre'
} as const;

export const StatutRessource = {
  DISPONIBLE: 'disponible',
  ASSIGNE: 'assigne',
  INDISPONIBLE: 'indisponible',
  EN_MAINTENANCE: 'en_maintenance'
} as const;

// Tables pour la gestion des équipes
export const equipes = pgTable("equipes", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  description: text("description"),
  responsableId: integer("responsable_id"), // Chef d'équipe (peut être null)
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertEquipeSchema = createInsertSchema(equipes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Membres des équipes
export const equipeMembres = pgTable("equipe_membres", {
  id: serial("id").primaryKey(),
  equipeId: integer("equipe_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").default("membre"), // membre, responsable, adjoint
  created_at: timestamp("created_at").defaultNow(),
});

export const insertEquipeMembreSchema = createInsertSchema(equipeMembres).omit({
  id: true,
  created_at: true,
});

// Table pour les paramètres de l'application
export const parametres = pgTable("parametres", {
  id: serial("id").primaryKey(),
  cle: text("cle").notNull().unique(), // Clé du paramètre
  valeur: text("valeur").notNull(), // Valeur du paramètre
  description: text("description"),
  categorie: text("categorie").notNull(), // notifications, délais, interface, etc.
  updated_at: timestamp("updated_at").defaultNow(),
  updated_by: integer("updated_by"),
});

export const insertParametreSchema = createInsertSchema(parametres).omit({
  id: true,
  updated_at: true,
});

// Relations pour les équipes
export const equipesRelations = relations(equipes, ({ one, many }) => ({
  responsable: one(users, {
    fields: [equipes.responsableId],
    references: [users.id],
  }),
  membres: many(equipeMembres),
}));

export const equipeMembresRelations = relations(equipeMembres, ({ one }) => ({
  equipe: one(equipes, {
    fields: [equipeMembres.equipeId],
    references: [equipes.id],
  }),
  user: one(users, {
    fields: [equipeMembres.userId],
    references: [users.id],
  }),
}));

export const usersEquipeRelations = relations(users, ({ many }) => ({
  equipeMembres: many(equipeMembres),
}));

export const parametresRelations = relations(parametres, ({ one }) => ({
  updatedBy: one(users, {
    fields: [parametres.updated_by],
    references: [users.id],
  }),
}))
