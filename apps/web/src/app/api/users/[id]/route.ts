import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { hashPassword } from "@/lib/password";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!name || !role) {
    return NextResponse.json(
      { error: "Name and role required" },
      { status: 400 }
    );
  }
  if (role !== "basic" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updates: Partial<typeof users.$inferInsert> = {
    name,
    role: role as "basic" | "admin",
    updatedAt: new Date(),
  };
  if (password && password.length >= 8) {
    updates.passwordHash = await hashPassword(password);
  }

  await db.update(users).set(updates).where(eq(users.id, id));

  return NextResponse.json({ ok: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const formData = await request.formData();
  if (formData.get("_method") === "DELETE") {
    return DELETE(request, { params });
  }
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
