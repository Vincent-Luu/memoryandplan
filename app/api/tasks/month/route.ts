import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { taskLogs } from '../../../../db/schema';
import { gte, lte, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    // Fetch the task logs for the specified date range
    const logs = await db.select({
      id: taskLogs.id,
      scheduleDate: taskLogs.scheduleDate,
      status: taskLogs.status,
    })
    .from(taskLogs)
    .where(and(gte(taskLogs.scheduleDate, start), lte(taskLogs.scheduleDate, end)));

    // Group logs by date to compute daily completion status
    const dailyStatus: Record<string, { completed: number; total: number }> = {};

    logs.forEach(log => {
      const date = log.scheduleDate;
      if (!dailyStatus[date]) {
        dailyStatus[date] = { completed: 0, total: 0 };
      }
      dailyStatus[date].total += 1;
      if (log.status) {
        dailyStatus[date].completed += 1;
      }
    });

    return NextResponse.json(dailyStatus);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
