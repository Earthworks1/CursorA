import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

// GET: Liste toutes les tâches
export async function GET() {
  try {
    const taches = await sql`SELECT * FROM taches ORDER BY date_creation DESC`;
    return NextResponse.json(taches);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des tâches:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des tâches' }, { status: 500 });
  }
}

// POST: Crée une nouvelle tâche
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { titre, description, chantier_id, responsable_id, date_debut, date_fin, priorite, statut, progression, dependances, ressources, notes } = body;
    if (!titre || !chantier_id) {
      return NextResponse.json({ error: 'Le titre et le chantier sont requis' }, { status: 400 });
    }
    const [tache] = await sql`
      INSERT INTO taches (titre, description, chantier_id, responsable_id, date_debut, date_fin, priorite, statut, progression, dependances, ressources, notes)
      VALUES (
        ${titre},
        ${description},
        ${chantier_id},
        ${responsable_id},
        ${date_debut},
        ${date_fin},
        ${priorite || 'moyenne'},
        ${statut || 'a_faire'},
        ${progression ?? 0},
        ${dependances ?? []},
        ${ressources ?? []},
        ${notes}
      )
      RETURNING *;
    `;
    return NextResponse.json(tache, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors de la création de la tâche:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la tâche' }, { status: 500 });
  }
} 