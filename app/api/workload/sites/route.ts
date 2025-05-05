import { NextResponse } from 'next/server';

// Mock data
const sites = [
  {
    id: 1,
    nom: 'Site A',
    adresse: '123 Rue Example',
    ville: 'Paris',
    codePostal: '75001',
    pays: 'France',
  },
  {
    id: 2,
    nom: 'Site B',
    adresse: '456 Avenue Test',
    ville: 'Lyon',
    codePostal: '69001',
    pays: 'France',
  },
];

// GET /api/workload/sites
export async function GET() {
  return NextResponse.json(sites);
} 