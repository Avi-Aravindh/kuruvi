import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_COOKIE = "kuruvi_auth";

export async function POST() {
  const cookieStore = await cookies();

  // Clear auth token
  delete process.env.KURUVI_AUTH_TOKEN;

  // Delete cookie
  cookieStore.delete(AUTH_COOKIE);

  return NextResponse.json({ success: true });
}

export async function GET() {
  return POST();
}
