import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  customers,
  customerStocks,
  stockAdjustments,
} from "@stock-tracker/database/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const customerId = Number(req.query.id);
  if (!Number.isFinite(customerId)) {
    return res.status(400).json({ error: "Invalid customer" });
  }

  const body = typeof req.body === "object" && req.body !== null ? req.body : {};
  const checkoutItems = (body as { checkoutItems?: { customerStockId: number; quantity: number }[] }).checkoutItems ?? [];
  if (checkoutItems.length === 0) {
    return res.status(400).json({ error: "Select at least one item to checkout" });
  }

  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  for (const item of checkoutItems) {
    const qty = item.quantity;
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    const [stock] = await db
      .select()
      .from(customerStocks)
      .where(eq(customerStocks.id, item.customerStockId))
      .limit(1);
    if (!stock || stock.customerId !== customerId) {
      return res.status(400).json({ error: "Stock record not found" });
    }
    if (qty > stock.quantity) {
      return res.status(400).json({
        error: `Quantity for stock ${item.customerStockId} exceeds available (${stock.quantity})`,
      });
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
  return res.status(200).json({ ok: true });
}
