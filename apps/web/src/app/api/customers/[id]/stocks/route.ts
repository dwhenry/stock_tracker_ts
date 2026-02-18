import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customers,
  customerStocks,
  accessories,
  stockAdjustments,
} from "@stock-tracker/database/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customerId = Number((await params).id);
  if (!Number.isFinite(customerId)) {
    return NextResponse.json({ error: "Invalid customer" }, { status: 400 });
  }

  const formData = await request.formData();
  const accessoryId = Number(formData.get("accessoryId"));
  const quantity = Number(formData.get("quantity"));
  const alertLevelRaw = formData.get("alertLevel");
  const alertLevel =
    alertLevelRaw === "" || alertLevelRaw === null
      ? null
      : Number(alertLevelRaw);

  if (!Number.isFinite(accessoryId)) {
    return NextResponse.json(
      { error: "Valid accessory required" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(quantity) || quantity < 0) {
    return NextResponse.json(
      { error: "Quantity must be a non-negative number" },
      { status: 400 }
    );
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const [accessory] = await db
    .select()
    .from(accessories)
    .where(eq(accessories.id, accessoryId))
    .limit(1);
  if (!accessory) {
    return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
  }

  const [existing] = await db
    .select()
    .from(customerStocks)
    .where(
      and(
        eq(customerStocks.customerId, customerId),
        eq(customerStocks.accessoryId, accessoryId)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "This customer already has a stock record for this accessory" },
      { status: 400 }
    );
  }

  const insertResult = await db
    .insert(customerStocks)
    .values({
      customerId,
      accessoryId,
      quantity,
      alertLevel,
    });

  const newId = Array.isArray(insertResult)
    ? (insertResult[0] as { insertId?: number })?.insertId
    : (insertResult as { insertId?: number })?.insertId;

  if (newId != null) {
    await db.insert(stockAdjustments).values({
      customerStockId: newId,
      quantityChange: quantity,
      adjustmentType: "initial",
      notes: "Initial stock setup",
    });
  }

  return NextResponse.json({ ok: true });
}
