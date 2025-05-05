import { NextResponse } from 'next/server';

// Mock data
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

// GET /api/ressources
export async function GET() {
  return NextResponse.json(ressources);
}

// POST /api/ressources
export async function POST(request: Request) {
  const data = await request.json();
  const newRessource = {
    id: ressources.length + 1,
    ...data,
  };
  ressources.push(newRessource);
  return NextResponse.json(newRessource, { status: 201 });
} 