import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Nav() {
  const session = await getSession();
  if (!session) return null;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-links" style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}>
          Stock Tracker
        </Link>
        <div className="nav-links">
          <Link href="/">Dashboard</Link>
          <Link href="/customers">Customers</Link>
          <Link href="/accessories">Accessories</Link>
          {session.role === "admin" && <Link href="/users">Users</Link>}
          <Link href="/account">Account</Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="btn btn-secondary btn-sm">
              Log out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
