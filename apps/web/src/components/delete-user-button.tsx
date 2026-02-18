"use client";

type Props = { id: number; name: string; currentUserId: number };

export function DeleteUserButton({ id, name, currentUserId }: Props) {
  const isSelf = id === currentUserId;
  if (isSelf) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>(you)</span>;
  }
  return (
    <form
      action={`/api/users/${id}`}
      method="post"
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(`Delete user "${name}"?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button type="submit" className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
