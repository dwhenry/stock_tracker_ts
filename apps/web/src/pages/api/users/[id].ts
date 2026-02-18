import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { hashPassword } from "@/lib/password";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  if (req.method === "DELETE") {
    await db.delete(users).where(eq(users.id, id));
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST") {
    const { fields } = await parseForm(req);
    if (fields._method === "DELETE") {
      await db.delete(users).where(eq(users.id, id));
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
  const role = fields.role as string;
  const password = fields.password as string;

  if (!name || !role) {
    return res.status(400).json({ error: "Name and role required" });
  }
  if (role !== "basic" && role !== "admin") {
    return res.status(400).json({ error: "Invalid role" });
  }

  const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing) return res.status(404).json({ error: "User not found" });

  const updates: Partial<typeof users.$inferInsert> = {
    name,
    role: role as "basic" | "admin",
    updatedAt: new Date(),
  };
  if (password && password.length >= 8) {
    updates.passwordHash = await hashPassword(password);
  }
  await db.update(users).set(updates).where(eq(users.id, id));
  return res.status(200).json({ ok: true });
}
