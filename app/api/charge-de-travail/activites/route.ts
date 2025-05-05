import { NextResponse } from 'next/server';

// GET /api/charge-de-travail/activites
export async function GET() {
  // Exemple d'activité
  return NextResponse.json([
    {
      id: 1,
      type: 'création',
      date: '2024-04-25T10:00:00Z',
      utilisateur: 'John Doe',
      description: 'Création d\'une tâche',
    },
    {
      id: 2,
      type: 'modification',
      date: '2024-04-25T11:00:00Z',
      utilisateur: 'Jane Smith',
      description: 'Modification d\'un chantier',
    },
  ]);
} 