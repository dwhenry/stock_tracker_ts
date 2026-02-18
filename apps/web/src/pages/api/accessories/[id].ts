import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessories, blobs } from "@stock-tracker/database/schema";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "DELETE") {
    await db.delete(accessories).where(eq(accessories.id, id));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST") {
    const { fields } = await parseForm(req);
    if (fields._method === "DELETE") {
      await db.delete(accessories).where(eq(accessories.id, id));
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "PATCH, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [existing] = await db.select().from(accessories).where(eq(accessories.id, id)).limit(1);
  if (!existing) return res.status(404).json({ error: "Accessory not found" });

  const { fields, files } = await parseForm(req);
  const name = (fields.name as string)?.trim();
  const barcode = (fields.barcode as string)?.trim();
  const alertWhenStockBelow = Number(fields.alertWhenStockBelow);

  if (!name || !barcode || !Number.isFinite(alertWhenStockBelow) || alertWhenStockBelow < 0) {
    return res.status(400).json({
      error: "Name, barcode, and alert threshold (≥0) required",
    });
  }

  let imageBlobId: number | null = existing.imageBlobId;
  const imageFile = files.image;
  if (imageFile && imageFile.buffer.length > 0) {
    const insertResult = await db.insert(blobs).values({
      data: imageFile.buffer,
      contentType: imageFile.type,
      filename: imageFile.name,
    });
    const newId = Array.isArray(insertResult)
      ? (insertResult[0] as { insertId?: number })?.insertId
      : (insertResult as { insertId?: number })?.insertId;
    if (newId != null) imageBlobId = newId;
  }

  await db
    .update(accessories)
    .set({
      name,
      barcode,
      alertWhenStockBelow,
      imageBlobId,
      updatedAt: new Date(),
    })
    .where(eq(accessories.id, id));
  return res.status(200).json({ ok: true });
}
