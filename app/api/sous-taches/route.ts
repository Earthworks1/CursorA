import { NextResponse } from 'next/server';

// Mock data
const sousTaches = [
  {
    id: 1,
    tacheId: 1,
    titre: 'Sous-tâche 1',
    description: 'Description de la sous-tâche 1',
    statut: 'en_cours',
    priorite: 'haute',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-05',
  },
  {
    id: 2,
    tacheId: 1,
    titre: 'Sous-tâche 2',
    description: 'Description de la sous-tâche 2',
    statut: 'a_faire',
    priorite: 'moyenne',
    dateDebut: '2024-04-06',
    dateFin: '2024-04-10',
  },
];

// GET /api/sous-taches
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tacheId = searchParams.get('tacheId');
  const id = searchParams.get('id');
  
  if (tacheId) {
    const filteredSousTaches = sousTaches.filter(st => st.tacheId === parseInt(tacheId));
    return NextResponse.json(filteredSousTaches);
  }
  
  if (id) {
    const sousTache = sousTaches.find(st => st.id === parseInt(id));
    if (!sousTache) {
      return NextResponse.json(
        { error: 'Sous-tâche non trouvée' },
        { status: 404 }
      );
    }
    return NextResponse.json(sousTache);
  }
  
  return NextResponse.json(sousTaches);
}

// POST /api/sous-taches
export async function POST(request: Request) {
  const data = await request.json();
  const newSousTache = {
    id: sousTaches.length + 1,
    ...data,
  };
  sousTaches.push(newSousTache);
  return NextResponse.json(newSousTache, { status: 201 });
} 