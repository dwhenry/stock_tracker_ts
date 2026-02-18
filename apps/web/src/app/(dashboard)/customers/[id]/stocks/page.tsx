import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";
import { DeleteStockButton } from "./delete-stock-button";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerStocksPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!customer) notFound();

  const stocks = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      alertLevel: customerStocks.alertLevel,
      accessoryId: customerStocks.accessoryId,
      accessoryName: accessories.name,
      alertWhenStockBelow: accessories.alertWhenStockBelow,
    })
    .from(customerStocks)
    .innerJoin(accessories, eq(customerStocks.accessoryId, accessories.id))
    .where(eq(customerStocks.customerId, id))
    .orderBy(accessories.name);

  const effectiveThreshold = (row: {
    alertLevel: number | null;
    alertWhenStockBelow: number;
  }) => row.alertLevel ?? row.alertWhenStockBelow;
  const isLow = (row: {
    quantity: number;
    alertLevel: number | null;
    alertWhenStockBelow: number;
  }) => row.quantity <= effectiveThreshold(row);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Stock for {customer.name}</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href={`/customers/${id}/checkout`} className="btn btn-primary">
            Checkout
          </Link>
          <Link href={`/customers/${id}/stocks/new`} className="btn btn-secondary">
            Add stock
          </Link>
          <Link href={`/customers/${id}/edit`} className="btn btn-secondary">
            Edit customer
          </Link>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Accessory</th>
                <th>Quantity</th>
                <th>Alert threshold</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No stock records. Add one to get started.
                  </td>
                </tr>
              ) : (
                stocks.map((row) => {
                  const threshold = effectiveThreshold(row);
                  const low = isLow(row);
                  return (
                    <tr key={row.id} className={low ? "low-stock-row" : undefined}>
                      <td>{row.accessoryName}</td>
                      <td className={low ? "danger" : undefined}>{row.quantity}</td>
                      <td>{threshold}</td>
                      <td>{low ? "Low" : "OK"}</td>
                      <td>
                        <Link
                          href={`/customers/${id}/stocks/${row.id}/edit`}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
                        </Link>{" "}
                        <DeleteStockButton
                          customerId={id}
                          stockId={row.id}
                          accessoryName={row.accessoryName}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
