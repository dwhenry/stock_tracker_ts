import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import type { GetServerSideProps } from "next";
import { getSessionFromRequest } from "@/lib/auth";

type Props = { returnTo?: string; error?: string };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getSessionFromRequest(context.req);
  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  const returnTo = typeof context.query.returnTo === "string" ? context.query.returnTo : undefined;
  const error = typeof context.query.error === "string" ? context.query.error : undefined;
  return { props: { returnTo, error } };
};

export default function LoginPage({ returnTo, error }: Props) {
  return (
    <div className="container" style={{ maxWidth: 400, marginTop: "3rem" }}>
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Log in</h1>
        {error === "invalid" && (
          <div className="alert alert-error">Invalid email or password.</div>
        )}
        <LoginForm returnTo={returnTo} />
        <p style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
