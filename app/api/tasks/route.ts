import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { tasks, taskLogs } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { title, tag, localDate } = await request.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    // Insert new task
    const newTask = await db.insert(tasks).values({ title, tag }).returning({ id: tasks.id });
    const taskId = newTask[0].id;

    // Use provided localDate (YYYY-MM-DD) or fallback to server date
    let baseDate: Date;
    if (localDate) {
      const [year, month, day] = localDate.split('-').map(Number);
      baseDate = new Date(year, month - 1, day);
    } else {
      baseDate = new Date();
    }

    // Ebbinghaus intervals: 1st time, 2nd day, 4th day, 8th, 14th, 30th
    const intervals = [0, 1, 3, 7, 13, 29];
    
    // Create the task logs
    const logsToInsert = intervals.map(offset => {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
      const Y = d.getFullYear();
      const M = String(d.getMonth() + 1).padStart(2, '0');
      const D = String(d.getDate()).padStart(2, '0');
      return {
        taskId,
        scheduleDate: `${Y}-${M}-${D}`,
        status: false,
      };
    });

    await db.insert(taskLogs).values(logsToInsert);

    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); 
    if (!date) return NextResponse.json({ error: 'Date is required (YYYY-MM-DD format)' }, { status: 400 });

    // Fetch the task logs for the specified date
    const logs = await db.select({
      id: taskLogs.id,
      taskId: taskLogs.taskId,
      scheduleDate: taskLogs.scheduleDate,
      status: taskLogs.status,
      title: tasks.title,
      tag: tasks.tag,
    })
    .from(taskLogs)
    .innerJoin(tasks, eq(taskLogs.taskId, tasks.id))
    .where(eq(taskLogs.scheduleDate, date));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
