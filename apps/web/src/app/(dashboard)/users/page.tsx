import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { asc } from "drizzle-orm";
import { DeleteUserButton } from "./delete-user-button";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const list = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .orderBy(asc(users.name));

  return (
    <div className="container">
      <div className="page-header">
        <h1>Users</h1>
        <Link href="/users/new" className="btn btn-primary">
          Add user
        </Link>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <Link
                      href={`/users/${u.id}/edit`}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </Link>{" "}
                    <DeleteUserButton
                      id={u.id}
                      name={u.name}
                      currentUserId={Number(session.sub)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
