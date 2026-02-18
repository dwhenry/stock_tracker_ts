import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { customers } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";
import { CustomerForm } from "@/components/customer-form";
import { CustomAlertsSection } from "./custom-alerts-section";

type Props = { params: Promise<{ id: string }> };

export default async function EditCustomerPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!customer) notFound();

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
        <CustomAlertsSection customerId={id} />
      </div>
    </div>
  );
}
