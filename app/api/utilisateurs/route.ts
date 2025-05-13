import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);

// GET: Liste tous les utilisateurs
export async function GET() {
  try {
    const utilisateurs = await sql`SELECT * FROM utilisateurs ORDER BY nom`;
    return NextResponse.json(utilisateurs);
  } catch (error: unknown) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
  }
}

// POST: Crée un nouvel utilisateur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, prenom, email, role, equipe_id, competences, disponibilite, notes } = body;
    if (!nom || !prenom || !email) {
      return NextResponse.json({ error: 'Le nom, le prénom et l\'email sont requis' }, { status: 400 });
    }
    const [utilisateur] = await sql`
      INSERT INTO utilisateurs (nom, prenom, email, role, equipe_id, competences, disponibilite, notes)
      VALUES (
        ${nom},
        ${prenom},
        ${email},
        ${role || 'utilisateur'},
        ${equipe_id},
        ${competences ?? []},
        ${disponibilite ?? true},
        ${notes}
      )
      RETURNING *;
    `;
    return NextResponse.json(utilisateur, { status: 201 });
  } catch (error: unknown) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
  }
} 