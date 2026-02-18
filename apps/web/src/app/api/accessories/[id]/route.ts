import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessories, blobs } from "@stock-tracker/database/schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

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

  const [existing] = await db
    .select()
    .from(accessories)
    .where(eq(accessories.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Accessory not found" }, { status: 404 });
  }

  let imageBlobId: number | null = existing.imageBlobId;
  if (imageFile && imageFile.size > 0) {
    const buf = Buffer.from(await imageFile.arrayBuffer());
    const contentType = imageFile.type || "application/octet-stream";
    const filename = imageFile.name || "image";
    const insertResult = await db.insert(blobs).values({
      data: buf,
      contentType,
      filename,
    });
    const newId = Array.isArray(insertResult)
      ? (insertResult[0] as { insertId?: number })?.insertId
      : (insertResult as { insertId?: number })?.insertId;
    if (newId != null) {
      imageBlobId = newId;
    }
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

  return NextResponse.json({ ok: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const formData = await request.formData();
  if (formData.get("_method") === "DELETE") {
    return DELETE(request, { params });
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.delete(accessories).where(eq(accessories.id, id));
  return NextResponse.json({ ok: true });
}
