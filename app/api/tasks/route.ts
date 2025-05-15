import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { tasks } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
    return NextResponse.json({ tasks: userTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title } = await req.json();
    if (!title) {
      return new NextResponse('Title is required', { status: 400 });
    }

    const newTask = await db.insert(tasks).values({
      title,
      userId,
      completed: false,
    }).returning();

    return NextResponse.json(newTask[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 