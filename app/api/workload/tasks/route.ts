import { NextResponse } from 'next/server';

// Mock data
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

// GET /api/workload/tasks
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get('week');
  
  if (week) {
    // Filtrer les tâches par semaine
    const filteredTasks = workloadTasks.filter(task => {
      const taskDate = new Date(task.dateDebut);
      const weekDate = new Date(week);
      return taskDate.getWeek() === weekDate.getWeek();
    });
    return NextResponse.json(filteredTasks);
  }
  
  return NextResponse.json(workloadTasks);
}

// POST /api/workload/tasks
export async function POST(request: Request) {
  const data = await request.json();
  const newTask = {
    id: workloadTasks.length + 1,
    ...data,
  };
  workloadTasks.push(newTask);
  return NextResponse.json(newTask, { status: 201 });
} 