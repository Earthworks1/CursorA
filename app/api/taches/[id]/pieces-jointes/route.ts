import { NextResponse } from 'next/server';

// Mock data
let piecesJointes = [
  {
    id: 1,
    tacheId: 1,
    nom: 'document1.pdf',
    type: 'application/pdf',
    taille: 1024,
    dateUpload: '2024-04-01T10:00:00Z',
  },
  {
    id: 2,
    tacheId: 1,
    nom: 'image1.jpg',
    type: 'image/jpeg',
    taille: 2048,
    dateUpload: '2024-04-01T11:00:00Z',
  },
];

// GET /api/taches/[id]/pieces-jointes
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tacheId = parseInt(params.id);
  const pieces = piecesJointes.filter(p => p.tacheId === tacheId);
  return NextResponse.json(pieces);
}

// POST /api/taches/[id]/pieces-jointes
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const tacheId = parseInt(params.id);
  const data = await request.json();
  
  const newPieceJointe = {
    id: piecesJointes.length + 1,
    tacheId,
    ...data,
    dateUpload: new Date().toISOString(),
  };
  
  piecesJointes.push(newPieceJointe);
  return NextResponse.json(newPieceJointe, { status: 201 });
} 