import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";

type Item = { id: number; quantity: number; accessoryName: string };

type Props = { customerId: number; customerName: string; items: Item[] };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const id = Number(context.params?.id);
  if (!Number.isFinite(id)) return { notFound: true };

  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  if (!customer) return { notFound: true };

  const stocks = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      accessoryName: accessories.name,
    })
    .from(customerStocks)
    .innerJoin(accessories, eq(customerStocks.accessoryId, accessories.id))
    .where(eq(customerStocks.customerId, id))
    .orderBy(accessories.name);

  const withStock = stocks.filter((s) => s.quantity > 0) as Item[];

  return {
    props: {
      customerId: id,
      customerName: customer.name,
      items: withStock,
    },
  };
};

export default function CheckoutPage({ customerId, customerName, items }: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout — {customerName}</h1>
        <Link href={`/customers/${customerId}/stocks`} className="btn btn-secondary">
          Back to stock
        </Link>
      </div>
      <div className="card">
        {items.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            No items with stock to checkout. Add or adjust stock first.
          </p>
        ) : (
          <CheckoutForm customerId={customerId} items={items} />
        )}
      </div>
    </div>
  );
}
