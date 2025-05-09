import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste tous les utilisateurs
export async function GET() {
  try {
    const utilisateurs = await sql`SELECT id, nom, email, role, created_at FROM utilisateurs ORDER BY created_at DESC`;
    return NextResponse.json(utilisateurs);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
  }
}

// POST: Crée un nouvel utilisateur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, email, mot_de_passe, role } = body;
    if (!nom || !email || !mot_de_passe) {
      return NextResponse.json({ error: 'Le nom, l\'email et le mot de passe sont requis' }, { status: 400 });
    }
    const [utilisateur] = await sql`
      INSERT INTO utilisateurs (nom, email, mot_de_passe, role)
      VALUES (
        ${nom},
        ${email},
        ${mot_de_passe},
        ${role || 'utilisateur'}
      )
      RETURNING id, nom, email, role, created_at;
    `;
    return NextResponse.json(utilisateur, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
  }
} 