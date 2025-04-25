import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users, chantiers, lots, taches, RoleUtilisateur } from "./shared/schema";

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'spiess_planning'
});

const db = drizzle(pool);

async function seed() {
  try {
    // Création des utilisateurs
    const [user1] = await db.insert(users).values({
      username: "max.dupont",
      password: "password123", // À hasher en production
      nom: "Dupont",
      prenom: "Max",
      role: RoleUtilisateur.CONDUCTEUR_TRAVAUX,
      email: "max.dupont@spiess.fr"
    }).returning();

    const [user2] = await db.insert(users).values({
      username: "renaud.martin",
      password: "password123",
      nom: "Martin",
      prenom: "Renaud",
      role: RoleUtilisateur.RESPONSABLE_TRAVAUX,
      email: "renaud.martin@spiess.fr"
    }).returning();

    // Création d'un chantier
    const [chantier1] = await db.insert(chantiers).values({
      nom: "Construction Centre Commercial",
      description: "Construction d'un nouveau centre commercial",
      adresse: "123 Rue du Commerce, 68000 Colmar",
      statut: "actif"
    }).returning();

    // Création des lots
    const [lot1] = await db.insert(lots).values({
      nom: "Gros œuvre",
      type: "structure",
      description: "Travaux de gros œuvre et fondations",
      chantierId: chantier1.id,
      code: "GO"
    }).returning();

    // Création des tâches
    await db.insert(taches).values({
      titre: "Excavation fondations",
      description: "Excavation pour les fondations du bâtiment principal",
      lotId: lot1.id,
      chantierId: chantier1.id,
      type: "Exécution",
      statut: "en_cours",
      progression: 30,
      priorite: "haute",
      piloteId: user2.id,
      intervenantId: user1.id
    });

    console.log("Données de test ajoutées avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout des données :", error);
  } finally {
    await pool.end();
  }
}

seed(); 