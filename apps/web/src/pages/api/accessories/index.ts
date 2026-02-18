import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { accessories, blobs } from "@stock-tracker/database/schema";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { fields, files } = await parseForm(req);
  const name = (fields.name as string)?.trim();
  const barcode = (fields.barcode as string)?.trim();
  const alertWhenStockBelow = Number(fields.alertWhenStockBelow);
  const imageFile = files.image;

  if (!name || !barcode || !Number.isFinite(alertWhenStockBelow) || alertWhenStockBelow < 0) {
    return res.status(400).json({
      error: "Name, barcode, and alert threshold (≥0) required",
    });
  }

  let imageBlobId: number | null = null;
  if (imageFile && imageFile.buffer.length > 0) {
    const insertResult = await db.insert(blobs).values({
      data: imageFile.buffer,
      contentType: imageFile.type,
      filename: imageFile.name,
    });
    const result = Array.isArray(insertResult)
      ? (insertResult[0] as { insertId?: number })?.insertId
      : (insertResult as { insertId?: number })?.insertId;
    if (result != null) imageBlobId = result;
  }

  await db.insert(accessories).values({
    name,
    barcode,
    alertWhenStockBelow,
    imageBlobId,
  });
  return res.status(200).json({ ok: true });
}
