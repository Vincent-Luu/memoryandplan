import { NextResponse } from 'next/server';
import { db } from '../../../../db';
import { users, tasks, taskLogs } from '../../../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getCurrentUser } from '../../../../lib/auth';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user?.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const targetUserId = parseInt(id, 10);
    
    // Find all tasks of the user to delete their logs first to satisfy foreign key constraints
    const userTasks = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.userId, targetUserId));
    const taskIds = userTasks.map(t => t.id);
    
    if (taskIds.length > 0) {
      await db.delete(taskLogs).where(inArray(taskLogs.taskId, taskIds));
    }
    
    // Delete tasks belonging to the user
    await db.delete(tasks).where(eq(tasks.userId, targetUserId));
    
    // Finally, delete the user
    await db.delete(users).where(eq(users.id, targetUserId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
