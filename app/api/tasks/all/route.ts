import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { tasks, taskLogs } from '../../../../db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTasks = await db.select({
      id: tasks.id,
      title: tasks.title,
      tag: tasks.tag,
      createdAt: tasks.createdAt,
      totalLogs: sql<number>`count(${taskLogs.id})`.mapWith(Number),
      completedLogs: sql<number>`count(CASE WHEN ${taskLogs.status} = true THEN 1 END)`.mapWith(Number),
    })
    .from(tasks)
    .leftJoin(taskLogs, eq(tasks.id, taskLogs.taskId))
    .groupBy(tasks.id)
    .orderBy(tasks.createdAt);
    
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Reused generic logic if needed or duplicate it here.
  return NextResponse.json({ error: 'Use standard task creation endpoint' }, { status: 400 });
}
