import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@stock-tracker/database/schema";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "DELETE") {
    await db.delete(customers).where(eq(customers.id, id));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST") {
    const { fields } = await parseForm(req);
    if (fields._method === "DELETE") {
      await db.delete(customers).where(eq(customers.id, id));
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
  const name = (fields.name as string)?.trim();
  const email = (fields.email as string)?.trim()?.toLowerCase();
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }
  await db.update(customers).set({ name, email, updatedAt: new Date() }).where(eq(customers.id, id));
  return res.status(200).json({ ok: true });
}
