import { NextResponse } from 'next/server';

// Mock data (même que dans taches/route.ts)
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

// GET /api/taches/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const tache = taches.find(t => t.id === id);
  
  if (!tache) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(tache);
}

// PUT /api/taches/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const data = await request.json();
  
  const index = taches.findIndex(t => t.id === id);
  if (index === -1) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  taches[index] = { ...taches[index], ...data };
  return NextResponse.json(taches[index]);
}

// DELETE /api/taches/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = taches.findIndex(t => t.id === id);
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  taches = taches.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
} 