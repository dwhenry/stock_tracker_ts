import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@stock-tracker/database";
import { users, passwordResetTokens } from "@stock-tracker/database/schema";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  const token = body.token;
  const password = body.password;
  if (!token || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Token and password (min 8 characters) required" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, row.userId));
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, row.id));

  return NextResponse.json({ ok: true });
}
