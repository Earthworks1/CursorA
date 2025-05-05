import { NextResponse } from 'next/server';

// GET /api/charge-de-travail/taches
export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      titre: 'Tâche urgente',
      statut: 'en_cours',
      date: '2024-04-25T09:00:00Z',
      utilisateur: 'John Doe',
    },
    {
      id: 2,
      titre: 'Tâche terminée',
      statut: 'terminée',
      date: '2024-04-24T15:00:00Z',
      utilisateur: 'Jane Smith',
    },
  ]);
} 