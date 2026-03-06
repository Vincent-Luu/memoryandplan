import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { tasks, taskLogs } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allTasks = await db.select().from(tasks).orderBy(tasks.createdAt);
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
