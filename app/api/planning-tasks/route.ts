import { NextResponse } from 'next/server';

// Mock data
let planningTasks = [
  {
    id: 1,
    titre: 'Tâche Planning 1',
    description: 'Description de la tâche planning 1',
    statut: 'en_cours',
    priorite: 'haute',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-15',
    ressourceId: 1,
    charge: 8,
    progression: 50,
  },
  {
    id: 2,
    titre: 'Tâche Planning 2',
    description: 'Description de la tâche planning 2',
    statut: 'a_faire',
    priorite: 'moyenne',
    dateDebut: '2024-04-01',
    dateFin: '2024-04-10',
    ressourceId: 2,
    charge: 4,
    progression: 0,
  },
];

// GET /api/planning-tasks
export async function GET() {
  return NextResponse.json(planningTasks);
}

// POST /api/planning-tasks
export async function POST(request: Request) {
  const data = await request.json();
  const newTask = {
    id: planningTasks.length + 1,
    ...data,
  };
  planningTasks.push(newTask);
  return NextResponse.json(newTask, { status: 201 });
}

// PUT /api/planning-tasks
export async function PUT(request: Request) {
  const data = await request.json();
  const index = planningTasks.findIndex(t => t.id === data.id);
  
  if (index === -1) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  planningTasks[index] = { ...planningTasks[index], ...data };
  return NextResponse.json(planningTasks[index]);
}

// DELETE /api/planning-tasks
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID requis' },
      { status: 400 }
    );
  }
  
  const index = planningTasks.findIndex(t => t.id === parseInt(id));
  if (index === -1) {
    return NextResponse.json(
      { error: 'Tâche non trouvée' },
      { status: 404 }
    );
  }
  
  planningTasks = planningTasks.filter(t => t.id !== parseInt(id));
  return NextResponse.json({ success: true });
} 