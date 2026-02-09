import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kuruvi_auth";

export async function GET(request: NextRequest) {
  const authToken = request.cookies.get(AUTH_COOKIE)?.value;
  const authenticated =
    !!authToken && authToken === process.env.KURUVI_AUTH_TOKEN;

  return NextResponse.json({ authenticated });
}
