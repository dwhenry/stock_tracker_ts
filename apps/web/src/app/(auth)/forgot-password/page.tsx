import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "3rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Forgot password</h1>
        <ForgotPasswordForm />
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
