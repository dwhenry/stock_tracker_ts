import { NextRequest, NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await deleteSessionCookie();
  const url = new URL("/login", request.nextUrl.origin);
  return NextResponse.redirect(url);
}
