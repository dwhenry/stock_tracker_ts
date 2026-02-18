import Link from "next/link";
import { StockForm } from "@/components/stock-form";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { and, eq } from "drizzle-orm";

type Props = {
  customerId: number;
  stockId: number;
  quantity: number;
  alertLevel: number | null;
  accessoryName: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const customerId = Number(context.params?.id);
  const stockId = Number(context.params?.stockId);
  if (!Number.isFinite(customerId) || !Number.isFinite(stockId)) return { notFound: true };

  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) return { notFound: true };

  const [stock] = await db
    .select({
      id: customerStocks.id,
      quantity: customerStocks.quantity,
      alertLevel: customerStocks.alertLevel,
      accessoryName: accessories.name,
    })
    .from(customerStocks)
    .innerJoin(accessories, eq(customerStocks.accessoryId, accessories.id))
    .where(and(eq(customerStocks.id, stockId), eq(customerStocks.customerId, customerId)))
    .limit(1);

  if (!stock) return { notFound: true };

  return {
    props: {
      customerId,
      stockId,
      quantity: stock.quantity,
      alertLevel: stock.alertLevel,
      accessoryName: stock.accessoryName,
    },
  };
};

export default function EditStockPage({
  customerId,
  stockId,
  quantity,
  alertLevel,
  accessoryName,
}: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit stock: {accessoryName}</h1>
        <Link href={`/customers/${customerId}/stocks`} className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <StockForm
          customerId={customerId}
          stockId={stockId}
          defaultQuantity={quantity}
          defaultAlertLevel={alertLevel ?? undefined}
          accessoryName={accessoryName}
        />
      </div>
    </div>
  );
}
