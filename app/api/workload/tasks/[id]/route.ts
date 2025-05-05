import { NextResponse } from 'next/server';

// Mock data (même que dans workload/tasks/route.ts)
let workloadTasks = [
  {
    id: 1,
    titre: 'Tâche 1',
    description: 'Description de la tâche 1',
    statut: 'en_cours',
    priorite: 'haute',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-15',
    ressourceId: 1,
    charge: 8,
  },
  {
    id: 2,
    titre: 'Tâche 2',
    description: 'Description de la tâche 2',
    statut: 'a_faire',
    priorite: 'moyenne',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-10',
    ressourceId: 2,
    charge: 4,
  },
];

// GET /api/workload/tasks/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const task = workloadTasks.find(t => t.id === id);
  
  if (!task) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(task);
}

// PUT /api/workload/tasks/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const data = await request.json();
  
  const index = workloadTasks.findIndex(t => t.id === id);
  if (index === -1) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  workloadTasks[index] = { ...workloadTasks[index], ...data };
  return NextResponse.json(workloadTasks[index]);
}

// DELETE /api/workload/tasks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const index = workloadTasks.findIndex(t => t.id === id);
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  workloadTasks = workloadTasks.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
} 