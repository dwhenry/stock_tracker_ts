import type { NextApiRequest, NextApiResponse } from "next";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerStocks, stockAdjustments } from "@stock-tracker/database/schema";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

function alertLevelFromRaw(raw: string | undefined): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const customerId = Number(req.query.id);
  const stockId = Number(req.query.stockId);
  if (!Number.isFinite(customerId) || !Number.isFinite(stockId)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "DELETE") {
    const [row] = await db
      .select()
      .from(customerStocks)
      .where(and(eq(customerStocks.id, stockId), eq(customerStocks.customerId, customerId)))
      .limit(1);
    if (!row) return res.status(404).json({ error: "Stock not found" });
    await db.delete(customerStocks).where(eq(customerStocks.id, stockId));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST") {
    const { fields } = await parseForm(req);
    if (fields._method === "DELETE") {
      const [row] = await db
        .select()
        .from(customerStocks)
        .where(and(eq(customerStocks.id, stockId), eq(customerStocks.customerId, customerId)))
        .limit(1);
      if (!row) return res.status(404).json({ error: "Stock not found" });
      await db.delete(customerStocks).where(eq(customerStocks.id, stockId));
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "PATCH, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fields } = await parseForm(req);
  const quantity = Number(fields.quantity);
  const alertLevel = alertLevelFromRaw(fields.alertLevel as string);

  if (!Number.isFinite(quantity) || quantity < 0) {
    return res.status(400).json({ error: "Quantity must be a non-negative number" });
  }

  const [row] = await db
    .select()
    .from(customerStocks)
    .where(and(eq(customerStocks.id, stockId), eq(customerStocks.customerId, customerId)))
    .limit(1);
  if (!row) return res.status(404).json({ error: "Stock not found" });

  const oldQuantity = row.quantity;
  await db
    .update(customerStocks)
    .set({ quantity, alertLevel: alertLevel ?? null, updatedAt: new Date() })
    .where(eq(customerStocks.id, stockId));

  const change = quantity - oldQuantity;
  if (change !== 0) {
    await db.insert(stockAdjustments).values({
      customerStockId: stockId,
      quantityChange: change,
      adjustmentType: change > 0 ? "addition" : "removal",
      notes: "Manual stock adjustment",
    });
  }
  return res.status(200).json({ ok: true });
}
