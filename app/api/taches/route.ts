import { NextResponse } from 'next/server';

// Mock data
let taches = [
  {
    id: 1,
    titre: 'Développement Frontend',
    description: 'Création de l\'interface utilisateur',
    statut: 'en_cours',
    priorite: 'haute',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-15',
    ressourceId: 1,
  },
  {
    id: 2,
    titre: 'Design UI/UX',
    description: 'Création des maquettes',
    statut: 'a_faire',
    priorite: 'moyenne',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-10',
    ressourceId: 2,
  },
];

// GET /api/taches
export async function GET() {
  return NextResponse.json(taches);
}

// POST /api/taches
export async function POST(request: Request) {
  const data = await request.json();
  const newTache = {
    id: taches.length + 1,
    ...data,
  };
  taches.push(newTache);
  return NextResponse.json(newTache, { status: 201 });
} 