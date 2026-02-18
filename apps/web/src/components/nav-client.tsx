"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionUser = { email: string; role: string } | null;

export function NavClient() {
  const [user, setUser] = useState<SessionUser>(undefined as unknown as SessionUser);

  useEffect(() => {
    fetch("/api/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) return null;
  if (!user) return null;

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
          {user.role === "admin" && <Link href="/users">Users</Link>}
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
