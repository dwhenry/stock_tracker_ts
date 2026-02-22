import Link from "next/link";
import { DeleteCustomerButton } from "@/components/delete-customer-button";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import { customers } from "@stock-tracker/database/schema";
import { asc } from "drizzle-orm";

type Customer = { id: number; name: string; email: string };

type Props = { list: Customer[] };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const list = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
    })
    .from(customers)
    .orderBy(asc(customers.name));
  return { props: { list } };
};

export default function CustomersPage({ list }: Props) {
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
                  <td
                    colSpan={3}
                    style={{ textAlign: "center", color: "var(--text-muted)" }}
                  >
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
