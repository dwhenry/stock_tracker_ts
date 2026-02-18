"use client";

type Props = { customerId: number; stockId: number; accessoryName: string };

export function DeleteStockButton({ customerId, stockId, accessoryName }: Props) {
  return (
    <form
      action={`/api/customers/${customerId}/stocks/${stockId}`}
      method="post"
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(`Remove stock record for "${accessoryName}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button type="submit" className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
