import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste toutes les équipes
export async function GET() {
  try {
    const equipes = await sql`SELECT * FROM equipes ORDER BY nom`;
    return NextResponse.json(equipes);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des équipes:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des équipes' }, { status: 500 });
  }
}

// POST: Crée une nouvelle équipe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, description, chef_id, membres, statut, specialite, capacite, notes } = body;
    if (!nom) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    const [equipe] = await sql`
      INSERT INTO equipes (nom, description, chef_id, membres, statut, specialite, capacite, notes)
      VALUES (
        ${nom},
        ${description},
        ${chef_id},
        ${membres ?? []},
        ${statut || 'active'},
        ${specialite},
        ${capacite},
        ${notes}
      )
      RETURNING *;
    `;
    return NextResponse.json(equipe, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors de la création de l\'équipe:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'équipe' }, { status: 500 });
  }
} 