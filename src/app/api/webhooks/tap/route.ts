import { NextResponse } from "next/server";

// Fail closed until authenticated, idempotent provider processing is implemented.
// Do not acknowledge an unprocessed event as successfully recorded.
export async function POST() {
  return NextResponse.json({ error: "payments_not_enabled" }, { status: 503 });
}
