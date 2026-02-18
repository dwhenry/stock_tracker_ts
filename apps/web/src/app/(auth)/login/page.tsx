import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

type Props = { searchParams: Promise<{ returnTo?: string; error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSession();
  if (session) redirect("/");

  const { returnTo, error } = await searchParams;

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "3rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Log in</h1>
        {error === "invalid" && (
          <div className="alert alert-error">Invalid email or password.</div>
        )}
        <LoginForm returnTo={returnTo ?? undefined} />
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
