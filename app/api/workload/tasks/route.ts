import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Remplacer par la vraie logique métier
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  // TODO: Ajouter la logique de création de tâche
  return NextResponse.json({ success: true });
} 