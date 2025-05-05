import { NextResponse } from 'next/server';

// GET /api/chantiers
export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      nom: 'Chantier A',
      adresse: '123 rue Exemple',
      statut: 'en cours',
    },
    {
      id: 2,
      nom: 'Chantier B',
      adresse: '456 avenue Test',
      statut: 'terminé',
    },
  ]);
} 