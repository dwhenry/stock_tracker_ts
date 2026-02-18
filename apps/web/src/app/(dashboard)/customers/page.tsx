import Link from "next/link";
import { db } from "@/lib/db";
import { customers } from "@stock-tracker/database/schema";
import { asc } from "drizzle-orm";

export default async function CustomersPage() {
  const list = await db
    .select()
    .from(customers)
    .orderBy(asc(customers.name));

  return (
    <div className="container">
      <div className="page-header">
        <h1>Customers</h1>
        <Link href="/customers/new" className="btn btn-primary">
          Add customer
        </Link>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No customers yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>
                      <Link
                        href={`/customers/${c.id}/stocks`}
                        className="btn btn-sm btn-secondary"
                      >
                        Stock
                      </Link>{" "}
                      <Link
                        href={`/customers/${c.id}/edit`}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </Link>{" "}
                      <DeleteCustomerButton id={c.id} name={c.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DeleteCustomerButton({ id, name }: { id: number; name: string }) {
  return (
    <form
      action={`/api/customers/${id}`}
      method="post"
      style={{ display: "inline" }}
      onSubmit={(e) => {
        if (!confirm(`Delete customer "${name}"? This will delete all their stock records.`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="_method" value="DELETE" />
      <button type="submit" className="btn btn-sm btn-danger">
        Delete
      </button>
    </form>
  );
}
