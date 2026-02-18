import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { verifyPassword, hashPassword } from "@/lib/password";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getSessionFromRequest(req);
    if (!session) return res.status(200).json({ user: null });
    return res.status(200).json({ user: { email: session.email, role: session.role } });
  }
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  let body: { currentPassword?: string; password?: string; passwordConfirmation?: string };
  try {
    body = typeof req.body === "object" && req.body !== null ? (req.body as typeof body) : {};
  } catch {
    return res.status(400).json({ error: "Invalid body" });
  }
  const currentPassword = body.currentPassword;
  const password = body.password;
  const passwordConfirmation = body.passwordConfirmation;

  if (!currentPassword) {
    return res.status(400).json({ error: "Current password is required" });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  if (password !== passwordConfirmation) {
    return res.status(400).json({ error: "New password and confirmation don't match" });
  }

  const userId = Number(session.sub);
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found" });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  return res.status(200).json({ ok: true });
}
