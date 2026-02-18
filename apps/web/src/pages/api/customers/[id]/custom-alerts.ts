import type { NextApiRequest, NextApiResponse } from "next";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, customerStocks, accessories } from "@stock-tracker/database/schema";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

function alertLevelFromRaw(raw: string | undefined): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const customerId = Number(req.query.id);
  if (!Number.isFinite(customerId)) {
    return res.status(400).json({ error: "Invalid customer" });
  }

  const { fields } = await parseForm(req);
  const accessoryId = Number(fields.accessoryId);
  const alertLevel = alertLevelFromRaw(fields.alertLevel as string);

  if (!Number.isFinite(accessoryId)) {
    return res.status(400).json({ error: "Valid accessory required" });
  }

  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const [accessory] = await db.select().from(accessories).where(eq(accessories.id, accessoryId)).limit(1);
  if (!accessory) return res.status(404).json({ error: "Accessory not found" });

  const [existing] = await db
    .select()
    .from(customerStocks)
    .where(and(eq(customerStocks.customerId, customerId), eq(customerStocks.accessoryId, accessoryId)))
    .limit(1);

  if (existing) {
    await db
      .update(customerStocks)
      .set({ alertLevel, updatedAt: new Date() })
      .where(eq(customerStocks.id, existing.id));
  } else {
    await db.insert(customerStocks).values({
      customerId,
      accessoryId,
      quantity: 0,
      alertLevel,
    });
  }
  return res.status(200).json({ ok: true });
}
