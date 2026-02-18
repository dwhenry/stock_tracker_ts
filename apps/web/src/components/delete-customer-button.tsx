"use client";

type Props = { id: number; name: string };

export function DeleteCustomerButton({ id, name }: Props) {
  return (
    <form
      action={`/api/customers/${id}`}
      method="post"
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(`Delete customer "${name}"? This will delete all their stock records.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button type="submit" className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
