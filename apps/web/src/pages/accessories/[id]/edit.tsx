import Link from "next/link";
import { AccessoryForm } from "@/components/accessory-form";
import { AccessoryCustomAlertsSection } from "@/components/accessory-custom-alerts-section";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import {
  accessories,
  customerStocks,
  customers,
} from "@stock-tracker/database/schema";
import { eq, and, isNotNull } from "drizzle-orm";

type Accessory = {
  id: number;
  name: string;
  barcode: string;
  alertWhenStockBelow: number;
  imageBlobId: number | null;
};
type CustomAlertRow = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  customerId: number;
  customerName: string;
};
type CustomerOption = { id: number; name: string };

type Props = {
  accessory: Accessory;
  customAlertStocks: CustomAlertRow[];
  customers: CustomerOption[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const id = Number(context.params?.id);
  if (!Number.isFinite(id)) return { notFound: true };

  const [accessory] = await db
    .select({
      id: accessories.id,
      name: accessories.name,
      barcode: accessories.barcode,
      alertWhenStockBelow: accessories.alertWhenStockBelow,
      imageBlobId: accessories.imageBlobId,
    })
    .from(accessories)
    .where(eq(accessories.id, id))
    .limit(1);
  if (!accessory) return { notFound: true };

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
        eq(customerStocks.accessoryId, id),
        isNotNull(customerStocks.alertLevel)
      )
    );

  const allCustomers = await db
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .orderBy(customers.name);

  return {
    props: {
      accessory: accessory as Accessory,
      customAlertStocks: customAlertStocks as CustomAlertRow[],
      customers: allCustomers as CustomerOption[],
    },
  };
};

export default function EditAccessoryPage({
  accessory,
  customAlertStocks,
  customers,
}: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit accessory</h1>
        <Link href="/accessories" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <AccessoryForm
          id={accessory.id}
          defaultName={accessory.name}
          defaultBarcode={accessory.barcode}
          defaultAlertWhenStockBelow={accessory.alertWhenStockBelow}
          imageBlobId={accessory.imageBlobId ?? undefined}
        />
      </div>
      <div className="card">
        <AccessoryCustomAlertsSection
          accessoryId={accessory.id}
          customAlertStocks={customAlertStocks}
          customers={customers}
        />
      </div>
    </div>
  );
}
