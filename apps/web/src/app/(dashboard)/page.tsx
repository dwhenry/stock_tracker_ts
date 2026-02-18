import Link from "next/link";
import { db } from "@/lib/db";
import {
  customers,
  accessories,
  customerStocks,
} from "@stock-tracker/database/schema";
import { count, eq, sql } from "drizzle-orm";
import styled from "styled-components";

const StyledLink = styled(Link)`
  position: absolute;
  top: 0;
  right: 20px;
  z-index: 1000;
`;

export default async function DashboardPage() {
  const [customersCount] = await db.select({ value: count() }).from(customers);
  const [accessoriesCount] = await db
    .select({ value: count() })
    .from(accessories);

  // Low stock: quantity <= COALESCE(alert_level, accessory.alert_when_stock_below)
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
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "2rem" }}>👥</span>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                }}
              >
                {customersCount?.value ?? 0}
              </span>
              <span style={{ color: "var(--text-muted)" }}>Customers</span>
            </div>
            <Link
              href="/customers"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: "auto" }}
            >
              Manage
            </Link>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "2rem" }}>📦</span>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                }}
              >
                {accessoriesCount?.value ?? 0}
              </span>
              <span style={{ color: "var(--text-muted)" }}>Accessories</span>
            </div>
            <Link
              href="/accessories"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: "auto" }}
            >
              Manage
            </Link>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "2rem" }}>⚠️</span>
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                }}
              >
                {lowCount}
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                Low stock alerts
              </span>
            </div>
          </div>
        </div>
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
                  const threshold =
                    row.alertLevel ?? row.alertWhenStockBelow ?? 0;
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
          <Link
            href="/customers"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            Manage customers
          </Link>
          <Link
            href="/accessories"
            className="btn btn-secondary"
            style={{ textDecoration: "none" }}
          >
            Manage accessories
          </Link>
          <Link
            href="/customers/new"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Add customer
          </Link>
          <Link
            href="/accessories/new"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Add accessory
          </Link>
        </div>
      </div>
    </div>
  );
}
