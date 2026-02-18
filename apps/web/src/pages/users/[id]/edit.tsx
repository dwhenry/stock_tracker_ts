import Link from "next/link";
import { UserForm } from "@/components/user-form";
import type { GetServerSideProps } from "next";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";

type User = {
  id: number;
  name: string;
  email: string;
  role: "basic" | "admin";
};

type Props = { user: User };

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSessionFromRequest(context.req);
  if (!session || session.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }
  const id = Number(context.params?.id);
  if (!Number.isFinite(id)) return { notFound: true };

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) return { notFound: true };

  return {
    props: {
      user,
    },
  };
};

export default function EditUserPage({ user }: Props) {
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
