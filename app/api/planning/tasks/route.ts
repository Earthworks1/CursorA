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
    const { title, description, startDate, endDate, type, status, resourceId } = body;

    const result = await db.insert(tasks).values({
      title,
      description,
      start: new Date(startDate),
      end: new Date(endDate),
      type,
      status,
      resourceId: resourceId || null,
    }).returning();

    const task = result[0];
    return NextResponse.json({
      ...task,
      start: task.start.toISOString(),
      end: task.end.toISOString(),
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
        start: updates.startDate ? new Date(updates.startDate) : undefined,
        end: updates.endDate ? new Date(updates.endDate) : undefined,
      })
      .where(eq(tasks.id, id))
      .returning();

    const task = updatedTask[0];
    return NextResponse.json({
      ...task,
      start: task.start.toISOString(),
      end: task.end.toISOString(),
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