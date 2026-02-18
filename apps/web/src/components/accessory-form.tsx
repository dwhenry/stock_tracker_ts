"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { formDataFromElement } from "@/lib/form";

type Props = {
  id?: number;
  defaultName?: string;
  defaultBarcode?: string;
  defaultAlertWhenStockBelow?: number;
  imageBlobId?: number;
};

export function AccessoryForm({
  id,
  defaultName = "",
  defaultBarcode = "",
  defaultAlertWhenStockBelow = 0,
  imageBlobId,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = formDataFromElement(form);
    const url = id ? `/api/accessories/${id}` : "/api/accessories";
    const method = id ? "PATCH" : "POST";
    const res = await fetch(url, { method, body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push("/accessories");
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
        <label htmlFor="barcode">Barcode</label>
        <input
          id="barcode"
          name="barcode"
          required
          defaultValue={defaultBarcode}
        />
      </div>
      <div className="form-group">
        <label htmlFor="alertWhenStockBelow">Alert when stock below</label>
        <input
          id="alertWhenStockBelow"
          name="alertWhenStockBelow"
          type="number"
          min={0}
          required
          defaultValue={defaultAlertWhenStockBelow}
        />
      </div>
      <div className="form-group">
        <label htmlFor="image">Image</label>
        <input id="image" name="image" type="file" accept="image/*" />
        {imageBlobId && (
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Current image is set. Upload a new file to replace.
          </p>
        )}
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <button type="submit" className="btn btn-primary">
        {id ? "Update" : "Create"} accessory
      </button>
    </form>
  );
}
