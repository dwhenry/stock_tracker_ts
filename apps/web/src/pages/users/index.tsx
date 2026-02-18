import Link from "next/link";
import { DeleteUserButton } from "@/components/delete-user-button";
import type { GetServerSideProps } from "next";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { asc } from "drizzle-orm";

type UserRow = { id: number; name: string; email: string; role: string };

type Props = { list: UserRow[]; currentUserId: number };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getSessionFromRequest(context.req);
  if (!session || session.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }
  const list = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .orderBy(asc(users.name));
  return {
    props: {
      list: list as UserRow[],
      currentUserId: Number(session.sub),
    },
  };
};

export default function UsersPage({ list, currentUserId }: Props) {
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
                    <Link href={`/users/${u.id}/edit`} className="btn btn-sm btn-secondary">
                      Edit
                    </Link>{" "}
                    <DeleteUserButton id={u.id} name={u.name} currentUserId={currentUserId} />
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
