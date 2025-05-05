import { NextResponse } from 'next/server';

// GET /api/taches/[id]/export-pdf
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  
  // Mock d'un PDF (en réalité, on générerait un vrai PDF ici)
  const pdfContent = `PDF de la tâche ${id}`;
  
  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tache-${id}.pdf"`,
    },
  });
} 