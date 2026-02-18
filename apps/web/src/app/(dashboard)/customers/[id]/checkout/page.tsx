import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";
import { CheckoutForm } from "./checkout-form";

type Props = { params: Promise<{ id: string }> };

export default async function CheckoutPage({ params }: Props) {
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

  const withStock = stocks.filter((s) => s.quantity > 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout — {customer.name}</h1>
        <Link href={`/customers/${id}/stocks`} className="btn btn-secondary">
          Back to stock
        </Link>
      </div>
      <div className="card">
        {withStock.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            No items with stock to checkout. Add or adjust stock first.
          </p>
        ) : (
          <CheckoutForm customerId={id} items={withStock} />
        )}
      </div>
    </div>
  );
}
