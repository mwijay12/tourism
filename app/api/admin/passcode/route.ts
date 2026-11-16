import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const submitted = String(body.passcode || "").trim();
    const expected = process.env.ADMIN_ACCESS_PASSWORD || "kibo2026";

    if (!submitted || submitted !== expected) {
      return NextResponse.json(
        { ok: false, error: "Incorrect admin access passcode." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      mode: process.env.ADMIN_ACCESS_PASSWORD ? "env_passcode" : "preview_passcode",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
