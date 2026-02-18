"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Props = { returnTo?: string };

export function LoginForm({ returnTo }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      setError("Invalid email or password.");
      return;
    }
    router.push(returnTo ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        Log in
      </button>
    </form>
  );
}
