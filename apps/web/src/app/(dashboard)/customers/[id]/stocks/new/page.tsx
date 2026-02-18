import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { eq, notInArray } from "drizzle-orm";
import { NewStockForm } from "./new-stock-form";

type Props = { params: Promise<{ id: string }> };

export default async function NewCustomerStockPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!customer) notFound();

  const existingAccessoryIds = await db
    .select({ accessoryId: customerStocks.accessoryId })
    .from(customerStocks)
    .where(eq(customerStocks.customerId, id));
  const ids = existingAccessoryIds.map((r) => r.accessoryId);
  const availableAccessories =
    ids.length === 0
      ? await db.select().from(accessories).orderBy(accessories.name)
      : await db
          .select()
          .from(accessories)
          .where(notInArray(accessories.id, ids))
          .orderBy(accessories.name);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Add stock for {customer.name}</h1>
        <Link href={`/customers/${id}/stocks`} className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        {availableAccessories.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            This customer already has a stock record for every accessory. Edit an
            existing record to change quantity.
          </p>
        ) : (
          <NewStockForm
            customerId={id}
            accessories={availableAccessories}
          />
        )}
      </div>
    </div>
  );
}
