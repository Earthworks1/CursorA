import { NextResponse } from 'next/server';

// Mock data
let tags = [
  {
    id: 1,
    nom: 'Urgent',
    couleur: '#FF0000',
  },
  {
    id: 2,
    nom: 'En cours',
    couleur: '#00FF00',
  },
  {
    id: 3,
    nom: 'Terminé',
    couleur: '#0000FF',
  },
];

// GET /api/tags
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const tag = tags.find(t => t.id === parseInt(id));
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag non trouvé' },
        { status: 404 }
      );
    }
    return NextResponse.json(tag);
  }
  
  return NextResponse.json(tags);
}

// POST /api/tags
export async function POST(request: Request) {
  const data = await request.json();
  const newTag = {
    id: tags.length + 1,
    ...data,
  };
  tags.push(newTag);
  return NextResponse.json(newTag, { status: 201 });
} 