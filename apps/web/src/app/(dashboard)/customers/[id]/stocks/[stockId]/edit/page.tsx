import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { and, eq } from "drizzle-orm";
import { StockForm } from "./stock-form";

type Props = { params: Promise<{ id: string; stockId: string }> };

export default async function EditStockPage({ params }: Props) {
  const customerId = Number((await params).id);
  const stockId = Number((await params).stockId);
  if (!Number.isFinite(customerId) || !Number.isFinite(stockId)) notFound();

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!customer) notFound();

  const [stock] = await db
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
        eq(customerStocks.id, stockId),
        eq(customerStocks.customerId, customerId)
      )
    )
    .limit(1);

  if (!stock) notFound();

  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit stock: {stock.accessoryName}</h1>
        <Link href={`/customers/${customerId}/stocks`} className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <StockForm
          customerId={customerId}
          stockId={stockId}
          defaultQuantity={stock.quantity}
          defaultAlertLevel={stock.alertLevel ?? undefined}
          accessoryName={stock.accessoryName}
        />
      </div>
    </div>
  );
}
