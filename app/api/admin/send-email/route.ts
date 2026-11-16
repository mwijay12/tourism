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
    const templateType =
      body.templateType === "welcome" || body.templateType === "invoice"
        ? body.templateType
        : "quote";
    const summaryRows = Array.isArray(body.summaryRows)
      ? body.summaryRows
          .slice(0, 14)
          .map((r: { label?: unknown; value?: unknown }) => ({
            label: String(r.label || ""),
            value: String(r.value || ""),
          }))
      : undefined;

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

    const tripSteps =
      templateType === "welcome"
        ? [
            {
              step: "Sign in to your Private Client Portal",
              detail:
                "Access your live route milestones, KPAP crew allocation, packing dossier, and PDF cost invoices anytime with your Google account.",
            },
            {
              step: "Upload Passport Bio Page & Flight Arrival",
              detail:
                "Enables instant TANAPA Kilimanjaro gate clearance, Serengeti park passes, and JRO airport chauffeur dispatch.",
            },
            {
              step: "Medical & Dietary Preferences",
              detail:
                "Share altitude-sickness medication notes or camp dietary requests 21 days prior to landing in Kilimanjaro.",
            },
          ]
        : undefined;

    const res = await sendExpeditionEmail({
      to,
      subject,
      headline,
      greeting: `Karibu sana, ${guestName},`,
      bodyParagraphs: paragraphs,
      summaryRows,
      templateType,
      tripSteps,
      ctaLabel:
        templateType === "welcome"
          ? "Open Your Client Portal"
          : templateType === "invoice"
          ? "View Invoice in Portal"
          : "Open Expedition Dossier",
      ctaUrl: "https://kibo-plains-tanzania.vercel.app/portal",
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
