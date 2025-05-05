import { NextResponse } from 'next/server';

// Mock data (même que dans ressources/route.ts)
let ressources = [
  {
    id: 1,
    nom: 'John Doe',
    role: 'Développeur',
    email: 'john@example.com',
    telephone: '0123456789',
    disponibilite: 100,
  },
  {
    id: 2,
    nom: 'Jane Smith',
    role: 'Designer',
    email: 'jane@example.com',
    telephone: '0987654321',
    disponibilite: 80,
  },
];

// GET /api/ressources/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const ressource = ressources.find(r => r.id === id);
  
  if (!ressource) {
    return NextResponse.json(
      { error: 'Ressource non trouvée' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(ressource);
}

// PUT /api/ressources/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const data = await request.json();
  
  const index = ressources.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json(
      { error: 'Ressource non trouvée' },
      { status: 404 }
    );
  }
  
  ressources[index] = { ...ressources[index], ...data };
  return NextResponse.json(ressources[index]);
}

// DELETE /api/ressources/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = ressources.findIndex(r => r.id === id);
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Ressource non trouvée' },
      { status: 404 }
    );
  }
  
  ressources = ressources.filter(r => r.id !== id);
  return NextResponse.json({ success: true });
} 