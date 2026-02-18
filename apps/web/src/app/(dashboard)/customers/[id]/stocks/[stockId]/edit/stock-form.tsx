"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Props = {
  customerId: number;
  stockId: number;
  defaultQuantity: number;
  defaultAlertLevel?: number;
  accessoryName: string;
};

export function StockForm({
  customerId,
  stockId,
  defaultQuantity,
  defaultAlertLevel,
  accessoryName,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    const res = await fetch(`/api/customers/${customerId}/stocks/${stockId}`, {
      method: "PATCH",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push(`/customers/${customerId}/stocks`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
        Editing stock for <strong>{accessoryName}</strong>
      </p>
      <div className="form-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          required
          defaultValue={defaultQuantity}
        />
      </div>
      <div className="form-group">
        <label htmlFor="alertLevel">Alert when below (optional override)</label>
        <input
          id="alertLevel"
          name="alertLevel"
          type="number"
          min={0}
          placeholder="Use accessory default"
          defaultValue={defaultAlertLevel ?? ""}
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        Update stock
      </button>
    </form>
  );
}
