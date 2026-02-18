"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Item = {
  id: number;
  quantity: number;
  accessoryName: string;
};

type Props = { customerId: number; items: Item[] };

export function CheckoutForm({ customerId, items }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    const checkoutItems: { customerStockId: number; quantity: number }[] = [];
    for (const item of items) {
      const qty = Number(fd.get(`qty_${item.id}`) ?? 0);
      if (qty > 0 && qty <= item.quantity) {
        checkoutItems.push({ customerStockId: item.id, quantity: qty });
      }
    }
    if (checkoutItems.length === 0) {
      setError("Select at least one item with a valid quantity.");
      return;
    }

    const res = await fetch(`/api/customers/${customerId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutItems }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Checkout failed.");
      return;
    }
    router.push(`/customers/${customerId}/stocks`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Accessory</th>
              <th>Available</th>
              <th>Checkout qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.accessoryName}</td>
                <td>{item.quantity}</td>
                <td>
                  <input
                    name={`qty_${item.id}`}
                    type="number"
                    min={0}
                    max={item.quantity}
                    defaultValue={0}
                    style={{ width: 80 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        Complete checkout
      </button>
    </form>
  );
}
