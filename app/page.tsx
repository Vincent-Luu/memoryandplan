import { format, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import { db } from "../db";
import { tasks, taskLogs } from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import DashboardClient from "./components/DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Page() {
  const todayDate = new Date();
  const yesterdayDate = subDays(todayDate, 1);
  const tomorrowDate = addDays(todayDate, 1);

  const formattedToday = format(todayDate, "yyyy-MM-dd");
  const formattedYesterday = format(yesterdayDate, "yyyy-MM-dd");
  const formattedTomorrow = format(tomorrowDate, "yyyy-MM-dd");

  const monthStart = startOfMonth(todayDate);
  const monthEnd = endOfMonth(todayDate);
  const formattedMonthStart = format(monthStart, "yyyy-MM-dd");
  const formattedMonthEnd = format(monthEnd, "yyyy-MM-dd");

  const [resY, resT, resTom, resMonth] = await Promise.all([
    db.select({
      id: taskLogs.id,
      taskId: taskLogs.taskId,
      scheduleDate: taskLogs.scheduleDate,
      status: taskLogs.status,
      title: tasks.title,
      tag: tasks.tag,
    })
    .from(taskLogs)
    .innerJoin(tasks, eq(taskLogs.taskId, tasks.id))
    .where(eq(taskLogs.scheduleDate, formattedYesterday)),

    db.select({
      id: taskLogs.id,
      taskId: taskLogs.taskId,
      scheduleDate: taskLogs.scheduleDate,
      status: taskLogs.status,
      title: tasks.title,
      tag: tasks.tag,
    })
    .from(taskLogs)
    .innerJoin(tasks, eq(taskLogs.taskId, tasks.id))
    .where(eq(taskLogs.scheduleDate, formattedToday)),

    db.select({
      id: taskLogs.id,
      taskId: taskLogs.taskId,
      scheduleDate: taskLogs.scheduleDate,
      status: taskLogs.status,
      title: tasks.title,
      tag: tasks.tag,
    })
    .from(taskLogs)
    .innerJoin(tasks, eq(taskLogs.taskId, tasks.id))
    .where(eq(taskLogs.scheduleDate, formattedTomorrow)),

    db.select({
      id: taskLogs.id,
      scheduleDate: taskLogs.scheduleDate,
      status: taskLogs.status,
    })
    .from(taskLogs)
    .where(and(gte(taskLogs.scheduleDate, formattedMonthStart), lte(taskLogs.scheduleDate, formattedMonthEnd))),
  ]);

  // Process monthly data
  const initialCalendarStatus: Record<string, { completed: number; total: number }> = {};
  resMonth.forEach(log => {
    const date = log.scheduleDate;
    if (!initialCalendarStatus[date]) {
      initialCalendarStatus[date] = { completed: 0, total: 0 };
    }
    initialCalendarStatus[date].total += 1;
    if (log.status) {
      initialCalendarStatus[date].completed += 1;
    }
  });

  const initialTasks = {
    yesterday: resY,
    today: resT,
    tomorrow: resTom,
  };

  return (
    <DashboardClient 
      initialTasks={initialTasks} 
      initialCalendarStatus={initialCalendarStatus} 
    />
  );
}
