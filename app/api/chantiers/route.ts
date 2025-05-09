import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste tous les chantiers
export async function GET() {
  try {
    const chantiers = await sql`SELECT * FROM chantiers ORDER BY created_at DESC`;
    return NextResponse.json(chantiers);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des chantiers' }, { status: 500 });
  }
}

// POST: Crée un nouveau chantier
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, description, date_debut, date_fin } = body;
    if (!nom) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    const [chantier] = await sql`
      INSERT INTO chantiers (nom, description, date_debut, date_fin)
      VALUES (
        ${nom},
        ${description},
        ${date_debut},
        ${date_fin}
      )
      RETURNING *;
    `;
    return NextResponse.json(chantier, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du chantier' }, { status: 500 });
  }
} 