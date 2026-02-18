import Link from "next/link";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import {
  customers,
  accessories,
  customerStocks,
} from "@stock-tracker/database/schema";
import { eq, sql } from "drizzle-orm";

type Row = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  customerId: number;
  accessoryId: number;
  customerName: string;
  accessoryName: string;
  alertWhenStockBelow: number | null;
};

type Props = { items: Row[] };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const items = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      alertLevel: customerStocks.alertLevel,
      customerId: customerStocks.customerId,
      accessoryId: customerStocks.accessoryId,
      customerName: customers.name,
      accessoryName: accessories.name,
      alertWhenStockBelow: accessories.alertWhenStockBelow,
    })
    .from(customerStocks)
    .innerJoin(customers, eq(customerStocks.customerId, customers.id))
    .innerJoin(accessories, eq(customerStocks.accessoryId, accessories.id))
    .where(
      sql`${customerStocks.quantity} <= COALESCE(${customerStocks.alertLevel}, ${accessories.alertWhenStockBelow})`
    )
    .orderBy(customerStocks.quantity);
  return { props: { items: items as Row[] } };
};

export default function LowStockAlertsPage({ items }: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Low stock alerts</h1>
        <Link href="/" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
            <h3>All stock levels healthy</h3>
            <p>No items are currently below their alert thresholds.</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>Items below threshold</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Accessory</th>
                    <th>Current stock</th>
                    <th>Alert threshold</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => {
                    const threshold = row.alertLevel ?? row.alertWhenStockBelow ?? 0;
                    return (
                      <tr key={row.id}>
                        <td>{row.customerName}</td>
                        <td>{row.accessoryName}</td>
                        <td className="danger">{row.quantity}</td>
                        <td>{threshold}</td>
                        <td>
                          <Link
                            href={`/customers/${row.customerId}/stocks`}
                            className="btn btn-sm btn-secondary"
                          >
                            View stock
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
