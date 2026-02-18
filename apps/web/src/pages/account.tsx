import { AccountForm } from "@/components/account-form";
import type { GetServerSideProps } from "next";
import { getSessionFromRequest } from "@/lib/auth";
import type { JWTPayload } from "@/lib/auth";

type Props = { session: JWTPayload };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const session = await getSessionFromRequest(context.req);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { session } };
};

export default function AccountPage({ session }: Props) {
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
