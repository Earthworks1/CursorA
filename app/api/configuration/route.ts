import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Configuration par défaut
const defaultConfig = {
  theme: 'system',
  language: 'fr',
  timezone: 'Europe/Paris',
  notifications: true,
};

// Stockage temporaire de la configuration (à remplacer par une base de données)
let config = { ...defaultConfig };

export async function GET() {
  try {
    const [config] = await sql`SELECT * FROM configuration LIMIT 1`;
    if (!config) {
      return NextResponse.json({ error: 'Configuration non trouvée' }, { status: 404 });
    }
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la lecture de la configuration' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const newConfig = await request.json();
    // Validation
    if (newConfig.theme && !['light', 'dark', 'system'].includes(newConfig.theme)) {
      return NextResponse.json({ error: 'Thème invalide' }, { status: 400 });
    }
    if (newConfig.language && !['fr', 'en'].includes(newConfig.language)) {
      return NextResponse.json({ error: 'Langue invalide' }, { status: 400 });
    }
    // Mise à jour
    const [updated] = await sql`
      UPDATE configuration
      SET
        theme = COALESCE(${newConfig.theme}, theme),
        language = COALESCE(${newConfig.language}, language),
        timezone = COALESCE(${newConfig.timezone}, timezone),
        notifications = COALESCE(${newConfig.notifications}, notifications)
      RETURNING *;
    `;
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la configuration' }, { status: 500 });
  }
} 