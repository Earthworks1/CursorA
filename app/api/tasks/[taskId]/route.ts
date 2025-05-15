import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { tasks } from '../../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { completed } = await req.json();
    const { taskId } = params;

    const updatedTask = await db
      .update(tasks)
      .set({ completed })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask.length) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(updatedTask[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { taskId } = params;

    const deletedTask = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!deletedTask.length) {
      return new NextResponse('Task not found', { status: 404 });
    }

    return NextResponse.json(deletedTask[0]);
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 