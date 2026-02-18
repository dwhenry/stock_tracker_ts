import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accessories,
  customerStocks,
  customers,
} from "@stock-tracker/database/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const accessoryId = Number((await params).id);
  if (!Number.isFinite(accessoryId)) {
    return NextResponse.json({ error: "Invalid accessory" }, { status: 400 });
  }

  const formData = await request.formData();
  const customerId = Number(formData.get("customerId"));
  const alertLevelRaw = formData.get("alertLevel");
  const alertLevel =
    alertLevelRaw === "" || alertLevelRaw === null
      ? null
      : Number(alertLevelRaw);

  if (!Number.isFinite(customerId)) {
    return NextResponse.json(
      { error: "Valid customer required" },
      { status: 400 }
    );
  }

  const [accessory] = await db
    .select()
    .from(accessories)
    .where(eq(accessories.id, accessoryId))
    .limit(1);
  if (!accessory) {
    return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const [existing] = await db
    .select()
    .from(customerStocks)
    .where(
      and(
        eq(customerStocks.accessoryId, accessoryId),
        eq(customerStocks.customerId, customerId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(customerStocks)
      .set({ alertLevel, updatedAt: new Date() })
      .where(eq(customerStocks.id, existing.id));
  } else {
    await db.insert(customerStocks).values({
      accessoryId,
      customerId,
      quantity: 0,
      alertLevel,
    });
  }

  return NextResponse.json({ ok: true });
}
