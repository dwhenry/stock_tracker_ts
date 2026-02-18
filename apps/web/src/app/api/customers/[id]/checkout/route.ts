import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customers,
  customerStocks,
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

  let body: { checkoutItems?: { customerStockId: number; quantity: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const checkoutItems = body.checkoutItems ?? [];
  if (checkoutItems.length === 0) {
    return NextResponse.json(
      { error: "Select at least one item to checkout" },
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

  for (const item of checkoutItems) {
    const qty = item.quantity;
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      );
    }
    const [stock] = await db
      .select()
      .from(customerStocks)
      .where(
        eq(customerStocks.id, item.customerStockId)
      )
      .limit(1);
    if (!stock || stock.customerId !== customerId) {
      return NextResponse.json(
        { error: "Stock record not found" },
        { status: 400 }
      );
    }
    if (qty > stock.quantity) {
      return NextResponse.json(
        { error: `Quantity for stock ${item.customerStockId} exceeds available (${stock.quantity})` },
        { status: 400 }
      );
    }
  }

  for (const item of checkoutItems) {
    const [stock] = await db
      .select()
      .from(customerStocks)
      .where(eq(customerStocks.id, item.customerStockId))
      .limit(1);
    if (!stock) continue;

    const newQty = stock.quantity - item.quantity;
    await db
      .update(customerStocks)
      .set({ quantity: newQty, updatedAt: new Date() })
      .where(eq(customerStocks.id, stock.id));

    await db.insert(stockAdjustments).values({
      customerStockId: stock.id,
      quantityChange: -item.quantity,
      adjustmentType: "checkout",
      notes: "Checkout",
    });
  }

  return NextResponse.json({ ok: true });
}
