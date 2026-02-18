import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { db } from "@stock-tracker/database";
import { users, passwordResetTokens } from "@stock-tracker/database/schema";
import { parseForm } from "@/lib/parse-form";

const RESET_EXPIRY_MS = 60 * 60 * 1000;

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { fields } = await parseForm(req);
  const email = (fields.email as string)?.trim()?.toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt });
  }

  return res.status(200).json({ ok: true });
}
