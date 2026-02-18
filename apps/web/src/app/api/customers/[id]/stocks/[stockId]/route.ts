import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerStocks } from "@stock-tracker/database/schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stockId: string }> }
) {
  const customerId = Number((await params).id);
  const stockId = Number((await params).stockId);
  if (!Number.isFinite(customerId) || !Number.isFinite(stockId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const formData = await request.formData();
  const quantity = Number(formData.get("quantity"));
  const alertLevelRaw = formData.get("alertLevel");
  const alertLevel =
    alertLevelRaw === "" || alertLevelRaw === null
      ? null
      : Number(alertLevelRaw);

  if (!Number.isFinite(quantity) || quantity < 0) {
    return NextResponse.json(
      { error: "Quantity must be a non-negative number" },
      { status: 400 }
    );
  }

  const [row] = await db
    .select()
    .from(customerStocks)
    .where(
      and(
        eq(customerStocks.id, stockId),
        eq(customerStocks.customerId, customerId)
      )
    )
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  const oldQuantity = row.quantity;
  await db
    .update(customerStocks)
    .set({
      quantity,
      alertLevel: alertLevel ?? null,
      updatedAt: new Date(),
    })
    .where(eq(customerStocks.id, stockId));

  // Record adjustment
  const { stockAdjustments } = await import("@stock-tracker/database/schema");
  const change = quantity - oldQuantity;
  if (change !== 0) {
    await db.insert(stockAdjustments).values({
      customerStockId: stockId,
      quantityChange: change,
      adjustmentType: change > 0 ? "addition" : "removal",
      notes: "Manual stock adjustment",
    });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stockId: string }> }
) {
  const formData = await request.formData();
  if (formData.get("_method") === "DELETE") {
    return DELETE(request, { params });
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; stockId: string }> }
) {
  const customerId = Number((await params).id);
  const stockId = Number((await params).stockId);
  if (!Number.isFinite(customerId) || !Number.isFinite(stockId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const [row] = await db
    .select()
    .from(customerStocks)
    .where(
      and(
        eq(customerStocks.id, stockId),
        eq(customerStocks.customerId, customerId)
      )
    )
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  }

  await db.delete(customerStocks).where(eq(customerStocks.id, stockId));
  return NextResponse.json({ ok: true });
}
