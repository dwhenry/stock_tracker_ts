import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blobs } from "@stock-tracker/database/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [row] = await db
    .select()
    .from(blobs)
    .where(eq(blobs.id, id))
    .limit(1);

  if (!row) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = row.data instanceof Buffer ? row.data : Buffer.from(row.data);
  return new NextResponse(data, {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
