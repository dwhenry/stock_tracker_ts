import Link from "next/link";
import { CustomerForm } from "@/components/customer-form";
import { CustomAlertsSection } from "@/components/custom-alerts-section";
import type { GetServerSideProps } from "next";
import { db } from "@/lib/db";
import {
  customers,
  customerStocks,
  accessories,
} from "@stock-tracker/database/schema";
import { eq, and, isNotNull } from "drizzle-orm";

type Customer = { id: number; name: string; email: string };
type CustomAlertRow = {
  id: number;
  quantity: number;
  alertLevel: number | null;
  accessoryId: number;
  accessoryName: string;
};
type AccessoryOption = { id: number; name: string };

type Props = {
  customer: Customer;
  customAlertStocks: CustomAlertRow[];
  accessories: AccessoryOption[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const id = Number(context.params?.id);
  if (!Number.isFinite(id)) {
    return { notFound: true };
  }
  const [customer] = await db
    .select({ id: customers.id, name: customers.name, email: customers.email })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);
  if (!customer) return { notFound: true };

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
        eq(customerStocks.customerId, id),
        isNotNull(customerStocks.alertLevel)
      )
    );

  const allAccessories = await db
    .select({ id: accessories.id, name: accessories.name })
    .from(accessories)
    .orderBy(accessories.name);

  return {
    props: {
      customer: customer as Customer,
      customAlertStocks: customAlertStocks as CustomAlertRow[],
      accessories: allAccessories as AccessoryOption[],
    },
  };
};

export default function EditCustomerPage({
  customer,
  customAlertStocks,
  accessories,
}: Props) {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Edit customer</h1>
        <Link href="/customers" className="btn btn-secondary">
          Back
        </Link>
      </div>
      <div className="card">
        <CustomerForm
          id={customer.id}
          defaultName={customer.name}
          defaultEmail={customer.email}
        />
      </div>
      <div className="card">
        <CustomAlertsSection
          customerId={customer.id}
          customAlertStocks={customAlertStocks}
          accessories={accessories}
        />
      </div>
    </div>
  );
}
