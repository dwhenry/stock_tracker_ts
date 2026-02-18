import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { accessories, blobs } from "@stock-tracker/database/schema";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const barcode = (formData.get("barcode") as string)?.trim();
  const alertWhenStockBelow = Number(formData.get("alertWhenStockBelow"));
  const imageFile = formData.get("image") as File | null;

  if (!name || !barcode || !Number.isFinite(alertWhenStockBelow) || alertWhenStockBelow < 0) {
    return NextResponse.json(
      { error: "Name, barcode, and alert threshold (≥0) required" },
      { status: 400 }
    );
  }

  let imageBlobId: number | null = null;
  if (imageFile && imageFile.size > 0) {
    const buf = Buffer.from(await imageFile.arrayBuffer());
    const contentType = imageFile.type || "application/octet-stream";
    const filename = imageFile.name || "image";
    const [insertBlob] = await db.insert(blobs).values({
      data: buf,
      contentType,
      filename,
    });
    const result = Array.isArray(insertBlob)
      ? (insertBlob[0] as { insertId?: number })?.insertId
      : (insertBlob as { insertId?: number })?.insertId;
    if (result != null) imageBlobId = result;
  }

  await db.insert(accessories).values({
    name,
    barcode,
    alertWhenStockBelow,
    imageBlobId,
  });

  return NextResponse.json({ ok: true });
}
