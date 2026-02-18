import Link from "next/link";
import { UserForm } from "@/components/user-form";
import type { GetServerSideProps } from "next";
import { getSessionFromRequest } from "@/lib/auth";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSessionFromRequest(context.req);
  if (!session || session.role !== "admin") {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
};

export default function NewUserPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Add user</h1>
        <Link href="/users" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <UserForm />
      </div>
    </div>
  );
}
