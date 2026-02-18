import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AccountForm } from "./account-form";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="container">
      <div className="page-header">
        <h1>Account</h1>
      </div>
      <div className="card">
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
          Signed in as <strong>{session.email}</strong>
        </p>
        <AccountForm />
      </div>
    </div>
  );
}
