"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Props = {
  id?: number;
  defaultName?: string;
  defaultEmail?: string;
  defaultRole?: "basic" | "admin";
};

export function UserForm({
  id,
  defaultName = "",
  defaultEmail = "",
  defaultRole = "basic",
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    const url = id ? `/api/users/${id}` : "/api/users";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, { method, body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/users");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required defaultValue={defaultName} />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          readOnly={!!id}
          style={id ? { opacity: 0.8, cursor: "not-allowed" } : undefined}
        />
        {id && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Email cannot be changed.
          </p>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" required defaultValue={defaultRole}>
          <option value="basic">Basic</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {!id && (
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required={!id}
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      )}
      {id && (
        <div className="form-group">
          <label htmlFor="password">New password (leave blank to keep)</label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        {id ? "Update" : "Create"} user
      </button>
    </form>
  );
}
