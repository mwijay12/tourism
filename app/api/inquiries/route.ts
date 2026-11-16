import { NextRequest, NextResponse } from "next/server";
import { sendExpeditionEmail } from "@/lib/server/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const guestName = String(body.guestName || "").trim();
    const guestEmail = String(body.guestEmail || "").trim();
    const focus = String(body.focus || "combo");
    const kiliRoute = String(body.kiliRoute || "lemosho");
    const selectedParks = Array.isArray(body.selectedParks)
      ? body.selectedParks.map(String)
      : [];
    const travelers = Math.max(1, Math.min(24, Number(body.travelers || 2)));
    const month = String(body.month || "July");
    const tier = String(body.tier || "Signature Tented");
    const totalDays = Number(body.totalDays || 10);
    const estimatePerPerson = Number(body.estimatePerPerson || 4500);

    if (!guestName || !guestEmail || !guestEmail.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Valid guest name and email are required." },
        { status: 400 }
      );
    }

    const summaryRows = [
      { label: "Traveler", value: `${guestName} (${travelers} guests)` },
      { label: "Departure Window", value: `${month} 2027` },
      { label: "Expedition Style", value: focus.toUpperCase() },
      ...(focus !== "safari"
        ? [{ label: "Kilimanjaro Trail", value: kiliRoute.toUpperCase() }]
        : []),
      ...(focus !== "kilimanjaro" && selectedParks.length > 0
        ? [{ label: "Parks", value: selectedParks.join(", ") }]
        : []),
      { label: "Caliber", value: tier },
      { label: "Suggested Span", value: `${totalDays} Days` },
      {
        label: "Guide Estimate",
        value: `$${estimatePerPerson.toLocaleString()} pp`,
      },
    ];

    // Send confirmation dossier to guest via Nodemailer
    const guestMail = await sendExpeditionEmail({
      to: guestEmail,
      subject: `Your Kibo & Plains Tanzania Dossier — ${totalDays} Days (${month} 2027)`,
      headline: "Asante sana — Your Dossier Request is Confirmed",
      greeting: `Jambo ${guestName},`,
      bodyParagraphs: [
        "Thank you for planning your Tanzania expedition with Kibo & Plains. Our Arusha and Moshi specialists are reviewing real-time camp availability, TANAPA permits, and domestic bush-flight routing for your dates.",
        "Below is a snapshot of your configured expedition dossier. One of our lead guides will respond within 12 hours with a tailored day-by-day route and invoice schedule.",
      ],
      summaryRows,
    });

    // Optionally notify Arusha concierge team inbox if ADMIN_NOTIFY_EMAIL is configured
    const adminInbox = process.env.ADMIN_NOTIFY_EMAIL;
    if (adminInbox) {
      await sendExpeditionEmail({
        to: adminInbox,
        replyTo: guestEmail,
        subject: `[New Safari Lead] ${guestName} · ${totalDays}D ${month} 2027`,
        headline: "New Tanzania Expedition Lead",
        bodyParagraphs: [
          `A new inquiry was submitted on Kibo & Plains by ${guestName} (${guestEmail}).`,
        ],
        summaryRows,
      }).catch(() => undefined);
    }

    return NextResponse.json({
      ok: true,
      mailSent: guestMail.sent,
      messageId: guestMail.messageId ?? null,
      note: guestMail.reason ?? "Dispatch email sent via Nodemailer.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to process inquiry.",
      },
      { status: 500 }
    );
  }
}
