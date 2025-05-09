import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste toutes les tâches
export async function GET() {
  try {
    const taches = await sql`SELECT * FROM taches ORDER BY created_at DESC`;
    return NextResponse.json(taches);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des tâches' }, { status: 500 });
  }
}

// POST: Crée une nouvelle tâche
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titre, description, statut, priorite, date_debut, date_fin, chantier_id, ressource_id, equipe_id } = body;
    if (!titre) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }
    const [tache] = await sql`
      INSERT INTO taches (titre, description, statut, priorite, date_debut, date_fin, chantier_id, ressource_id, equipe_id)
      VALUES (
        ${titre},
        ${description},
        ${statut || 'en_cours'},
        ${priorite || 'moyenne'},
        ${date_debut},
        ${date_fin},
        ${chantier_id},
        ${ressource_id},
        ${equipe_id}
      )
      RETURNING *;
    `;
    return NextResponse.json(tache, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la tâche' }, { status: 500 });
  }
} 