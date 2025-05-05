import { NextResponse } from 'next/server';

// GET /api/charge-de-travail/statistiques
export async function GET() {
  return NextResponse.json({
    totalTaches: 42,
    totalUtilisateurs: 7,
    totalChantiers: 5,
    totalLots: 12,
  });
} 