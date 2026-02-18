import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@stock-tracker/database/schema";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !role || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Name, email, role, and password (min 8 chars) required" },
      { status: 400 }
    );
  }
  if (role !== "basic" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    name,
    email,
    role: role as "basic" | "admin",
    passwordHash,
  });

  return NextResponse.json({ ok: true });
}
