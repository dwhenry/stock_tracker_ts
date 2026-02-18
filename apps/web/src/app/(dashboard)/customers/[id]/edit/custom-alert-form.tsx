"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Props = {
  customerId: number;
  accessories: { id: number; name: string }[];
};

export function CustomAlertForm({ customerId, accessories }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    fd.set("customerId", String(customerId));
    const res = await fetch(`/api/customers/${customerId}/custom-alerts`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
          <label htmlFor="accessoryId">Accessory</label>
          <select id="accessoryId" name="accessoryId" required>
            <option value="">Select…</option>
            {accessories.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, maxWidth: 120 }}>
          <label htmlFor="alertLevel">Alert when below</label>
          <input
            id="alertLevel"
            name="alertLevel"
            type="number"
            min={0}
            placeholder="Optional"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Set alert level
        </button>
      </div>
      {error && <div className="alert alert-error" style={{ marginTop: "1rem" }}>{error}</div>}
    </form>
  );
}
