import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { accessories } from "@stock-tracker/database/schema";
import { eq } from "drizzle-orm";
import { AccessoryForm } from "@/components/accessory-form";
import { CustomAlertsSection } from "./custom-alerts-section";

type Props = { params: Promise<{ id: string }> };

export default async function EditAccessoryPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const [accessory] = await db
    .select()
    .from(accessories)
    .where(eq(accessories.id, id))
    .limit(1);

  if (!accessory) notFound();

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
        <CustomAlertsSection accessoryId={id} />
      </div>
    </div>
  );
}
