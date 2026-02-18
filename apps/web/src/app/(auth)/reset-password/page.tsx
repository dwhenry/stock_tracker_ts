import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "3rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Reset password</h1>
        {!token ? (
          <div className="alert alert-error">
            Invalid or missing reset link. Request a new one from the login page.
          </div>
        ) : (
          <ResetPasswordForm token={token} />
        )}
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
