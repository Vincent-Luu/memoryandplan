import { NextResponse } from 'next/server';
import { db } from '../../../db';
import { users } from '../../../db/schema';
import { getCurrentUser, hashPassword } from '../../../lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users);

  return NextResponse.json(allUsers);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
        return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    
    await db.insert(users).values({
      username,
      password: hashedPassword,
      role: 'user',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === '23505') { // unique violation in Postgres
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
