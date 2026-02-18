"use client";

type Props = { id: number; name: string };

export function DeleteAccessoryButton({ id, name }: Props) {
  return (
    <form
      action={`/api/accessories/${id}`}
      method="post"
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(`Delete accessory "${name}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button type="submit" className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
