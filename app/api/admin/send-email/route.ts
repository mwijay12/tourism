import { NextRequest, NextResponse } from "next/server";
import { sendExpeditionEmail } from "@/lib/server/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const to = String(body.to || "").trim();
    const subject = String(body.subject || "").trim();
    const headline = String(
      body.headline || "Kibo & Plains Concierge Dispatch"
    ).trim();
    const message = String(body.message || "").trim();
    const guestName = String(body.guestName || "Explorer").trim();

    if (!to || !to.includes("@") || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Recipient email, subject, and message are required." },
        { status: 400 }
      );
    }

    const paragraphs = message
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const res = await sendExpeditionEmail({
      to,
      subject,
      headline,
      greeting: `Jambo ${guestName},`,
      bodyParagraphs: paragraphs,
    });

    if (!res.sent) {
      return NextResponse.json(
        {
          ok: false,
          configured: false,
          error:
            res.reason ||
            "Nodemailer SMTP credentials are not configured in .env.local yet.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      configured: true,
      messageId: res.messageId,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : "Failed to send email dispatch.",
      },
      { status: 500 }
    );
  }
}
