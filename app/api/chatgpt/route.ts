import { NextResponse } from 'next/server';

// GET /api/chatgpt
export async function GET() {
  return NextResponse.json({
    message: 'API ChatGPT pour Spiess TP - Bienvenue',
    version: '1.0',
    endpoints: [
      '/api/chatgpt/chantiers',
      '/api/chatgpt/taches',
      '/api/chatgpt/utilisateurs',
      '/api/chatgpt/statistiques',
      '/api/chatgpt/recherche',
      '/api/chatgpt/equipes',
      '/api/chatgpt/lots',
      '/api/chatgpt/ressources'
    ]
  });
} 