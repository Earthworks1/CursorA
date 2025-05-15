import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const allTasks = await db.select().from(tasks);
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, startDate, endDate, status, priority, assignedTo, tags, dependencies, progress, estimatedHours, actualHours } = body;

    const result = await db.insert(tasks).values({
      id: randomUUID(),
      title,
      description,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status,
      priority,
      assignedTo: assignedTo !== undefined && assignedTo !== null ? String(assignedTo) : null,
      tags,
      dependencies,
      progress,
      estimatedHours,
      actualHours,
    }).returning();

    const task = result[0];
    return NextResponse.json({
      ...task,
      assignedTo: task.assignedTo ?? null,
      startDate: task.startDate ? new Date(task.startDate).toISOString() : null,
      endDate: task.endDate ? new Date(task.endDate).toISOString() : null,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const updatedTask = await db
      .update(tasks)
      .set({
        ...updates,
        assignedTo: updates.assignedTo !== undefined && updates.assignedTo !== null ? String(updates.assignedTo) : null,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined,
      })
      .where(eq(tasks.id, id))
      .returning();

    const task = updatedTask[0];
    return NextResponse.json({
      ...task,
      assignedTo: task.assignedTo ?? null,
      startDate: task.startDate ? new Date(task.startDate).toISOString() : null,
      endDate: task.endDate ? new Date(task.endDate).toISOString() : null,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la tâche' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de tâche manquant' },
        { status: 400 }
      );
    }

    await db.delete(tasks).where(eq(tasks.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la tâche' },
      { status: 500 }
    );
  }
} 