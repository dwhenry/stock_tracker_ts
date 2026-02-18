import { db } from "@/lib/db";
import { customerStocks, accessories } from "@stock-tracker/database/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { CustomAlertForm } from "./custom-alert-form";

type Props = { customerId: number };

export async function CustomAlertsSection({ customerId }: Props) {
  const customAlertStocks = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      alertLevel: customerStocks.alertLevel,
      accessoryId: customerStocks.accessoryId,
      accessoryName: accessories.name,
    })
    .from(customerStocks)
    .innerJoin(accessories, eq(customerStocks.accessoryId, accessories.id))
    .where(
      and(
        eq(customerStocks.customerId, customerId),
        isNotNull(customerStocks.alertLevel)
      )
    );

  const allAccessories = await db
    .select({ id: accessories.id, name: accessories.name })
    .from(accessories)
    .orderBy(accessories.name);

  return (
    <>
      <h2 style={{ marginTop: 0 }}>Custom alert levels</h2>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        Override the default low-stock threshold per accessory for this customer.
      </p>
      {customAlertStocks.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: "1.5rem" }}>
          <table>
            <thead>
              <tr>
                <th>Accessory</th>
                <th>Current stock</th>
                <th>Alert at</th>
              </tr>
            </thead>
            <tbody>
              {customAlertStocks.map((row) => (
                <tr key={row.id}>
                  <td>{row.accessoryName}</td>
                  <td>{row.quantity}</td>
                  <td>{row.alertLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CustomAlertForm
        customerId={customerId}
        accessories={allAccessories}
      />
    </>
  );
}
