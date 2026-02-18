import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blobs } from "@stock-tracker/database/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    res.status(404).end("Not found");
    return;
  }

  const [row] = await db.select().from(blobs).where(eq(blobs.id, id)).limit(1);
  if (!row) {
    res.status(404).end("Not found");
    return;
  }

  const data = row.data instanceof Buffer ? row.data : Buffer.from(row.data as unknown as ArrayBuffer);
  res.setHeader("Content-Type", row.contentType);
  res.setHeader("Cache-Control", "private, max-age=86400");
  res.status(200).send(data);
}
