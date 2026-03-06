import { NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { tasks, taskLogs } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);

    // Drizzle with simple pgTable: Delete logs first due to FK constraint
    await db.delete(taskLogs).where(eq(taskLogs.taskId, taskId));
    
    // Delete the task itself
    const deletedTask = await db.delete(tasks).where(eq(tasks.id, taskId)).returning();

    if (deletedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: deletedTask[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title } = await request.json();
    const taskId = parseInt(id, 10);

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Update the task title
    const updatedTask = await db.update(tasks).set({ title }).where(eq(tasks.id, taskId)).returning();

    if (updatedTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updatedTask[0] });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
