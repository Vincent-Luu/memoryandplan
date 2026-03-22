import { db } from "../../db";
import { users } from "../../db/schema";
import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user || !user.admin) {
    redirect("/");
  }

  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    createdAt: users.createdAt,
  }).from(users);

  return <SettingsClient initialUsers={allUsers} />;
}
