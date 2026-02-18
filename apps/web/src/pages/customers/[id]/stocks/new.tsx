import Link from "next/link";
import { NewStockForm } from "@/components/new-stock-form";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import {
  customers,
  customerStocks,
  accessories,
} from "@stock-tracker/database/schema";
import { eq, notInArray } from "drizzle-orm";

type Accessory = {
  id: number;
  name: string;
  barcode: string;
  alertWhenStockBelow: number;
};

type Props = {
  customerId: number;
  customerName: string;
  accessories: Accessory[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const id = Number(context.params?.id);
  if (!Number.isFinite(id)) return { notFound: true };

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!customer) return { notFound: true };

  const existingAccessoryIds = await db
    .select({ accessoryId: customerStocks.accessoryId })
    .from(customerStocks)
    .where(eq(customerStocks.customerId, id));
  const ids = existingAccessoryIds.map((r) => r.accessoryId);
  const baseQuery = db
    .select({
      id: accessories.id,
      name: accessories.name,
      alertWhenStockBelow: accessories.alertWhenStockBelow,
    })
    .from(accessories)
    .orderBy(accessories.name);
  const availableAccessories =
    ids.length === 0
      ? await baseQuery
      : await baseQuery.where(notInArray(accessories.id, ids));

  return {
    props: {
      customerId: id,
      customerName: customer.name,
      accessories: availableAccessories as Accessory[],
    },
  };
};

export default function NewCustomerStockPage({
  customerId,
  customerName,
  accessories,
}: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Add stock for {customerName}</h1>
        <Link
          href={`/customers/${customerId}/stocks`}
          className="btn btn-secondary"
        >
          Back
        </Link>
      </div>
      <div className="card">
        {accessories.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            This customer already has a stock record for every accessory. Edit
            an existing record to change quantity.
          </p>
        ) : (
          <NewStockForm customerId={customerId} accessories={accessories} />
        )}
      </div>
    </div>
  );
}
