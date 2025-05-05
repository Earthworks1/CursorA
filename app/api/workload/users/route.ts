import { NextResponse } from 'next/server';

// Mock data
const users = [
  {
    id: 1,
    nom: 'John Doe',
    role: 'Développeur',
    disponibilite: 100,
    chargeActuelle: 60,
  },
  {
    id: 2,
    nom: 'Jane Smith',
    role: 'Designer',
    disponibilite: 80,
    chargeActuelle: 40,
  },
];

// GET /api/workload/users
export async function GET() {
  return NextResponse.json(users);
} 