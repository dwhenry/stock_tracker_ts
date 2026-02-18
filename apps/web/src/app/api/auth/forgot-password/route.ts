import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { db } from "@stock-tracker/database";
import { users, passwordResetTokens } from "@stock-tracker/database/schema";

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
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
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    // In a real app you would send an email with a link like:
    // ${origin}/reset-password?token=${token}
    // For now we don't send email (per requirements). Log or skip.
  }

  return NextResponse.json({ ok: true });
}
