import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste tous les chantiers
export async function GET() {
  try {
    const chantiers = await sql`SELECT * FROM chantiers ORDER BY created_at DESC`;
    return NextResponse.json(chantiers);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des chantiers:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des chantiers' }, { status: 500 });
  }
}

// POST: Crée un nouveau chantier
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, description, client_id, date_debut, date_fin, statut, budget, adresse, contact, notes } = body;
    if (!nom || !client_id) {
      return NextResponse.json({ error: 'Le nom et le client sont requis' }, { status: 400 });
    }
    const [chantier] = await sql`
      INSERT INTO chantiers (nom, description, client_id, date_debut, date_fin, statut, budget, adresse, contact, notes)
      VALUES (
        ${nom},
        ${description},
        ${client_id},
        ${date_debut},
        ${date_fin},
        ${statut || 'en_cours'},
        ${budget},
        ${adresse},
        ${contact},
        ${notes}
      )
      RETURNING *;
    `;
    return NextResponse.json(chantier, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors de la création du chantier:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du chantier' }, { status: 500 });
  }
} 
