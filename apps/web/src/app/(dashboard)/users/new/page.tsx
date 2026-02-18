import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { UserForm } from "@/components/user-form";

export default async function NewUserPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

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
