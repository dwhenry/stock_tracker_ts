import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { customers } from "@stock-tracker/database/schema";
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
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }
  await db.insert(customers).values({ name, email });
  return res.status(200).json({ ok: true });
}
