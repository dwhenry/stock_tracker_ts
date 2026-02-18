import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@stock-tracker/database/schema";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email required" },
      { status: 400 }
    );
  }

  await db.insert(customers).values({ name, email });
  return NextResponse.json({ ok: true });
}
