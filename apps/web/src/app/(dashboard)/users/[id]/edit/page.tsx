import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";
import { UserForm } from "@/components/user-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) notFound();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit user</h1>
        <Link href="/users" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <UserForm
          id={user.id}
          defaultName={user.name}
          defaultEmail={user.email}
          defaultRole={user.role}
        />
      </div>
    </div>
  );
}
