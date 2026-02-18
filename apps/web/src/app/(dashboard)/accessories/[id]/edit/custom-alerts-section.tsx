import { db } from "@/lib/db";
import { customerStocks, customers, accessories } from "@stock-tracker/database/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { CustomAlertForm } from "./custom-alert-form";

type Props = { accessoryId: number };

export async function CustomAlertsSection({ accessoryId }: Props) {
  const customAlertStocks = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      alertLevel: customerStocks.alertLevel,
      customerId: customerStocks.customerId,
      customerName: customers.name,
    })
    .from(customerStocks)
    .innerJoin(customers, eq(customerStocks.customerId, customers.id))
    .where(
      and(
        eq(customerStocks.accessoryId, accessoryId),
        isNotNull(customerStocks.alertLevel)
      )
    );

  const allCustomers = await db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .orderBy(customers.name);

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Custom alert levels (per customer)</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        Customers who have a custom threshold for this accessory.
      </p>
      {customAlertStocks.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Current stock</th>
                <th>Alert at</th>
              </tr>
            </thead>
            <tbody>
              {customAlertStocks.map((row) => (
                <tr key={row.id}>
                  <td>{row.customerName}</td>
                  <td>{row.quantity}</td>
                  <td>{row.alertLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CustomAlertForm accessoryId={accessoryId} customers={allCustomers} />
    </>
  );
}
