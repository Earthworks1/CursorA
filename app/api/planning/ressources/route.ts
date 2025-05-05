import { NextResponse } from 'next/server';

// GET /api/planning/ressources
export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      nom: 'Ressource planning 1',
      type: 'ouvrier',
      disponibilite: 100,
    },
    {
      id: 2,
      nom: 'Ressource planning 2',
      type: 'engin',
      disponibilite: 80,
    },
  ]);
} 