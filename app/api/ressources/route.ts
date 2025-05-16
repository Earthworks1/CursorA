import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste toutes les ressources
export async function GET() {
  try {
    const ressources = await sql`SELECT * FROM ressources ORDER BY nom`;
    return NextResponse.json(ressources);
  } catch (error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      // En dev/local, on tolère l'absence de base et on retourne un mock
      return NextResponse.json([]);
    }
    console.error('Erreur lors de la récupération des ressources:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des ressources' }, { status: 500 });
  }
}

// POST: Crée une nouvelle ressource
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, type, capacite, disponibilite, cout, localisation, statut, notes } = body;
    if (!nom || !type) {
      return NextResponse.json({ error: 'Le nom et le type sont requis' }, { status: 400 });
    }
    const [ressource] = await sql`
      INSERT INTO ressources (nom, type, capacite, disponibilite, cout, localisation, statut, notes)
      VALUES (
        ${nom},
        ${type},
        ${capacite},
        ${disponibilite ?? true},
        ${cout},
        ${localisation},
        ${statut || 'disponible'},
        ${notes}
      )
      RETURNING *;
    `;
    return NextResponse.json(ressource, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors de la création de la ressource:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la ressource' }, { status: 500 });
  }
} 