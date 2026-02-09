import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

const AUTH_COOKIE = "kuruvi_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const expectedPassword = process.env.KURUVI_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }

    // Use timing-safe comparison
    const expectedHash = hashPassword(expectedPassword);
    const providedHash = hashPassword(password);

    if (!safeCompare(expectedHash, providedHash)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate auth token
    const authToken = randomBytes(32).toString("hex");

    // Store token in env for middleware validation
    // In production, use a database or Redis
    process.env.KURUVI_AUTH_TOKEN = authToken;

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
