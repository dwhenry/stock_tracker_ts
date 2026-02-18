import Link from "next/link";
import { SummaryCard } from "@/components/summary-card";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import {
  customers,
  accessories,
  customerStocks,
} from "@stock-tracker/database/schema";
import { count, eq, sql } from "drizzle-orm";

type LowStockRow = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  customerId: number;
  accessoryId: number;
  customerName: string;
  accessoryName: string;
  alertWhenStockBelow: number | null;
};

type Props = {
  customersCount: number;
  accessoriesCount: number;
  lowStockItems: LowStockRow[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [customersCount] = await db.select({ value: count() }).from(customers);
  const [accessoriesCount] = await db.select({ value: count() }).from(accessories);
  const lowStockItems = await db
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
    .orderBy(customerStocks.quantity)
    .limit(10);

  return {
    props: {
      customersCount: customersCount?.value ?? 0,
      accessoriesCount: accessoriesCount?.value ?? 0,
      lowStockItems: lowStockItems as LowStockRow[],
    },
  };
};

export default function DashboardPage({
  customersCount,
  accessoriesCount,
  lowStockItems,
}: Props) {
  const lowCount = lowStockItems.length;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <SummaryCard name="Customers" image="👥" count={customersCount} href="/customers" />
        <SummaryCard name="Accessories" image="📦" count={accessoriesCount} href="/accessories" />
        <SummaryCard
          name="Low stock alerts"
          image="⚠️"
          count={lowCount}
          href="/low-stock-alerts"
          linkText="Low stock alerts"
        />
      </div>
      {lowStockItems.length > 0 ? (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Low stock items</h2>
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
                {lowStockItems.map((row) => {
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
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
            <h3>All stock levels healthy</h3>
            <p>No items are currently below their alert thresholds.</p>
          </div>
        </div>
      )}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Quick actions</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
          }}
        >
          <Link href="/customers" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            Manage customers
          </Link>
          <Link href="/accessories" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            Manage accessories
          </Link>
          <Link href="/customers/new" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Add customer
          </Link>
          <Link href="/accessories/new" className="btn btn-primary" style={{ textDecoration: "none" }}>
            Add accessory
          </Link>
        </div>
      </div>
    </div>
  );
}
