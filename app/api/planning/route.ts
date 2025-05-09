import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Liste tous les éléments de planning
export async function GET() {
  try {
    const planning = await sql`SELECT * FROM planning ORDER BY date DESC, id DESC`;
    return NextResponse.json(planning);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération du planning' }, { status: 500 });
  }
}

// POST: Ajoute un élément au planning
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tache_id, ressource_id, utilisateur_id, date, heures, commentaire, heure_debut, heure_fin, statut, recurrence, historique, absence } = body;
    if (!tache_id || !date || heure_debut == null || heure_fin == null) {
      return NextResponse.json({ error: 'La tâche, la date, l\'heure de début et l\'heure de fin sont requises' }, { status: 400 });
    }
    const [item] = await sql`
      INSERT INTO planning (tache_id, ressource_id, utilisateur_id, date, heures, commentaire, heure_debut, heure_fin, statut, recurrence, historique, absence)
      VALUES (
        ${tache_id},
        ${ressource_id},
        ${utilisateur_id},
        ${date},
        ${heures ?? (heure_fin - heure_debut)},
        ${commentaire},
        ${heure_debut},
        ${heure_fin},
        ${statut || 'planifie'},
        ${recurrence},
        ${historique ?? []},
        ${absence ?? false}
      )
      RETURNING *;
    `;
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'ajout au planning' }, { status: 500 });
  }
}

// PUT: Met à jour un élément du planning
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    
    // Construction de la requête dynamique
    const setClause = Object.entries(fields)
      .map(([key]) => `${key} = ${key}`)
      .join(', ');
    
    const [item] = await sql`
      UPDATE planning 
      SET ${sql.raw(setClause)}
      WHERE id = ${id}
      RETURNING *;
    `;
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du planning' }, { status: 500 });
  }
}

// DELETE: Supprime un élément du planning
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    await sql`DELETE FROM planning WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du planning' }, { status: 500 });
  }
} 