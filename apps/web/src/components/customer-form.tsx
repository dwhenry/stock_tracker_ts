"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Props = {
  id?: number;
  defaultName?: string;
  defaultEmail?: string;
};

export function CustomerForm({
  id,
  defaultName = "",
  defaultEmail = "",
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    const url = id ? `/api/customers/${id}` : "/api/customers";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, { method, body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/customers");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          required
          defaultValue={defaultName}
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        {id ? "Update" : "Create"} customer
      </button>
    </form>
  );
}
