import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";
import type { GetServerSideProps } from "next";
import { getSessionFromRequest } from "@/lib/auth";

type Props = { token: string | null };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getSessionFromRequest(context.req);
  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  const token = typeof context.query.token === "string" ? context.query.token : null;
  return { props: { token } };
};

export default function ResetPasswordPage({ token }: Props) {
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
