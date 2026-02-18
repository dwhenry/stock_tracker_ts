import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { hashPassword } from "@/lib/password";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { fields } = await parseForm(req);
  const name = (fields.name as string)?.trim();
  const email = (fields.email as string)?.trim()?.toLowerCase();
  const role = fields.role as string;
  const password = fields.password as string;

  if (!name || !email || !role || !password || password.length < 8) {
    return res.status(400).json({
      error: "Name, email, role, and password (min 8 chars) required",
    });
  }
  if (role !== "basic" && role !== "admin") {
    return res.status(400).json({ error: "Invalid role" });
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    name,
    email,
    role: role as "basic" | "admin",
    passwordHash,
  });
  return res.status(200).json({ ok: true });
}
