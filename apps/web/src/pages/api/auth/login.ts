import type { NextApiRequest, NextApiResponse } from "next";
import { eq } from "drizzle-orm";
import { db } from "@stock-tracker/database";
import { users } from "@stock-tracker/database/schema";
import { signToken, setSessionCookieRes } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { parseForm } from "@/lib/parse-form";

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { fields } = await parseForm(req);
  const email = (fields.email as string)?.trim()?.toLowerCase();
  const password = fields.password as string;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = await signToken({
    sub: String(user.id),
    email: user.email,
    role: user.role,
  });
  setSessionCookieRes(res, token);
  return res.status(200).json({ ok: true });
}
