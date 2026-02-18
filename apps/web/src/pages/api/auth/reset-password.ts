import type { NextApiRequest, NextApiResponse } from "next";
import { createHash } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@stock-tracker/database";
import { users, passwordResetTokens } from "@stock-tracker/database/schema";
import { hashPassword } from "@/lib/password";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  let body: { token?: string; password?: string };
  try {
    body = typeof req.body === "object" && req.body !== null ? (req.body as { token?: string; password?: string }) : {};
  } catch {
    return res.status(400).json({ error: "Invalid body" });
  }
  const token = body.token;
  const password = body.password;
  if (!token || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      error: "Token and password (min 8 characters) required",
    });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const now = new Date();
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!row) {
    return res.status(400).json({ error: "Invalid or expired reset link" });
  }

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, row.userId));
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, row.id));
  return res.status(200).json({ ok: true });
}
