"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Accessory = { id: number; name: string; barcode: string; alertWhenStockBelow: number };

type Props = { customerId: number; accessories: Accessory[] };

export function NewStockForm({ customerId, accessories }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    fd.set("customerId", String(customerId));
    const res = await fetch(`/api/customers/${customerId}/stocks`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push(`/customers/${customerId}/stocks`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="accessoryId">Accessory</label>
        <select id="accessoryId" name="accessoryId" required>
          <option value="">Select…</option>
          {accessories.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} (default alert: {a.alertWhenStockBelow})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input id="quantity" name="quantity" type="number" min={0} required defaultValue={0} />
      </div>
      <div className="form-group">
        <label htmlFor="alertLevel">Alert when below (optional override)</label>
        <input id="alertLevel" name="alertLevel" type="number" min={0} placeholder="Use accessory default" />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        Add stock
      </button>
    </form>
  );
}
