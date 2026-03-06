import { pgTable, serial, text, timestamp, date, boolean, integer } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskLogs = pgTable("task_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  scheduleDate: date("schedule_date").notNull(),
  status: boolean("status").default(false).notNull(), // false = pending, true = completed
});
